import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, deleteDoc, doc, query, where, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Trash2, Edit3, X, Image as ImageIcon } from 'lucide-react';
import { uploadImage } from '../utils/uploadImage';

const MyEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  // Form State for Editing
  const [currentEvent, setCurrentEvent] = useState(null);
  const [formData, setFormData] = useState({
    name: '', date: '', category: '', description: '', location: '', capacity: ''
  });

  const fetchMyEvents = async () => {
    if (user) {
      const q = query(collection(db, 'events'), where("userId", "==", user.uid));
      const eventData = await getDocs(q);
      setEvents(eventData.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    }
  };

  const fetchCategories = async () => {
    const catData = await getDocs(collection(db, 'categories'));
    setCategories(catData.docs.map(doc => ({ ...doc.data(), id: doc.id })));
  };

  useEffect(() => {
    fetchMyEvents();
    fetchCategories();
  }, [user]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      await deleteDoc(doc(db, 'events', id));
      fetchMyEvents();
    }
  };

  // Open Edit Modal and pre-fill form
  const startEdit = (event) => {
    setCurrentEvent(event);
    setFormData({
      name: event.name,
      date: event.date,
      category: event.category,
      description: event.description,
      location: event.location,
      capacity: event.capacity
    });
    setIsEditing(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalImageUrl = currentEvent.imageUrl;

      // If a new image was selected, upload it first
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile);
      }

      const eventRef = doc(db, 'events', currentEvent.id);
      await updateDoc(eventRef, {
        ...formData,
        capacity: Number(formData.capacity),
        imageUrl: finalImageUrl
      });

      alert("Event updated successfully!");
      setIsEditing(false);
      setImageFile(null);
      fetchMyEvents();
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Failed to update event.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">My Hosted Events</h2>
      
      <div className="grid gap-4">
        {events.length === 0 && (
          <div className="bg-white p-8 rounded-xl shadow text-center text-gray-500">
            You haven't created any events yet.
          </div>
        )}
        
        {events.map(event => (
          <div key={event.id} className="bg-white p-5 rounded-xl shadow flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-5 w-full">
              {event.imageUrl ? (
                <img src={event.imageUrl} alt="event" className="w-24 h-24 object-cover rounded-lg" />
              ) : (
                <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">No Image</div>
              )}
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded font-semibold">{event.category}</span>
                </div>
                <h3 className="font-bold text-xl text-gray-800">{event.name}</h3>
                <p className="text-sm text-gray-500 mb-2">📅 {event.date} • 📍 {event.location}</p>
                <p className="text-sm font-medium text-blue-600 bg-blue-50 inline-block px-2 py-1 rounded">
                  Spots Filled: {event.participantsCount} / {event.capacity}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => startEdit(event)} 
                className="text-blue-500 hover:text-blue-700 bg-blue-50 p-3 rounded-lg hover:bg-blue-100 transition"
                title="Edit Event"
              >
                <Edit3 size={24} />
              </button>
              <button 
                onClick={() => handleDelete(event.id)} 
                className="text-red-500 hover:text-red-700 bg-red-50 p-3 rounded-lg hover:bg-red-100 transition"
                title="Delete Event"
              >
                <Trash2 size={24} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT MODAL */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative p-8">
            <button 
              onClick={() => setIsEditing(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold mb-6">Edit Event</h2>
            
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
                <input className="w-full p-2 border rounded" required 
                  value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" className="w-full p-2 border rounded" required 
                    value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select className="w-full p-2 border rounded" required
                    value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                    {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input className="w-full p-2 border rounded" required 
                    value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Capacity</label>
                  <input type="number" className="w-full p-2 border rounded" required min="1"
                    value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea className="w-full p-2 border rounded" rows="3" required
                  value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
              
              <div className="border p-3 rounded bg-gray-50">
                <label className="block text-sm font-medium text-gray-700 mb-2">Change Image (Optional)</label>
                <div className="flex items-center gap-3">
                  <ImageIcon className="text-gray-400" />
                  <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="text-sm text-gray-500" />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </button>
                <button 
                  disabled={loading}
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold disabled:bg-blue-300"
                >
                  {loading ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyEvents;