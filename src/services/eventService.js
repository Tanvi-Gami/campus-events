import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "./firebase"

export async function createEvent(eventData, organizer) {
  if (!organizer) {
    throw new Error("Organizer not authenticated")
  }

  const eventRef = collection(db, "events")

  await addDoc(eventRef, {
    title: eventData.title,
    description: eventData.description,
    date: eventData.date,
    venue: eventData.venue,
    capacity: eventData.capacity,
    registeredCount: 0,
    organizerId: organizer.uid,
    organizerEmail: organizer.email,
    isPublished: true,
    createdAt: serverTimestamp(),
  })
}
