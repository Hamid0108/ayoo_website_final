
import React, { useState } from 'react';
import { Package, Plus, Pencil, Trash2, Image as ImageIcon, Sparkles, Tag, Loader } from 'lucide-react';
import { Button } from '../components/Button';
import { Product, Category } from '../types';
import { generateProductDescription } from '../services/geminiService';
import { useNavigate } from 'react-router-dom';
import { BackendlessService, isBackendlessConfigured } from '../services/backendless';

interface ProductsProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: Category[];
}

export const Products: React.FC<ProductsProps> = ({ products, setProducts, categories }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    description: '',
    price: 0,
    categoryId: '',
    imageUrl: '',
    isAvailable: true
  });

  // Check if categories exist
  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-white rounded-xl border border-gray-200 border-dashed">
        <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mb-4">
          <Tag className="w-8 h-8 text-ayoo-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Categories Required</h3>
        <p className="text-gray-500 max-w-sm mb-6">
          You need to create at least one product category before you can add products to your store.
        </p>
        <Button onClick={() => navigate('/categories')}>
          Go to Categories
        </Button>
      </div>
    );
  }

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        categoryId: product.categoryId,
        imageUrl: product.imageUrl || '',
        isAvailable: product.isAvailable !== undefined ? product.isAvailable : true
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        categoryId: categories[0]?.id || '', // Default to first available category
        imageUrl: '',
        isAvailable: true
      });
    }
    setIsModalOpen(true);
  };

  const handleGenerateDescription = async () => {
    if (!formData.name || !formData.categoryId) return;
    setIsGenerating(true);
    const categoryName = categories.find(c => c.id === formData.categoryId)?.name || 'General';
    // Request a shorter description to fit database limits
    const description = await generateProductDescription(formData.name, categoryName);
    // Truncate if Gemini returns something too long
    setFormData(prev => ({ ...prev, description: description.substring(0, 500) }));
    setIsGenerating(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const productData = {
        ...formData,
        objectId: editingProduct?.objectId // Ensure we pass objectId if editing
      };

      let savedProduct: Product;

      if (isBackendlessConfigured()) {
        // Service now returns a correctly mapped object with 'id'
        // @ts-ignore
        savedProduct = await BackendlessService.data.products.save(productData);
      } else {
         // Fallback for UI demo
         savedProduct = {
            ...formData,
            id: editingProduct?.id || Math.random().toString(36).substr(2, 9)
         };
      }

      if (editingProduct) {
        setProducts(products.map(p => p.id === editingProduct.id ? savedProduct : p));
      } else {
        setProducts([...products, savedProduct]);
      }
      setIsModalOpen(false);
    } catch (error: any) {
        console.error("Failed to save product", error);
        // Show specific backend error message
        alert(error.message || "Failed to save product. Please check your inputs and try again.");
    } finally {
        setIsSaving(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
          if (isBackendlessConfigured()) {
            // We need to pass the object with objectId to remove it
             await BackendlessService.data.products.delete(product);
          }
          setProducts(products.filter(p => p.id !== product.id));
      } catch (error) {
          console.error("Failed to delete product", error);
          alert("Failed to delete product.");
      }
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Products</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your product catalog and inventory</p>
        </div>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 border-dashed min-h-[400px] flex flex-col items-center justify-center text-center p-8">
          <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-ayoo-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No products yet</h3>
          <p className="text-gray-500 max-w-sm mb-8">Start building your catalog by adding your first product</p>
          <Button variant="primary" onClick={() => handleOpenModal()}>
            <Plus className="w-5 h-5 mr-2" />
            Add First Product
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => {
            // Map categoryId to Category Name. Ensure we compare strings properly.
            const category = categories.find(c => c.id === product.categoryId || c.id === (product as any).objectId);
            return (
              <div key={product.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-square bg-gray-100 relative">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <ImageIcon className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-medium shadow-sm ${product.isAvailable ? 'text-green-700' : 'text-red-700'}`}>
                      {product.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-xs font-medium text-ayoo-600 bg-ayoo-50 px-2 py-0.5 rounded-full">
                        {category ? category.name : 'Uncategorized'}
                      </span>
                      <h3 className="font-semibold text-gray-900 mt-1 truncate">{product.name}</h3>
                    </div>
                    <p className="font-bold text-gray-900">₱{product.price.toFixed(2)}</p>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">
                    {product.description || 'No description'}
                  </p>
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleOpenModal(product)}>
                      <Pencil className="w-4 h-4 mr-1" /> Edit
                    </Button>
                    <button 
                      onClick={() => handleDelete(product)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl relative my-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full rounded-md border-gray-300 border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ayoo-500 focus:border-ayoo-500 transition-all"
                    placeholder="e.g., Summer T-Shirt"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₱)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">₱</span>
                    <input 
                      type="number"
                      step="0.01"
                      required
                      min="0"
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                      className="w-full pl-7 rounded-md border-gray-300 border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ayoo-500 focus:border-ayoo-500 transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-end">
                    <label className="flex items-center cursor-pointer mb-2">
                        <input 
                            type="checkbox" 
                            checked={formData.isAvailable}
                            onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})}
                            className="sr-only peer"
                        />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ayoo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ayoo-500"></div>
                        <span className="ml-3 text-sm font-medium text-gray-700">Available for Sale</span>
                    </label>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select 
                    required
                    value={formData.categoryId}
                    onChange={e => setFormData({...formData, categoryId: e.target.value})}
                    className="w-full rounded-md border-gray-300 border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ayoo-500 focus:border-ayoo-500 transition-all"
                  >
                    <option value="" disabled>Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input 
                    value={formData.imageUrl}
                    onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                    className="w-full rounded-md border-gray-300 border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ayoo-500 focus:border-ayoo-500 transition-all"
                    placeholder="https://..."
                  />
                </div>

                <div className="col-span-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <button
                      type="button"
                      onClick={handleGenerateDescription}
                      disabled={isGenerating || !formData.name}
                      className="text-xs text-ayoo-600 hover:text-ayoo-700 flex items-center gap-1 disabled:opacity-50"
                    >
                      <Sparkles className="w-3 h-3" />
                      {isGenerating ? 'Generating...' : 'AI Generate'}
                    </button>
                  </div>
                  <textarea 
                    rows={3}
                    maxLength={500}
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full rounded-md border-gray-300 border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ayoo-500 focus:border-ayoo-500 transition-all resize-none"
                    placeholder="Product details..."
                  />
                  <div className="flex justify-end mt-1">
                    <span className={`text-xs ${formData.description.length >= 500 ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                      {formData.description.length}/500 characters
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" isLoading={isSaving}>Save Product</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
