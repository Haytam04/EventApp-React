import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Trash2, Edit3, Plus } from 'lucide-react';

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const categoriesRef = collection(db, 'categories');

  // Fetch Categories
  const fetchCategories = async () => {
    const data = await getDocs(categoriesRef);
    setCategories(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Create
  const addCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    await addDoc(categoriesRef, { name: newCategory });
    setNewCategory('');
    fetchCategories();
  };

  // Delete
  const deleteCategory = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      await deleteDoc(doc(db, 'categories', id));
      fetchCategories();
    }
  };

  // Update
  const updateCategory = async (id) => {
    await updateDoc(doc(db, 'categories', id), { name: editValue });
    setEditingId(null);
    fetchCategories();
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Manage Categories</h2>

      {/* Add Form */}
      <form onSubmit={addCategory} className="flex gap-2 mb-8">
        <input
          type="text"
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="New Category Name (e.g., Music, Sports)"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-1">
          <Plus size={20} /> Add
        </button>
      </form>

      {/* List */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center justify-between p-4 border-b last:border-0 hover:bg-gray-50">
            {editingId === cat.id ? (
              <input
                className="flex-1 p-1 border rounded"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => updateCategory(cat.id)}
                autoFocus
              />
            ) : (
              <span className="text-gray-700 font-medium">{cat.name}</span>
            )}

            <div className="flex gap-3">
              <button 
                onClick={() => { setEditingId(cat.id); setEditValue(cat.name); }}
                className="text-gray-500 hover:text-blue-600"
              >
                <Edit3 size={18} />
              </button>
              <button 
                onClick={() => deleteCategory(cat.id)}
                className="text-gray-500 hover:text-red-600"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryManager;