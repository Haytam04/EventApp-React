import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { uploadImage } from '../utils/uploadImage'; 
import { Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CreateEvent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', date: '', category: '', description: '', location: '', capacity: ''
  });

  const categoriesRef = collection(db, 'categories');

  useEffect(() => {
    const fetchCategories = async () => {
      const catData = await getDocs(categoriesRef);
      setCategories(catData.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = "";
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      await addDoc(collection(db, 'events'), {
        ...formData,
        capacity: Number(formData.capacity),
        participantsCount: 0,
        imageUrl: imageUrl,
        userId: user.uid,
        creatorName: user.displayName || "Anonymous"
      });

      alert("Event Created Successfully!");
      navigate('/my-events'); // Send them to their events list after creating
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Failed to create event.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">Create New Event</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Event Name" required 
            value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          
          <div className="grid grid-cols-2 gap-4">
            <input type="date" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required 
              value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
            
            <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required
              value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
              <option value="">Select Category</option>
              {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Location" required 
              value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
            
            <input type="number" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Total Capacity" required min="1"
              value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: e.target.value})} />
          </div>

          <textarea className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Detailed Description" rows="4" required
            value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
          
          <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg bg-gray-50 flex items-center gap-3">
            <ImageIcon className="text-gray-500" size={28} />
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="w-full text-sm text-gray-500" />
          </div>

          <button disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 font-bold text-lg transition-colors">
            {loading ? "Publishing..." : "Publish Event"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;