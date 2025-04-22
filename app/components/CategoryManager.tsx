import React, { useState, useEffect } from 'react';
import { getCategories, addCategory, deleteCategory } from '../utils/storage';

interface CategoryManagerProps {
  onCategoryUpdate: () => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ onCategoryUpdate }) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Load categories on component mount
    setCategories(getCategories());
  }, []);

  const handleAddCategory = () => {
    // Input validation
    if (!newCategory.trim()) {
      setError('Category name cannot be empty');
      return;
    }

    if (categories.includes(newCategory.trim())) {
      setError('Category already exists');
      return;
    }

    // Add category and update state
    addCategory(newCategory.trim());
    setCategories(getCategories());
    setNewCategory('');
    setError('');
    onCategoryUpdate();
  };

  const handleDeleteCategory = (category: string) => {
    deleteCategory(category);
    setCategories(getCategories());
    onCategoryUpdate();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Category Management</h2>
      
      <div className="mb-6">
        <div className="flex space-x-2">
          <input
            type="text"
            className="flex-grow p-2 border rounded-md"
            placeholder="New category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <button
            onClick={handleAddCategory}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Add
          </button>
        </div>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
      
      <div>
        <h3 className="font-semibold mb-2">Existing Categories</h3>
        {categories.length === 0 ? (
          <p className="text-gray-500 text-sm">No categories found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {categories.map((category) => (
              <div key={category} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                <span>{category}</span>
                <button
                  onClick={() => handleDeleteCategory(category)}
                  className="text-red-600 hover:text-red-900 text-sm"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryManager; 