import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Auth } from './pages/Auth';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { Categories } from './pages/Categories';
import { Products } from './pages/Products';
import { Orders } from './pages/Orders';
import { StoreInfo } from './pages/StoreInfo';
import { PreviewStore } from './pages/PreviewStore';
import { Settings } from './pages/Settings';
import { Layout } from './components/Layout';
import { AuthState, User, StoreProfile, Category, Product, Order } from './types';
import { initBackendless, isBackendlessConfigured, BackendlessService } from './services/backendless';

interface ProtectedRouteProps {
  children: React.ReactNode;
  authState: AuthState;
  user: User | null;
  onLogout: () => void;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, authState, user, onLogout }) => {
  if (authState === AuthState.UNAUTHENTICATED) return <Navigate to="/auth" />;
  if (authState === AuthState.ONBOARDING) return <Navigate to="/onboarding" />;
  return <Layout user={user} onLogout={onLogout}>{children}</Layout>;
};

export default function App() {
  const [authState, setAuthState] = useState<AuthState>(AuthState.UNAUTHENTICATED);
  const [user, setUser] = useState<User | null>(null);
  const [storeProfile, setStoreProfile] = useState<StoreProfile | null>(null);
  
  // Data State
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // Init Backendless if configured
    initBackendless();

    const checkAuth = async () => {
       try {
         // Check if user is logged in via Backendless
         if (isBackendlessConfigured()) {
            const currentUser = await BackendlessService.auth.getCurrentUser();
            if (currentUser) {
                // Map Backendless user to our User type
                setUser({
                    id: currentUser.objectId,
                    objectId: currentUser.objectId,
                    email: currentUser.email,
                    name: currentUser.name || `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'Merchant',
                    firstName: currentUser.firstName,
                    lastName: currentUser.lastName,
                });
                
                // Fetch Profile
                try {
                  const profile = await BackendlessService.data.getProfile();
                  if (profile) {
                      setStoreProfile(profile as StoreProfile);
                      setAuthState(AuthState.AUTHENTICATED);
                      // Load Initial Data
                      loadData();
                  } else {
                      setAuthState(AuthState.ONBOARDING);
                  }
                } catch (profileError) {
                  console.error("Error fetching profile:", profileError);
                  // If fetch fails, assume onboarding needed or network issue
                  setAuthState(AuthState.ONBOARDING);
                }
                return;
            }
         }

         // Fallback to local storage for demo if not backendless or not logged in there yet
         const storedUser = localStorage.getItem('ayoo_user');
         const storedProfile = localStorage.getItem('ayoo_profile');
         
         if (storedUser) {
           setUser(JSON.parse(storedUser));
           if (storedProfile) {
             setStoreProfile(JSON.parse(storedProfile));
             setAuthState(AuthState.AUTHENTICATED);
             loadMockData();
           } else {
             setAuthState(AuthState.ONBOARDING);
           }
         }
       } catch (e) {
           console.error("Auth check failed", e);
       }
    };
    
    checkAuth();
  }, []);

  const loadData = async () => {
     // Fetch real data from Backendless
     try {
       const [cats, prods, ords] = await Promise.all([
         BackendlessService.data.categories.list(),
         BackendlessService.data.products.list(),
         BackendlessService.data.orders.list()
       ]);
       
       setCategories(cats as Category[]);
       setProducts(prods as Product[]);
       setOrders(ords as Order[]);
     } catch (e) {
         console.error("Failed to load data", e);
     }
  };

  const loadMockData = () => {
    setCategories([
      { id: 'cat1', name: 'Best Sellers', productCount: 2 },
      { id: 'cat2', name: 'New Arrivals', productCount: 1 }
    ]);
    setProducts([
      { 
        id: 'prod1', 
        name: 'Premium Cotton T-Shirt', 
        description: 'High quality cotton t-shirt perfect for summer.', 
        price: 24.99, 
        isAvailable: true,
        categoryId: 'cat1',
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
      },
      { 
        id: 'prod2', 
        name: 'Denim Jacket', 
        description: 'Classic denim jacket with a modern fit.', 
        price: 89.99, 
        isAvailable: true,
        categoryId: 'cat2',
        imageUrl: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
      }
    ]);
    setOrders([
        {
          id: 'ORD-772391',
          customerName: 'Sarah Johnson',
          customerEmail: 'sarah.j@example.com',
          date: new Date(Date.now() - 86400000).toISOString(),
          status: 'Pending',
          totalAmount: 114.98,
          items: [
            { productId: 'prod1', productName: 'Premium Cotton T-Shirt', quantity: 1, price: 24.99 },
            { productId: 'prod2', productName: 'Denim Jacket', quantity: 1, price: 89.99 }
          ]
        },
        {
          id: 'ORD-772392',
          customerName: 'Mike Chen',
          customerEmail: 'mike.c@example.com',
          date: new Date(Date.now() - 172800000).toISOString(),
          status: 'Shipped',
          totalAmount: 49.98,
          items: [
            { productId: 'prod1', productName: 'Premium Cotton T-Shirt', quantity: 2, price: 24.99 }
          ]
        }
      ]);
  };

  const handleLogin = async () => {
    // Re-check auth state after login
    if (isBackendlessConfigured()) {
        const currentUser = await BackendlessService.auth.getCurrentUser();
        if (currentUser) {
            setUser({
                id: currentUser.objectId,
                objectId: currentUser.objectId,
                email: currentUser.email,
                name: currentUser.name || `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'Merchant',
                firstName: currentUser.firstName,
                lastName: currentUser.lastName,
            });
            
            try {
              const profile = await BackendlessService.data.getProfile();
              if (profile) {
                  setStoreProfile(profile as StoreProfile);
                  setAuthState(AuthState.AUTHENTICATED);
                  loadData();
              } else {
                  setAuthState(AuthState.ONBOARDING);
              }
            } catch (e) {
              console.error("Login profile fetch failed", e);
              setAuthState(AuthState.ONBOARDING);
            }
        }
    } else {
        // Mock
        const mockUser = JSON.parse(localStorage.getItem('ayoo_user') || '{}');
        setUser(mockUser);
        if (localStorage.getItem('ayoo_profile')) {
            setStoreProfile(JSON.parse(localStorage.getItem('ayoo_profile') || '{}'));
            setAuthState(AuthState.AUTHENTICATED);
            loadMockData();
        } else {
            setAuthState(AuthState.ONBOARDING);
        }
    }
  };

  const handleOnboardingComplete = (profile: StoreProfile) => {
    setStoreProfile(profile);
    if (!isBackendlessConfigured()) {
        localStorage.setItem('ayoo_profile', JSON.stringify(profile));
    }
    setAuthState(AuthState.AUTHENTICATED);
    // If completed via backendless, data tables might still be empty but "created" if we saved profile. 
    // We can try loading data (which will be empty)
    loadData(); 
  };

  const handleLogout = async () => {
    if (isBackendlessConfigured()) {
        try {
            await BackendlessService.auth.logout();
        } catch (e) {
            console.error("Logout failed", e);
        }
    }
    localStorage.removeItem('ayoo_user');
    // localStorage.removeItem('ayoo_profile'); // Keep profile for smoother demo re-login if mocked
    setUser(null);
    setStoreProfile(null);
    setAuthState(AuthState.UNAUTHENTICATED);
  };

  return (
    <HashRouter>
      <Routes>
        <Route 
          path="/auth" 
          element={
            authState === AuthState.AUTHENTICATED ? <Navigate to="/dashboard" /> : 
            authState === AuthState.ONBOARDING ? <Navigate to="/onboarding" /> :
            <Auth onLogin={handleLogin} />
          } 
        />
        
        <Route 
          path="/onboarding" 
          element={
            authState === AuthState.AUTHENTICATED ? <Navigate to="/dashboard" /> :
            authState === AuthState.UNAUTHENTICATED ? <Navigate to="/auth" /> :
            <Onboarding onComplete={handleOnboardingComplete} />
          } 
        />

        <Route path="/dashboard" element={
          <ProtectedRoute authState={authState} user={user} onLogout={handleLogout}>
            <Dashboard storeProfile={storeProfile} />
          </ProtectedRoute>
        } />

        <Route path="/orders" element={
          <ProtectedRoute authState={authState} user={user} onLogout={handleLogout}>
            <Orders orders={orders} setOrders={setOrders} />
          </ProtectedRoute>
        } />

        <Route path="/products" element={
          <ProtectedRoute authState={authState} user={user} onLogout={handleLogout}>
            <Products products={products} setProducts={setProducts} categories={categories} />
          </ProtectedRoute>
        } />

        <Route path="/categories" element={
          <ProtectedRoute authState={authState} user={user} onLogout={handleLogout}>
            <Categories 
              categories={categories} 
              setCategories={setCategories}
              storeProfile={storeProfile}
            />
          </ProtectedRoute>
        } />

        <Route path="/store-info" element={
          <ProtectedRoute authState={authState} user={user} onLogout={handleLogout}>
             <StoreInfo storeProfile={storeProfile} setStoreProfile={setStoreProfile} />
          </ProtectedRoute>
        } />
        
        <Route path="/preview" element={
          <ProtectedRoute authState={authState} user={user} onLogout={handleLogout}>
             <PreviewStore storeProfile={storeProfile} products={products} categories={categories} />
          </ProtectedRoute>
        } />
        
        <Route path="/settings" element={
          <ProtectedRoute authState={authState} user={user} onLogout={handleLogout}>
             <Settings user={user} setUser={setUser} />
          </ProtectedRoute>
        } />

        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </HashRouter>
  );
}