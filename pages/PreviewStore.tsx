import React, { useState } from 'react';
import { StoreProfile, Product, Category } from '../types';
import { ShoppingBag, Search, MapPin, Phone, Clock } from 'lucide-react';

interface PreviewStoreProps {
  storeProfile: StoreProfile | null;
  products: Product[];
  categories: Category[];
}

export const PreviewStore: React.FC<PreviewStoreProps> = ({ storeProfile, products, categories }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  if (!storeProfile) {
    return <div className="p-8 text-center text-gray-500">Store profile not set up yet.</div>;
  }

  // Calculate effective store open status
  const isStoreOpen = () => {
    if (storeProfile.autoSchedule && storeProfile.openingTime && storeProfile.closingTime) {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      
      const [openHour, openMinute] = storeProfile.openingTime.split(':').map(Number);
      const [closeHour, closeMinute] = storeProfile.closingTime.split(':').map(Number);
      
      const openTime = openHour * 60 + openMinute;
      const closeTime = closeHour * 60 + closeMinute;
      
      return currentTime >= openTime && currentTime < closeTime;
    }
    return storeProfile.storeOpen;
  };

  const open = isStoreOpen();

  // Filter logic: Check category match AND map backendless category relationships
  const filteredProducts = products.filter(p => {
    // Basic category filter
    const matchesCategory = activeCategory === 'all' || 
                           p.categoryId === activeCategory || 
                           (p as any).categoryId === activeCategory; // handle legacy
                           
    return matchesCategory;
  });

  return (
    <div className="bg-gray-100 min-h-screen pb-20 -m-8">
      {/* Mobile-like Preview Container */}
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl overflow-hidden relative">
        
        {/* Store Header */}
        <div className="bg-ayoo-500 p-6 text-white pb-12 rounded-b-3xl relative z-10">
           <div className="flex justify-between items-start">
             <div className="flex gap-4 items-center">
                <div className="w-16 h-16 bg-white rounded-full p-1 shadow-md">
                   {storeProfile.logoUrl ? (
                     <img src={storeProfile.logoUrl} alt="Logo" className="w-full h-full rounded-full object-cover" />
                   ) : (
                     <div className="w-full h-full bg-ayoo-100 rounded-full flex items-center justify-center text-ayoo-500 font-bold text-xl">
                       {storeProfile.storeName.charAt(0)}
                     </div>
                   )}
                </div>
                <div>
                  <h1 className="font-bold text-xl">{storeProfile.storeName}</h1>
                  <p className="text-white/80 text-xs flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" /> {storeProfile.address}
                  </p>
                  <p className="text-white/80 text-xs flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3" /> {storeProfile.contactNumber}
                  </p>
                  
                  {/* Store Status Indicator */}
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/20 text-xs font-medium backdrop-blur-sm">
                     <div className={`w-1.5 h-1.5 rounded-full ${open ? 'bg-green-400' : 'bg-red-400'}`}></div>
                     {open ? 'Open' : 'Closed'}
                     {storeProfile.openingTime && storeProfile.autoSchedule && (
                       <span className="text-white/70 ml-1 text-[10px] border-l border-white/20 pl-1.5">
                         {storeProfile.openingTime} - {storeProfile.closingTime}
                       </span>
                     )}
                  </div>
                </div>
             </div>
           </div>
           
           {/* Search Bar */}
           <div className="mt-6 relative">
             <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
             <input 
               type="text" 
               placeholder="Search products..." 
               className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white text-gray-800 text-sm focus:outline-none shadow-sm"
             />
           </div>
        </div>

        {/* Categories Scroller */}
        <div className="mt-4 px-4 overflow-x-auto no-scrollbar flex gap-2 pb-2">
          <button 
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === 'all' ? 'bg-ayoo-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            All Items
          </button>
          {categories.map(cat => (
             <button 
               key={cat.id}
               onClick={() => setActiveCategory(cat.id)}
               className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                 activeCategory === cat.id ? 'bg-ayoo-500 text-white' : 'bg-gray-100 text-gray-600'
               }`}
             >
               {cat.name}
             </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="p-4 grid grid-cols-2 gap-4">
           {filteredProducts.map(product => (
             <div key={product.id} className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col ${!product.isAvailable ? 'opacity-60' : ''}`}>
                <div className="aspect-square bg-gray-100 relative">
                   {product.imageUrl && (
                     <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                   )}
                   {!product.isAvailable && (
                     <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                       <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded">Unavailable</span>
                     </div>
                   )}
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <h3 className="font-medium text-gray-900 text-sm line-clamp-2">{product.name}</h3>
                  <div className="mt-auto pt-2 flex items-center justify-between">
                    <span className="font-bold text-ayoo-600">₱{product.price.toFixed(2)}</span>
                    <button 
                      disabled={!product.isAvailable || !open}
                      className="w-7 h-7 bg-ayoo-500 text-white rounded-full flex items-center justify-center shadow-sm active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
             </div>
           ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="p-10 text-center text-gray-500">
            <p>No products found in this category.</p>
          </div>
        )}
        
        {!open && (
           <div className="fixed bottom-0 left-0 right-0 bg-red-600 text-white text-center py-3 text-sm font-medium z-50">
             Store is currently closed
           </div>
        )}
      </div>
    </div>
  );
};