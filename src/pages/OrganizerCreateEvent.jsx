import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function OrganizerCreateEvent() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [venue, setVenue] = useState("");
  const [capacity, setCapacity] = useState("");
  // New State Variables
  const [repName, setRepName] = useState("");
  const [repPhone, setRepPhone] = useState("");
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSaving(true);
      setError("");

      const newEventRef = await addDoc(collection(db, "events"), {
        title,
        description,
        venue,
        capacity: Number(capacity),
        date: new Date(date),
        representativeName: repName, // Added to DB
        representativePhone: repPhone, // Added to DB
        organizerId: user.uid,
        isPublished: false, // Start as draft
        registeredCount: 0,
        createdAt: serverTimestamp(),
      });

      navigate(`/organizer/events/edit/${newEventRef.id}`); 

    } catch (err) {
      setError("Failed to create event. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] font-['Inter'] text-white">
      <Navbar />
      <div className="pt-32 px-6 max-w-2xl mx-auto pb-10">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-black mb-2 tracking-tight">
            Launch <span className="text-[#06B6D4]">Event</span>
          </h1>
          <p className="text-[#CBD5E1]/50 text-sm italic">Get the hype started for your campus activity</p>
        </header>

        {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-center text-sm font-bold">
                {error}
            </div>
        )}

        <form onSubmit={handleCreate} className="space-y-6 bg-[#0F172A]/50 border border-white/10 p-8 rounded-3xl shadow-2xl backdrop-blur-xl">
          {/* Event Title */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-[#06B6D4] ml-1">Event Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full p-4 bg-white/5 border border-white/10 rounded-xl focus:ring-1 focus:ring-[#06B6D4] outline-none transition-all font-bold text-lg" />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-[#06B6D4] ml-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required className="w-full p-4 bg-white/5 border border-white/10 rounded-xl focus:ring-1 focus:ring-[#06B6D4] outline-none transition-all h-32 resize-none text-[#CBD5E1]" />
          </div>

          {/* Date and Capacity Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-[#06B6D4] ml-1">Date & Time</label>
              <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required className="w-full p-4 bg-white/5 border border-white/10 rounded-xl focus:ring-1 focus:ring-[#06B6D4] outline-none transition-all text-sm font-mono" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-[#06B6D4] ml-1">Total Capacity</label>
              <input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} required className="w-full p-4 bg-white/5 border border-white/10 rounded-xl focus:ring-1 focus:ring-[#06B6D4] outline-none transition-all text-sm font-mono" />
            </div>
          </div>

          {/* Representative Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-[#06B6D4] ml-1">Representative Name</label>
              <input value={repName} onChange={(e) => setRepName(e.target.value)} required placeholder="John Doe" className="w-full p-4 bg-white/5 border border-white/10 rounded-xl focus:ring-1 focus:ring-[#06B6D4] outline-none transition-all text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-[#06B6D4] ml-1">Representative Phone</label>
              <input type="tel" value={repPhone} onChange={(e) => setRepPhone(e.target.value)} required placeholder="+1 234..." className="w-full p-4 bg-white/5 border border-white/10 rounded-xl focus:ring-1 focus:ring-[#06B6D4] outline-none transition-all text-sm font-mono" />
            </div>
          </div>

          {/* Venue Location */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-[#06B6D4] ml-1">Venue Location</label>
            <input value={venue} onChange={(e) => setVenue(e.target.value)} required className="w-full p-4 bg-white/5 border border-white/10 rounded-xl focus:ring-1 focus:ring-[#06B6D4] outline-none transition-all" />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/organizer/dashboard")}
              className="flex-1 py-4 rounded-xl font-bold border border-white/10 hover:bg-white/5 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-4 bg-[#A855F7] hover:bg-[#9333EA] text-white rounded-xl font-black shadow-lg shadow-[#A855F7]/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {saving ? "LAUNCHING SATELLITE..." : "CREATE EVENT (DRAFT)"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}