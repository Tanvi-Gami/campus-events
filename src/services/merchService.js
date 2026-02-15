import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore"
import { db } from "./firebase"

export async function listMerchItems() {
  const snapshot = await getDocs(collection(db, "merch"))
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
}

export async function createMerchItem(payload, organizer) {
  if (!organizer) throw new Error("Organizer not authenticated")
  await addDoc(collection(db, "merch"), {
    ...payload,
    createdBy: organizer.uid,
    createdByEmail: organizer.email,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function updateMerchItem(merchId, payload) {
  await updateDoc(doc(db, "merch", merchId), {
    ...payload,
    updatedAt: serverTimestamp(),
  })
}

export async function removeMerchItem(merchId) {
  await deleteDoc(doc(db, "merch", merchId))
}

export async function placeMerchOrder(merchId, user, payload) {
  if (!user) throw new Error("Please login before ordering")

  const merchRef = doc(db, "merch", merchId)
  const orderRef = doc(collection(db, "merch", merchId, "orders"))

  await runTransaction(db, async (transaction) => {
    const merchSnap = await transaction.get(merchRef)
    if (!merchSnap.exists()) throw new Error("Merch item not found")

    const merchData = merchSnap.data()
    const selectedSize = merchData.sizeChart?.find((size) => size.size === payload.selectedSize)

    if (!selectedSize) throw new Error("Selected size is not available")
    if (selectedSize.available <= 0) throw new Error("Selected size is out of stock")

    const updatedSizeChart = merchData.sizeChart.map((size) =>
      size.size === payload.selectedSize
        ? { ...size, available: Math.max(0, size.available - 1) }
        : size
    )

    transaction.update(merchRef, {
      sizeChart: updatedSizeChart,
      stock: increment(-1),
      updatedAt: serverTimestamp(),
    })

    transaction.set(orderRef, {
      ...payload,
      orderedBy: user.uid,
      orderedByEmail: user.email,
      status: "pending_verification",
      createdAt: serverTimestamp(),
    })
  })
}

export async function listMerchOrders(merchId) {
  const snapshot = await getDocs(collection(db, "merch", merchId, "orders"))
  return snapshot.docs.map((order) => ({ id: order.id, ...order.data() }))
}

export async function updateMerchOrderStatus(merchId, orderId, status) {
  await setDoc(
    doc(db, "merch", merchId, "orders", orderId),
    { status, reviewedAt: serverTimestamp() },
    { merge: true }
  )
}
