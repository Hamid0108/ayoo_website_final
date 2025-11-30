
import React, { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { StoreProfile } from '../types';
import { Store, MapPin, Phone, Upload, Check, Clock, Power } from 'lucide-react';
import { BackendlessService, isBackendlessConfigured } from '../services/backendless';

interface StoreInfoProps {
  storeProfile: StoreProfile | null;
  setStoreProfile: (profile: StoreProfile) => void;
}

export const StoreInfo: React.FC<StoreInfoProps> = ({ storeProfile, setStoreProfile }) => {
  const [formData, setFormData] = useState<StoreProfile>({
    storeName: '',
    address: '',
    contactNumber: '',
    storeType: '',
    description: '',
    logoUrl: '',
    storeOpen: true,
    autoSchedule: false,
    openingTime: '09:00',
    closingTime: '18:00'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (storeProfile) {
      setFormData(prev => ({
        ...prev,
        ...storeProfile,
        // Ensure defaults if fields are missing in DB
        storeOpen: storeProfile.storeOpen !== undefined ? storeProfile.storeOpen : true,
        autoSchedule: storeProfile.autoSchedule !== undefined ? storeProfile.autoSchedule : false,
        openingTime: storeProfile.openingTime || '09:00',
        closingTime: storeProfile.closingTime || '18:00'
      }));
    }
  }, [storeProfile]);

  // Automatic schedule logic
  useEffect(() => {
    if (formData.autoSchedule && formData.openingTime && formData.closingTime) {
      const checkSchedule = async () => {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        const [openHour, openMinute] = formData.openingTime!.split(':').map(Number);
        const [closeHour, closeMinute] = formData.closingTime!.split(':').map(Number);
        
        const openTime = openHour * 60 + openMinute;
        const closeTime = closeHour * 60 + closeMinute;
        
        const shouldBeOpen = currentTime >= openTime && currentTime < closeTime;
        
        // Only update if it's different to prevent loops
        if (formData.storeOpen !== shouldBeOpen) {
           const updated = { ...formData, storeOpen: shouldBeOpen };
           setFormData(updated); // Update local state
           
           // Trigger save to backend if status changed due to schedule
           if (isBackendlessConfigured()) {
             try {
                const saved = await BackendlessService.data.saveProfile(updated);
                setStoreProfile(saved as StoreProfile);
             } catch (e) {
                console.error("Failed to auto-update store status", e);
             }
           }
        }
      };

      checkSchedule();
      const interval = setInterval(checkSchedule, 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [formData.autoSchedule, formData.openingTime, formData.closingTime, formData.storeOpen]); 


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleStatusToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const checked = e.target.checked;
      const updated = { ...formData, storeOpen: checked };
      setFormData(updated); // Optimistic UI update
      
      try {
          if (isBackendlessConfigured()) {
            const saved = await BackendlessService.data.saveProfile(updated);
            setStoreProfile(saved as StoreProfile);
          } else {
             localStorage.setItem('ayoo_profile', JSON.stringify(updated));
             setStoreProfile(updated);
          }
      } catch (e) {
          console.error("Failed to save status", e);
          setFormData({ ...formData, storeOpen: !checked }); // Revert on error
          setError("Failed to update status");
      }
  };

  const handleAutoScheduleToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const checked = e.target.checked;
      const updated = { ...formData, autoSchedule: checked };
      setFormData(updated);
      
      try {
          if (isBackendlessConfigured()) {
            const saved = await BackendlessService.data.saveProfile(updated);
            setStoreProfile(saved as StoreProfile);
          } else {
             localStorage.setItem('ayoo_profile', JSON.stringify(updated));
             setStoreProfile(updated);
          }
      } catch (e) {
          console.error("Failed to save auto-schedule setting", e);
          setFormData({ ...formData, autoSchedule: !checked });
          setError("Failed to update schedule setting");
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError('');

    try {
      if (isBackendlessConfigured()) {
        const savedProfile = await BackendlessService.data.saveProfile(formData);
        // Update the global state with the response from server to ensure sync
        setStoreProfile(savedProfile as StoreProfile);
      } else {
        // Fallback for demo without backendless
        setStoreProfile(formData);
        localStorage.setItem('ayoo_profile', JSON.stringify(formData));
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Store Information</h2>
        <p className="text-sm text-gray-500 mt-1">Update your business details visible to customers</p>
      </div>

      <div className="space-y-8">
          
          {/* Status Section - Separate Card for Immediate Action */}
          <div className="bg-white rounded-xl shadow-sm border border-ayoo-100 overflow-hidden">
             <div className="bg-ayoo-50/50 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                   <div className="flex items-center gap-3">
                     <div className={`p-3 rounded-full ${formData.storeOpen ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                       <Power className="w-6 h-6" />
                     </div>
                     <div>
                       <h3 className="font-bold text-gray-900">Store Status</h3>
                       <p className="text-sm text-gray-500">
                         Current status: <span className={`font-semibold ${formData.storeOpen ? 'text-green-600' : 'text-gray-600'}`}>{formData.storeOpen ? 'OPEN' : 'CLOSED'}</span>
                       </p>
                     </div>
                   </div>

                   <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            name="storeOpen"
                            checked={formData.storeOpen || false} 
                            onChange={handleStatusToggle}
                            disabled={formData.autoSchedule}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ayoo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ayoo-500"></div>
                          <span className="ml-3 text-sm font-medium text-gray-700">
                            {formData.autoSchedule ? 'Auto (Managed)' : 'Open Now'}
                          </span>
                        </label>
                      </div>
                   </div>
                </div>

                <div className="mt-6 pt-6 border-t border-ayoo-200">
                   <div className="flex items-center gap-2 mb-4">
                      <Clock className="w-4 h-4 text-ayoo-600" />
                      <span className="font-semibold text-gray-900 text-sm">Automatic Schedule</span>
                      <label className="ml-2 relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            name="autoSchedule"
                            checked={formData.autoSchedule || false} 
                            onChange={handleAutoScheduleToggle}
                            className="sr-only peer" 
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-ayoo-500"></div>
                      </label>
                   </div>
                   
                   <div className={`grid grid-cols-2 gap-4 transition-opacity ${!formData.autoSchedule ? 'opacity-50 pointer-events-none' : ''}`}>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Opening Time</label>
                        <input 
                          type="time" 
                          name="openingTime"
                          value={formData.openingTime}
                          onChange={handleChange}
                          className="w-full rounded-lg border-gray-300 border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ayoo-500 focus:border-ayoo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Closing Time</label>
                        <input 
                          type="time" 
                          name="closingTime"
                          value={formData.closingTime}
                          onChange={handleChange}
                          className="w-full rounded-lg border-gray-300 border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ayoo-500 focus:border-ayoo-500"
                        />
                      </div>
                   </div>
                   {formData.autoSchedule && (
                     <p className="text-xs text-ayoo-600 mt-2">
                       Store will automatically open at {formData.openingTime} and close at {formData.closingTime}.
                       (Requires "Save Changes" for time updates)
                     </p>
                   )}
                </div>
             </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-8 space-y-8">
              {/* Logo Section */}
              <div className="flex items-start gap-6">
                 <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden flex-shrink-0">
                   {formData.logoUrl ? (
                     <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                   ) : (
                     <Store className="w-8 h-8 text-gray-400" />
                   )}
                 </div>
                 <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Store Logo URL</label>
                    <div className="flex gap-2">
                      <input 
                        name="logoUrl"
                        value={formData.logoUrl || ''}
                        onChange={handleChange}
                        className="flex-1 rounded-lg border-gray-300 border bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ayoo-500 focus:border-ayoo-500 transition-all"
                        placeholder="https://example.com/logo.png"
                      />
                      <Button type="button" variant="outline" size="sm">
                        <Upload className="w-4 h-4 mr-2" /> Upload
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Recommended size: 500x500px. JPG, PNG or SVG.</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                    <div className="relative">
                      <Store className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                      <input 
                        name="storeName"
                        required
                        value={formData.storeName}
                        onChange={handleChange}
                        className="w-full pl-10 rounded-lg border-gray-300 border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ayoo-500 focus:border-ayoo-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shop Category</label>
                    <select 
                      name="storeType"
                      required
                      value={formData.storeType}
                      onChange={handleChange}
                      className="w-full rounded-lg border-gray-300 border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ayoo-500 focus:border-ayoo-500 transition-all"
                    >
                      <option value="">Select Category</option>
                      <option value="Food & Beverage">Food & Beverage</option>
                      <option value="Retail">Retail</option>
                      <option value="Services">Services</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Electronics">Electronics</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                      <input 
                        name="contactNumber"
                        required
                        value={formData.contactNumber}
                        onChange={handleChange}
                        className="w-full pl-10 rounded-lg border-gray-300 border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ayoo-500 focus:border-ayoo-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Store Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                      <textarea 
                        name="address"
                        required
                        value={formData.address}
                        onChange={handleChange}
                        rows={4}
                        className="w-full pl-10 rounded-lg border-gray-300 border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ayoo-500 focus:border-ayoo-500 transition-all resize-none"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea 
                      name="description"
                      value={formData.description || ''}
                      onChange={handleChange}
                      rows={3}
                      className="w-full rounded-lg border-gray-300 border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ayoo-500 focus:border-ayoo-500 transition-all resize-none"
                      placeholder="Tell your customers about your store..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 flex items-center justify-between">
              <div>
                {success && <span className="text-green-600 text-sm flex items-center font-medium"><Check className="w-4 h-4 mr-1"/> Saved successfully</span>}
                {error && <span className="text-red-600 text-sm font-medium">{error}</span>}
              </div>
              <Button type="submit" isLoading={loading}>Save Changes</Button>
            </div>
          </form>
      </div>
    </div>
  );
};
