import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  increment,
} from "firebase/firestore"
import { db } from "./firebase"

export async function registerForEvent(eventId, user, formData) {
  if (!user) {
    throw new Error("User not authenticated")
  }

  const registrationRef = doc(
    db,
    "events",
    eventId,
    "registrations",
    user.uid
  )                         //points to events/{eventId}/registrations/{userUID}

  const existingRegistration = await getDoc(registrationRef)

  if (existingRegistration.exists()) {
    throw new Error("You have already registered for this event")
  }

  // Create registration
  await setDoc(registrationRef, {
    name: formData.name,
    studentId: formData.studentId,
    email: user.email,
    registeredAt: serverTimestamp(),
  })

  // Increment registered count
  const eventRef = doc(db, "events", eventId)
  await updateDoc(eventRef, {
    registeredCount: increment(1),
  })
}
