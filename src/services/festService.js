import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  runTransaction,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore"
import { db } from "./firebase"

// --- Fest Operations ---
export async function listFests() {
  const snapshot = await getDocs(collection(db, "fests"))
  return snapshot.docs.map((fest) => ({ id: fest.id, ...fest.data() }))
}

export async function getFestById(festId) {
  const festDoc = await getDoc(doc(db, "fests", festId))
  if (!festDoc.exists()) return null
  return { id: festDoc.id, ...festDoc.data() }
}

export async function createFest(formData, user) {
  try {
    const festData = {
      ...formData,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, "fests"), festData);
    return docRef.id;
  } catch (error) {
    throw error;
  }
}

export async function updateFest(festId, formData) {
  try {
    const festRef = doc(db, "fests", festId);
    await updateDoc(festRef, {
      ...formData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw error;
  }
}

// --- UNIFIED Event Operations ---
export async function addFestEvent(festId, payload, user) {
  await addDoc(collection(db, "events"), {
    ...payload,
    festId: festId, // Link to the fest
    organizerId: user.uid,
    isPublished: true, 
    registeredCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

// FIXED: Uncommented and properly exported this function to resolve the SyntaxError
export async function updateFestEvent(eventId, payload) {
  await updateDoc(doc(db, "events", eventId), {
    ...payload,
    updatedAt: serverTimestamp(),
  })
}

export async function removeFestEvent(eventId) {
  await deleteDoc(doc(db, "events", eventId))
}

export async function registerForFestEvent(eventId, user, payload) {
  if (!user) throw new Error("Please login first")
  const eventRef = doc(db, "events", eventId)
  const regRef = doc(db, "events", eventId, "registrations", user.uid)

  await runTransaction(db, async (transaction) => {
    const eventSnap = await transaction.get(eventRef)
    const regSnap = await transaction.get(regRef)
    if (!eventSnap.exists()) throw new Error("Event not found")
    if (regSnap.exists()) throw new Error("Already registered")

    const eventData = eventSnap.data()
    if ((eventData.registeredCount || 0) >= (eventData.capacity || eventData.seats)) {
      throw new Error("This event is full")
    }

    transaction.update(eventRef, {
      registeredCount: increment(1),
      updatedAt: serverTimestamp(),
    })
    transaction.set(regRef, {
      ...payload,
      userId: user.uid,
      email: user.email,
      createdAt: serverTimestamp(),
    })
  })
}

export async function listFestEventRegistrations(festId, eventId) {
  const snapshot = await getDocs(collection(db, "fests", festId, "events", eventId, "registrations"))
  return snapshot.docs.map((reg) => ({ id: reg.id, ...reg.data() }))
}