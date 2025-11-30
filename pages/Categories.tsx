
import React, { useState } from 'react';
import { Tag, Plus, Lightbulb } from 'lucide-react';
import { Button } from '../components/Button';
import { Category, StoreProfile } from '../types';
import { suggestCategories } from '../services/geminiService';
import { BackendlessService, isBackendlessConfigured } from '../services/backendless';

interface CategoriesProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  storeProfile: StoreProfile | null;
}

export const Categories: React.FC<CategoriesProps> = ({ categories, setCategories, storeProfile }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setIsSaving(true);
    try {
      const newCat: Category = {
        id: Math.random().toString(36).substr(2, 9), // Temp ID if offline
        name: newCategoryName,
        productCount: 0
      };

      if (isBackendlessConfigured()) {
          // @ts-ignore
          const savedCat = await BackendlessService.data.categories.save({
              name: newCategoryName,
              productCount: 0
          });
          // Update with real ID from Backendless
          newCat.id = savedCat.objectId;
          newCat.merchantId = savedCat.merchantId;
      }

      setCategories([...categories, newCat]);
      setNewCategoryName('');
      setIsModalOpen(false);
    } catch (error) {
        console.error("Failed to add category", error);
        alert("Failed to create category");
    } finally {
        setIsSaving(false);
    }
  };

  const handleSuggest = async () => {
    if (!storeProfile?.storeType) return;
    setIsSuggesting(true);
    const suggestions = await suggestCategories(storeProfile.storeType);
    if (suggestions.length > 0) {
      setNewCategoryName(suggestions[0]); // Pick first one for demo
    }
    setIsSuggesting(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
          <p className="text-sm text-gray-500 mt-1">Organize your products into categories for better management</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => {}}>Refresh</Button>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 border-dashed min-h-[400px] flex flex-col items-center justify-center text-center p-8">
        {categories.length === 0 ? (
          <>
            <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mb-4 transform rotate-12 transition-transform hover:rotate-0">
               <Tag className="w-8 h-8 text-ayoo-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No categories yet</h3>
            <p className="text-gray-500 max-w-sm mb-8">Create your first category to start organizing your products</p>
            <Button variant="primary" size="lg" onClick={() => setIsModalOpen(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Category
            </Button>
          </>
        ) : (
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 self-start">
             {categories.map(cat => (
               <div key={cat.id} className="bg-white border border-gray-200 rounded-lg p-4 text-left shadow-sm hover:border-ayoo-300 transition-colors">
                  <h4 className="font-semibold text-gray-900">{cat.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">{cat.productCount} products</p>
               </div>
             ))}
          </div>
        )}
      </div>

      <div className="mt-8 bg-pink-50 rounded-xl p-6 border border-pink-100">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">Category Tips</h3>
        </div>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-ayoo-500">•</span>
            Categories help customers find products easily
          </li>
          <li className="flex items-start gap-2">
            <span className="text-ayoo-500">•</span>
            You must create at least one category before adding products
          </li>
          <li className="flex items-start gap-2">
            <span className="text-ayoo-500">•</span>
            Disabled categories won't show to customers but products remain saved
          </li>
          <li className="flex items-start gap-2">
            <span className="text-ayoo-500">•</span>
            Popular categories: Best Sellers, Beverages, Snacks, Rice Meals
          </li>
        </ul>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Category</h3>
            <form onSubmit={handleAddCategory}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="flex-1 rounded-md border-gray-300 border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ayoo-500 bg-white"
                      placeholder="e.g., Summer Special"
                      autoFocus
                    />
                    <Button 
                      type="button" 
                      variant="secondary" 
                      onClick={handleSuggest}
                      isLoading={isSuggesting}
                      title="Auto-generate name with AI"
                    >
                      Auto
                    </Button>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" isLoading={isSaving} disabled={!newCategoryName.trim()}>Create Category</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
