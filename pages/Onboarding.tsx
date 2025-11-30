
import React, { useState } from 'react';
import { Button } from '../components/Button';
import { StoreProfile } from '../types';
import { Store, MapPin, Phone, Upload, FileText } from 'lucide-react';
import { BackendlessService, isBackendlessConfigured } from '../services/backendless';

interface OnboardingProps {
  onComplete: (profile: StoreProfile) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [formData, setFormData] = useState<StoreProfile>({
    storeName: '',
    address: '',
    contactNumber: '',
    storeType: '',
    description: '',
    logoUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
        if (isBackendlessConfigured()) {
            await BackendlessService.data.saveProfile(formData);
        }
        onComplete(formData);
    } catch (e: any) {
        console.error("Failed to save profile", e);
        setError(e.message || "Failed to save profile. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-ayoo-500 p-8 text-white">
          <h2 className="text-2xl font-bold">Setup your Store</h2>
          <p className="mt-2 opacity-90">Let's get your business profile ready for customers.</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                      className="w-full pl-10 rounded-lg border-gray-300 border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ayoo-500"
                      placeholder="Ayoo Bakery"
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
                    className="w-full rounded-lg border-gray-300 border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ayoo-500"
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
                      className="w-full pl-10 rounded-lg border-gray-300 border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ayoo-500"
                      placeholder="+1 (555) 000-0000"
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
                      rows={3}
                      className="w-full pl-10 rounded-lg border-gray-300 border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ayoo-500 resize-none"
                      placeholder="123 Commerce St, City, Country"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Store Description</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                    <textarea 
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className="w-full pl-10 rounded-lg border-gray-300 border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ayoo-500 resize-none"
                      placeholder="Tell customers about your store..."
                      maxLength={500}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Store Logo (Optional)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors bg-white">
                    <div className="w-12 h-12 bg-ayoo-50 rounded-full flex items-center justify-center mb-2">
                      <Upload className="w-6 h-6 text-ayoo-500" />
                    </div>
                    <span className="text-sm text-gray-600">Click to upload logo</span>
                    <span className="text-xs text-gray-400 mt-1">SVG, PNG, JPG</span>
                  </div>
               </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <div className="pt-6 border-t border-gray-200 flex justify-end">
              <Button type="submit" size="lg" isLoading={loading}>Complete Setup</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
