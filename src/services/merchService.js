import {
  doc,
  runTransaction,
  collection,
  serverTimestamp
} from "firebase/firestore"
import {
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage"
import { db, storage } from "./firebase"

// Upload screenshot first
export async function uploadPaymentScreenshot(
  file,
  merchId,
  orderId
) {
  const storageRef = ref(
    storage,
    `orderScreenshots/${merchId}/${orderId}`
  )

  await uploadBytes(storageRef, file)
  return await getDownloadURL(storageRef)
}

// Place order (transaction safe)
export async function placeMerchOrder(
  merchId,
  user,
  orderData
) {
  const merchRef = doc(db, "merch", merchId)
  const orderRef = doc(
    collection(db, "merch", merchId, "orders"),
    orderData.orderId
  )

  await runTransaction(db, async (transaction) => {
    const merchSnap = await transaction.get(merchRef)

    if (!merchSnap.exists()) {
      throw new Error("Merch not found")
    }

    const merch = merchSnap.data()

    const sizeIndex = merch.sizeChart.findIndex(
      (s) => s.size === orderData.selectedSize
    )

    if (sizeIndex === -1)
      throw new Error("Invalid size")

    if (merch.sizeChart[sizeIndex].available <= 0)
      throw new Error("Out of stock")

    merch.sizeChart[sizeIndex].available -= 1
    merch.totalStock -= 1

    transaction.update(merchRef, {
      sizeChart: merch.sizeChart,
      totalStock: merch.totalStock
    })

    transaction.set(orderRef, {
      userId: user.uid,
      name: orderData.name,
      studentId: orderData.studentId,
      phone: orderData.phone,
      selectedSize: orderData.selectedSize,
      transactionId: orderData.transactionId,
      paymentScreenshotUrl:
        orderData.paymentScreenshotUrl,
      status: "pending",
      createdAt: serverTimestamp()
    })
  })
}

// Approve / Reject order
export async function updateOrderStatus(
  merchId,
  orderId,
  newStatus
) {
  const merchRef = doc(db, "merch", merchId)
  const orderRef = doc(
    db,
    "merch",
    merchId,
    "orders",
    orderId
  )

  await runTransaction(db, async (transaction) => {
    const merchSnap = await transaction.get(merchRef)
    const orderSnap = await transaction.get(orderRef)

    if (!merchSnap.exists() || !orderSnap.exists())
      throw new Error("Invalid request")

    const merch = merchSnap.data()
    const order = orderSnap.data()

    if (order.status !== "pending")
      throw new Error("Already processed")

    if (newStatus === "rejected") {
      const sizeIndex = merch.sizeChart.findIndex(
        (s) => s.size === order.selectedSize
      )

      if (sizeIndex !== -1) {
        merch.sizeChart[sizeIndex].available += 1
        merch.totalStock += 1
      }

      transaction.update(merchRef, {
        sizeChart: merch.sizeChart,
        totalStock: merch.totalStock
      })
    }

    transaction.update(orderRef, {
      status: newStatus
    })
  })
}
