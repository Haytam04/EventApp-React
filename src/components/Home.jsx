import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, addDoc, query, where } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { X } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [participations, setParticipations] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null); // State for the popup

  const fetchEvents = async () => {
    const eventsSnapshot = await getDocs(collection(db, 'events'));
    const allEvents = eventsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    
    const otherUsersEvents = user ? allEvents.filter(e => e.userId !== user.uid) : allEvents;
    setEvents(otherUsersEvents);

    if (user) {
      const pQuery = query(collection(db, 'participations'), where("userId", "==", user.uid));
      const pSnapshot = await getDocs(pQuery);
      setParticipations(pSnapshot.docs.map(doc => doc.data().eventId));
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const handleParticipate = async (event) => {
    if (!user) {
      alert("You must be logged in to participate!");
      return;
    }

    const placesDisponible = event.capacity - event.participantsCount;

    if (placesDisponible > 0) {
      try {
        await addDoc(collection(db, 'participations'), {
          userId: user.uid,
          eventId: event.id,
          joinedAt: new Date()
        });

        const eventRef = doc(db, 'events', event.id);
        await updateDoc(eventRef, { participantsCount: event.participantsCount + 1 });

        alert("Successfully joined the event!");
        fetchEvents();
        if (selectedEvent) setSelectedEvent(null); // Close modal on success
      } catch (error) {
        console.error("Error participating:", error);
      }
    } else {
      alert("Sorry, this event is full!");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Discover Events</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => {
          const placesDisponible = event.capacity - event.participantsCount;
          const isParticipating = participations.includes(event.id);

          return (
            <div 
              key={event.id} 
              onClick={() => setSelectedEvent(event)}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer flex flex-col"
            >
              {event.imageUrl ? (
                <img src={event.imageUrl} alt={event.name} className="w-full h-48 object-cover" />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">No Image</div>
              )}
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold">{event.name}</h3>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-semibold">
                    {event.category}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                
                <div className="text-sm text-gray-500 mb-4 space-y-1 flex-1">
                  <p>📅 {event.date}</p>
                  <p>📍 {event.location}</p>
                  <p className="font-semibold text-gray-800">
                    🎟️ {placesDisponible} places left
                  </p>
                </div>

                <button 
                  onClick={(e) => {
                    e.stopPropagation(); // Prevents the card click from firing when clicking the button
                    handleParticipate(event);
                  }}
                  disabled={placesDisponible === 0 || isParticipating}
                  className={`w-full py-2 rounded-lg font-bold transition mt-auto ${
                    isParticipating ? 'bg-green-100 text-green-700 cursor-not-allowed'
                    : placesDisponible === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isParticipating ? '✓ Joined' : placesDisponible === 0 ? 'Full' : 'Participate'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL POPUP */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button 
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 bg-white p-1 rounded-full shadow hover:bg-gray-100 text-gray-600"
            >
              <X size={24} />
            </button>

            {selectedEvent.imageUrl && (
              <img src={selectedEvent.imageUrl} alt={selectedEvent.name} className="w-full h-64 object-cover rounded-t-2xl" />
            )}
            
            <div className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold text-sm">
                  {selectedEvent.category}
                </span>
                <span className="text-gray-500 text-sm">Organized by {selectedEvent.creatorName}</span>
              </div>

              <h2 className="text-3xl font-bold mb-4">{selectedEvent.name}</h2>
              <p className="text-gray-700 text-lg mb-6 whitespace-pre-wrap">{selectedEvent.description}</p>
              
              <div className="bg-gray-50 p-4 rounded-xl mb-6 space-y-2 text-gray-700">
                <p><strong>📅 Date:</strong> {selectedEvent.date}</p>
                <p><strong>📍 Location:</strong> {selectedEvent.location}</p>
                <p><strong>🎟️ Capacity:</strong> {selectedEvent.capacity} total places</p>
                <p><strong>👥 Available:</strong> {selectedEvent.capacity - selectedEvent.participantsCount} places left</p>
              </div>

              <button 
                onClick={() => handleParticipate(selectedEvent)}
                disabled={(selectedEvent.capacity - selectedEvent.participantsCount) === 0 || participations.includes(selectedEvent.id)}
                className="w-full py-3 rounded-xl font-bold text-lg transition bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {participations.includes(selectedEvent.id) ? 'You have joined this event' : 'Participate Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;