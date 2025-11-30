import { User, StoreProfile, Category, Product, Order } from '../types';

const APP_ID = 'DAA2D434-2958-46C2-A527-676432D41735';
const API_KEY = 'A49E4E60-4FC0-4383-B6D5-AF5ECE67E048';

export const isBackendlessConfigured = () => {
  return typeof (window as any).Backendless !== 'undefined';
};

export const initBackendless = () => {
  if (isBackendlessConfigured()) {
    try {
        (window as any).Backendless.initApp(APP_ID, API_KEY);
        return true;
    } catch (e) {
        // Ignore if already initialized
        return false;
    }
  }
  return false;
};

// Helper to map backend objectId to frontend id
const mapToFrontend = (data: any): any => {
  if (Array.isArray(data)) {
    return data.map(item => ({ ...item, id: item.objectId }));
  }
  if (data && typeof data === 'object') {
    return { ...data, id: data.objectId };
  }
  return data;
};

// Helper to safely find data even if table doesn't exist yet
const safeFind = async (tableName: string, queryBuilder?: any) => {
  try {
    const dataStore = (window as any).Backendless.Data.of(tableName);
    const result = queryBuilder 
      ? await dataStore.find(queryBuilder) 
      : await dataStore.find();
    
    return mapToFrontend(result);
  } catch (error: any) {
    // Error 1009 is "Table not found". If table missing, return empty array.
    if (error.code === 1009 || (error.message && error.message.includes("Table not found"))) {
      console.warn(`Table '${tableName}' not found. Returning empty list.`);
      return [];
    }
    throw error;
  }
};

// Internal helper to get the StoreInfo objectId for the current user
const getStoreContext = async () => {
  const user = await (window as any).Backendless.UserService.getCurrentUser();
  if (!user) throw new Error("No user logged in");

  // 1. Find the StoreInfo belonging to this user
  const storeQuery = (window as any).Backendless.DataQueryBuilder.create();
  storeQuery.setWhereClause(`merchantId = '${user.objectId}'`);
  
  let storeObjectId: string | null = null;
  try {
     const stores = await (window as any).Backendless.Data.of("StoreInfo").find(storeQuery);
     if (stores.length > 0) {
        storeObjectId = stores[0].objectId;
     }
  } catch (e) {
     // Store might not exist yet
  }

  return { user, storeObjectId };
};

// Query for fetching Items (Products/Cats/Orders) belonging to the STORE
const getStoreDataQuery = async () => {
  const { user, storeObjectId } = await getStoreContext();
  
  const queryBuilder = (window as any).Backendless.DataQueryBuilder.create();
  
  if (storeObjectId) {
      // Filter by the STORE's ID
      queryBuilder.setWhereClause(`merchantId = '${storeObjectId}'`);
  } else {
      // Fallback: If no store exists, filter by User ID (legacy) or return a query that finds nothing?
      // For safety, we filter by User ID so the dashboard doesn't break during onboarding,
      // but strictly speaking, products should wait for store creation.
      queryBuilder.setWhereClause(`merchantId = '${user.objectId}'`);
  }
  
  return { queryBuilder, user, storeObjectId };
};

export const BackendlessService = {
  auth: {
    login: async (login: string, password: string) => {
      return (window as any).Backendless.UserService.login(login, password, true);
    },
    register: async (email: string, password: string, name: string) => {
      const user = new (window as any).Backendless.User();
      user.email = email;
      user.password = password;
      user.name = name;
      const parts = name.split(' ');
      if (parts.length > 0) user.firstName = parts[0];
      if (parts.length > 1) user.lastName = parts.slice(1).join(' ');
      
      return (window as any).Backendless.UserService.register(user);
    },
    logout: async () => {
      return (window as any).Backendless.UserService.logout();
    },
    getCurrentUser: async () => {
      return (window as any).Backendless.UserService.getCurrentUser();
    },
    updateUser: async (userUpdates: Partial<User> & { password?: string }) => {
      const currentUser = await (window as any).Backendless.UserService.getCurrentUser();
      if (!currentUser) throw new Error("No user logged in");
      Object.assign(currentUser, userUpdates);
      return (window as any).Backendless.UserService.update(currentUser);
    },
    resetPassword: async (email: string) => {
      return (window as any).Backendless.UserService.restorePassword(email);
    },
    getGoogleLoginUrl: () => {
       if (!isBackendlessConfigured()) {
         throw new Error("Backendless SDK not loaded");
       }
       const redirectUrl = window.location.origin + window.location.pathname;
       return (window as any).Backendless.UserService.getAuthorizationUrlLink(
         'google', 
         redirectUrl, 
         null, 
         true
       );
    },
    processLoginCallback: async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const userToken = urlParams.get('user-token') || urlParams.get('user_token');
      if (userToken) {
        (window as any).Backendless.UserService.setUserToken(userToken);
        window.history.replaceState({}, document.title, window.location.pathname);
        return (window as any).Backendless.UserService.getCurrentUser();
      }
      return null;
    }
  },
  data: {
    saveProfile: async (profile: StoreProfile) => {
      const user = await (window as any).Backendless.UserService.getCurrentUser();
      if (!user) throw new Error("No user logged in");
      
      // StoreInfo is directly linked to the USER
      const queryBuilder = (window as any).Backendless.DataQueryBuilder.create();
      queryBuilder.setWhereClause(`merchantId = '${user.objectId}'`);
      
      let existing = [];
      try {
        const dataStore = (window as any).Backendless.Data.of("StoreInfo");
        existing = await dataStore.find(queryBuilder);
      } catch (error: any) {
         if (error.code !== 1009 && !error.message?.includes("Table not found")) {
           throw error;
         }
      }
      
      const profileData = { ...profile, merchantId: user.objectId };
      if (profileData.description && profileData.description.length > 500) {
          profileData.description = profileData.description.substring(0, 500);
      }
      
      const dataStore = (window as any).Backendless.Data.of("StoreInfo");

      let result;
      if (existing.length > 0) {
        result = await dataStore.save({ ...existing[0], ...profileData });
      } else {
        result = await dataStore.save(profileData);
      }
      return mapToFrontend(result);
    },
    getProfile: async () => {
      try {
        const user = await (window as any).Backendless.UserService.getCurrentUser();
        if (!user) return null;

        const queryBuilder = (window as any).Backendless.DataQueryBuilder.create();
        queryBuilder.setWhereClause(`merchantId = '${user.objectId}'`);
        
        const res = await safeFind("StoreInfo", queryBuilder);
        return res.length ? res[0] : null;
      } catch (e) {
        return null; 
      }
    },
    categories: {
      save: async (category: Category) => {
        const { user, storeObjectId } = await getStoreContext();
        if (!storeObjectId) throw new Error("Please create a store profile first.");
        
        // Save Category linked to Store ObjectID
        const dataStore = (window as any).Backendless.Data.of("Categories");
        const result = await dataStore.save({ ...category, merchantId: storeObjectId });
        return mapToFrontend(result);
      },
      delete: (category: Category) => (window as any).Backendless.Data.of("Categories").remove(category),
      list: async () => {
        const { queryBuilder } = await getStoreDataQuery();
        return safeFind("Categories", queryBuilder);
      },
    },
    products: {
      save: async (product: Product) => {
        const { user, storeObjectId } = await getStoreContext();
        if (!storeObjectId) throw new Error("Please create a store profile first before adding products.");

        // Ensure availability defaults to true if undefined
        const isAvailable = product.isAvailable !== undefined ? product.isAvailable : true;
        
        const dataStore = (window as any).Backendless.Data.of("Products");
        
        const safeProduct = {
            ...product,
            description: product.description ? product.description.substring(0, 500) : "",
            isAvailable,
            // CRITICAL: Link Product to the StoreInfo objectId, NOT the User objectId
            merchantId: storeObjectId 
        };

        const result = await dataStore.save(safeProduct);
        return mapToFrontend(result);
      },
      delete: (product: Product) => (window as any).Backendless.Data.of("Products").remove(product),
      list: async () => {
         const { queryBuilder } = await getStoreDataQuery();
         return safeFind("Products", queryBuilder);
      },
    },
    orders: {
        save: async (order: Order) => {
            const { user, storeObjectId } = await getStoreContext();
            if (!storeObjectId) throw new Error("Store profile missing");
            
            const dataStore = (window as any).Backendless.Data.of("Orders");
            const result = await dataStore.save({ ...order, merchantId: storeObjectId });
            return mapToFrontend(result);
        },
        list: async () => {
            const { queryBuilder } = await getStoreDataQuery();
            return safeFind("Orders", queryBuilder);
        },
    }
  }
};