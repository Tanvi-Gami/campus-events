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

export async function listFests() {
  const snapshot = await getDocs(collection(db, "fests"))
  return snapshot.docs.map((fest) => ({ id: fest.id, ...fest.data() }))
}

export async function getFestById(festId) {
  const festDoc = await getDoc(doc(db, "fests", festId))
  if (!festDoc.exists()) return null

  const eventsSnap = await getDocs(collection(db, "fests", festId, "events"))

  return {
    id: festDoc.id,
    ...festDoc.data(),
    events: eventsSnap.docs.map((event) => ({ id: event.id, ...event.data() })),
  }
}

export async function createFest(payload, organizer) {
  if (!organizer) throw new Error("Organizer not authenticated")
  await addDoc(collection(db, "fests"), {
    ...payload,
    createdBy: organizer.uid,
    createdByEmail: organizer.email,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function updateFest(festId, payload) {
  await updateDoc(doc(db, "fests", festId), {
    ...payload,
    updatedAt: serverTimestamp(),
  })
}

export async function addFestEvent(festId, payload) {
  await addDoc(collection(db, "fests", festId, "events"), {
    ...payload,
    registrations: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function updateFestEvent(festId, eventId, payload) {
  await updateDoc(doc(db, "fests", festId, "events", eventId), {
    ...payload,
    updatedAt: serverTimestamp(),
  })
}

export async function removeFestEvent(festId, eventId) {
  await deleteDoc(doc(db, "fests", festId, "events", eventId))
}

export async function registerForFestEvent(festId, eventId, user, payload) {
  if (!user) throw new Error("Please login first")

  const eventRef = doc(db, "fests", festId, "events", eventId)
  const regRef = doc(db, "fests", festId, "events", eventId, "registrations", user.uid)

  await runTransaction(db, async (transaction) => {
    const eventSnap = await transaction.get(eventRef)
    const regSnap = await transaction.get(regRef)

    if (!eventSnap.exists()) throw new Error("Fest event not found")
    if (regSnap.exists()) throw new Error("You are already registered for this event")

    const eventData = eventSnap.data()
    if (eventData.registrations >= eventData.seats) {
      throw new Error("This event is full")
    }

    transaction.update(eventRef, {
      registrations: increment(1),
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
