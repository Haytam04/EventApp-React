import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Calendar } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJoinedEvents = async () => {
      if (!user) return;

      try {
        // 1. Get the list of event IDs the user participated in
        const pQuery = query(collection(db, 'participations'), where("userId", "==", user.uid));
        const pSnapshot = await getDocs(pQuery);
        const eventIds = pSnapshot.docs.map(doc => doc.data().eventId);

        if (eventIds.length > 0) {
          // 2. Fetch the actual event details for those IDs
          const eventsData = [];
          for (const eventId of eventIds) {
            const eventDoc = await getDoc(doc(db, 'events', eventId));
            if (eventDoc.exists()) {
              eventsData.push({ ...eventDoc.data(), id: eventDoc.id });
            }
          }
          setJoinedEvents(eventsData);
        }
      } catch (error) {
        console.error("Error fetching joined events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJoinedEvents();
  }, [user]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Profile Info Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
        <div className="flex items-center gap-6">
          <div className="bg-blue-100 p-4 rounded-full text-blue-600">
            <User size={40} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{user?.displayName || "User"}</h1>
            <div className="flex items-center gap-2 text-gray-500 mt-1">
              <Mail size={16} />
              <span>{user?.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Participated Events List */}
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <Calendar className="text-blue-600" />
        Events I'm Attending
      </h2>

      <div className="grid gap-4">
        {loading ? (
          <p className="text-gray-500">Loading your events...</p>
        ) : joinedEvents.length === 0 ? (
          <div className="bg-white p-10 rounded-xl border border-dashed border-gray-300 text-center text-gray-500">
            You haven't joined any events yet. Browse the home page to find something interesting!
          </div>
        ) : (
          joinedEvents.map(event => (
            <div key={event.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
              {event.imageUrl ? (
                <img src={event.imageUrl} alt={event.name} className="w-20 h-20 object-cover rounded-lg" />
              ) : (
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">No Image</div>
              )}
              
              <div className="flex-1">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{event.category}</span>
                <h3 className="font-bold text-lg text-gray-800">{event.name}</h3>
                <p className="text-sm text-gray-500">📅 {event.date} • 📍 {event.location}</p>
              </div>
              
              <div className="hidden md:block text-right px-4">
                <span className="text-xs text-gray-400 block mb-1">Status</span>
                <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-bold">
                  Confirmed
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Profile;