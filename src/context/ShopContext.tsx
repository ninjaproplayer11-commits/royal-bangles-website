import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, query, where, addDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  images?: string[];
  category: string;
  description: string;
  rating?: number;
  reviews?: number;
  originalPrice?: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  stock?: number;
  sizes?: string[];
  notifyList?: string[];
  tags?: string[];
  taxCategory?: string;
  stockBySize?: Record<string, number>;
  showInGallery?: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  orderId?: string;
}

interface ShopContextType {
  products: Product[];
  categories: string[];
  cart: { id: string; quantity: number; size?: string }[];
  wishlist: string[];
  currentUser: User | null;
  adminUser: User | null;
  profile: any;
  addresses: any[];
  orders: any[];
  isLoading: boolean;
  recentlyViewed: string[];
  loyaltyPoints: number;
  storeSettings: any;
  taxSettings: any;
  flashSale: any;
  referralCode: string;
  addToCart: (id: string, size?: string) => void;
  removeFromCart: (id: string, size?: string) => void;
  updateQuantity: (id: string, delta: number, size?: string) => void;
  toggleWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  addAddress: (address: any) => void;
  deleteAddress: (index: number) => void;
  updateProfile: (data: any) => Promise<void>;
  placeOrder: (orderData: any) => Promise<string>;
  logout: () => Promise<void>;
  refreshProducts: () => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  deleteCategory: (name: string) => Promise<void>;
  adminLogin: (email: string, password?: string) => void;
  googleLogin: () => Promise<void>;
  applyCoupon: (code: string) => Promise<{ success: boolean; discount?: number; message: string }>;
  addCoupon: (coupon: any) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;
  coupons: any[];
  percentageDiscount: number;
  fixedDiscount: number;
  updateOrderStatus: (orderId: string, status: string, reason?: string) => Promise<void>;
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => Promise<void>;
  getProductReviews: (productId: string) => Promise<Review[]>;
  getAllReviews: () => Promise<Review[]>;
  deleteReview: (reviewId: string, productId: string) => Promise<void>;
  trackView: (productId: string) => void;
  notifyWhenInStock: (productId: string) => Promise<void>;
  redeemPoints: (points: number) => Promise<{ success: boolean; discount: number }>;
  shareWishlist: () => string;
  saveStoreSettings: (settings: any) => Promise<void>;
  saveTaxSettings: (settings: any) => Promise<void>;
  saveFlashSale: (sale: any) => Promise<void>;
  applyReferralCode: (code: string) => Promise<{ success: boolean; message: string; discount?: number }>;
  bulkDeleteProducts: (ids: string[]) => Promise<void>;
  bulkUpdateProducts: (ids: string[], data: Partial<Product>) => Promise<void>;
  toggleFeaturedProduct: (id: string) => Promise<void>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['Bridal', 'Casual', 'Luxury', 'Festive']);
  const [cart, setCart] = useState<{ id: string; quantity: number; size?: string }[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>({});
  const [addresses, setAddresses] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [percentageDiscount, setPercentageDiscount] = useState<number>(0);
  const [fixedDiscount, setFixedDiscount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState<number>(0);
  const [storeSettings, setStoreSettings] = useState<any>({});
  const [taxSettings, setTaxSettings] = useState<any>({});
  const [flashSale, setFlashSale] = useState<any>(null);
  const [referralCode, setReferralCode] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

  // Load Store Data
  const loadStoreData = async () => {
    setIsLoading(true);
    try {
      const pCol = collection(db, 'products');
      const pSnap = await getDocs(pCol);
      const pList = pSnap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
      setProducts(pList);

      const cCol = collection(db, 'categories');
      const cSnap = await getDocs(cCol);
      const cList = cSnap.docs.map(d => d.data().name).filter(Boolean);
      
      const defaultCats = ['Bridal', 'Casual', 'Luxury', 'Festive'];
      const mergedCats = Array.from(new Set([...defaultCats, ...cList]));
      setCategories(mergedCats);

      const coupCol = collection(db, 'coupons');
      const coupSnap = await getDocs(coupCol);
      setCoupons(coupSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      // Load store settings
      const settingsSnap = await getDoc(doc(db, 'settings', 'store'));
      if (settingsSnap.exists()) setStoreSettings(settingsSnap.data());

      const taxSnap = await getDoc(doc(db, 'settings', 'tax'));
      if (taxSnap.exists()) setTaxSettings(taxSnap.data());

      const saleSnap = await getDoc(doc(db, 'settings', 'flashSale'));
      if (saleSnap.exists()) setFlashSale(saleSnap.data());

      // Load Orders
      if (currentUser?.uid) {
        const orderCol = collection(db, 'orders');
        const orderQuery = query(orderCol, where('userId', '==', currentUser.uid));
        const orderSnap = await getDocs(orderQuery);
        setOrders(orderSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    } catch (e) {
      console.error("Store Load Error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStoreData();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setCart(data.cart || []);
            setWishlist(data.wishlist || []);
            setAddresses(data.addresses || []);
            setProfile(data.profile || {});
            setRecentlyViewed(data.recentlyViewed || []);
            setLoyaltyPoints(data.loyaltyPoints || 0);
            if (data.appliedCoupon) {
              setAppliedCoupon(data.appliedCoupon);
              if (data.appliedCoupon.type === 'fixed') setFixedDiscount(data.appliedCoupon.discount);
              else setPercentageDiscount(data.appliedCoupon.discount);
            }
            // Generate referral code from uid
            const code = 'RB' + user.uid.slice(0, 6).toUpperCase();
            setReferralCode(code);
          }

        } catch (e) { console.error("User Load Error:", e); }
      } else {
        setCart([]);
        setWishlist([]);
        setAddresses([]);
        setOrders([]);
      }
    });

    const isAdmin = localStorage.getItem('royal_bangles_admin_auth') === 'true';
    if (isAdmin) setAdminUser({ email: 'admin@royalbangles.com' } as any);

    const unsubCoupons = onSnapshot(collection(db, 'coupons'), (snap) => {
      setCoupons(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Real-time orders listener — updates instantly when admin changes status
    let unsubOrders = () => {};
    const unsubAuth2 = onAuthStateChanged(auth, (user) => {
      unsubOrders();
      if (user) {
        const q = query(collection(db, 'orders'), where('userId', '==', user.uid));
        unsubOrders = onSnapshot(q, (snap) => {
          setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
      }
    });

    return () => {
      unsubscribe();
      unsubCoupons();
      unsubOrders();
      unsubAuth2();
    };
  }, []);

  // Self-Healing Data Logic
  // Self-Healing Data Logic
  useEffect(() => {
    if (!isLoading && products.length > 0) {
      const validCart = cart.filter(item => products.some(p => String(p.id) === String(item.id)));
      if (validCart.length !== cart.length) {
        setCart(validCart);
        syncToCloud({ cart: validCart });
      }

      const validWishlist = (wishlist || []).filter(id => products.some(p => String(p.id) === String(id)));
      if (validWishlist.length !== (wishlist || []).length) {
        setWishlist(validWishlist);
        syncToCloud({ wishlist: validWishlist });
      }
    }
  }, [products, isLoading]);

  // Presence tracking for Admin
  useEffect(() => {
    if (!currentUser) return;
    
    const updatePresence = async (status = 'online') => {
      const timestamp = status === 'online' 
        ? new Date().toISOString() 
        : new Date(Date.now() - 300000).toISOString(); // 5 mins ago to force offline
      await setDoc(doc(db, 'users', currentUser.uid), { 
        lastSeen: timestamp 
      }, { merge: true });
    };

    updatePresence('online');
    const interval = setInterval(() => updatePresence('online'), 20000); // Every 20s
    
    const handleTabClose = () => {
      updatePresence('offline');
    };

    window.addEventListener('beforeunload', handleTabClose);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleTabClose);
    };
  }, [currentUser]);

  const syncToCloud = async (newData: any) => {
    if (currentUser) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid), newData, { merge: true });
      } catch (e) { console.error("Sync Error:", e); }
    }
  };

  const addToCart = (id: string, size?: string) => {
    if (!currentUser) return;
    const stringId = String(id);
    setCart(prev => {
      const existing = prev.find(item => String(item.id) === stringId && item.size === size);
      const updated = existing 
        ? prev.map(item => (String(item.id) === stringId && item.size === size) ? { ...item, quantity: item.quantity + 1 } : item)
        : [...prev, { id: stringId, quantity: 1, size }];
      syncToCloud({ cart: updated });
      return updated;
    });
  };

  const removeFromCart = (id: string, size?: string) => {
    const stringId = String(id);
    setCart(prev => {
      const updated = prev.filter(item => !(String(item.id) === stringId && item.size === size));
      return updated;
    });
  };

  const updateQuantity = (id: string, newQty: number, size?: string) => {
    const stringId = String(id);
    const qty = Math.max(0, Math.min(newQty, 99));
    if (qty === 0) return removeFromCart(stringId, size);
    
    setCart(prev => {
      const updated = prev.map(item => (String(item.id) === stringId && item.size === size) ? { ...item, quantity: qty } : item);
      return updated;
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentUser?.uid) syncToCloud({ cart, wishlist, profile, appliedCoupon });
    }, 1000);
    return () => clearTimeout(timer);
  }, [cart, wishlist, profile, appliedCoupon]);

  const toggleWishlist = (id: string) => {
    const stringId = String(id);
    setWishlist(prev => {
      const safePrev = (prev || []).map(i => String(i));
      const updated = safePrev.includes(stringId) 
        ? safePrev.filter(i => i !== stringId) 
        : [...safePrev, stringId];
      syncToCloud({ wishlist: updated });
      return updated;
    });
  };

  const isInWishlist = (id: string) => (wishlist || []).map(i => String(i)).includes(String(id));

  const addAddress = (addr: any) => {
    const updated = [...addresses, addr];
    setAddresses(updated);
    syncToCloud({ addresses: updated });
  };

  const deleteAddress = (index: number) => {
    const updated = addresses.filter((_, i) => i !== index);
    setAddresses(updated);
    syncToCloud({ addresses: updated });
  };

  const updateProfile = async (data: any) => {
    setProfile(data);
    await syncToCloud({ profile: data });
  };

  const placeOrder = async (orderDetails: any) => {
    if (!currentUser) throw new Error("Login required");
    console.log("Placing order:", orderDetails);
    
    const orderId = `RB-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const finalOrder = {
      ...orderDetails,
      orderId,
      userId: currentUser.uid,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      appliedCouponId: appliedCoupon?.id || null,
    };

    try {
      // 1. Save order to Firestore
      const docRef = await addDoc(collection(db, 'orders'), finalOrder);
      console.log("Order saved with ID:", docRef.id);

      setCart([]);
      await syncToCloud({ cart: [] });
      setOrders(prev => [{ id: docRef.id, ...finalOrder }, ...prev]);

      // 2b. Deactivate single-use coupon if applicable
      if (appliedCoupon && appliedCoupon.singleUse) {
        console.log("Deactivating single-use coupon:", appliedCoupon.id);
        await deleteDoc(doc(db, 'coupons', appliedCoupon.id));
        setCoupons(prev => prev.filter(c => c.id !== appliedCoupon.id));
        setAppliedCoupon(null);
        setPercentageDiscount(0);
        setFixedDiscount(prev => prev - (appliedCoupon.type === 'fixed' ? appliedCoupon.discount : 0));
      }

      // 3. Award loyalty points: 1 point per ₹10 spent
      const pointsEarned = Math.max(0, Math.floor((orderDetails.total || 0) / 10));
      const newPoints = Math.max(0, (loyaltyPoints || 0) + pointsEarned);
      setLoyaltyPoints(newPoints);
      await syncToCloud({ loyaltyPoints: newPoints });

      // 4. Update stock for purchased items
      if (orderDetails.items && orderDetails.items.length > 0) {
        for (const item of orderDetails.items) {
          try {
            const productRef = doc(db, 'products', String(item.id));
            const productSnap = await getDoc(productRef);
            if (productSnap.exists()) {
              const pData = productSnap.data();
              let updates: any = {};
              
              // Decrement general stock
              if (typeof pData.stock === 'number') {
                updates.stock = Math.max(0, pData.stock - (item.quantity || 1));
              }
              
              // Decrement size-specific stock if applicable
              if (pData.stockBySize && item.size && typeof pData.stockBySize[item.size] === 'number') {
                updates.stockBySize = {
                  ...pData.stockBySize,
                  [item.size]: Math.max(0, pData.stockBySize[item.size] - (item.quantity || 1))
                };
              }
              
              if (Object.keys(updates).length > 0) {
                console.log(`Updating stock for ${item.name}:`, updates);
                await setDoc(productRef, updates, { merge: true });
              }
            }
          } catch (e) {
            console.error("Non-critical Stock Update Error:", e);
            // We don't throw here so the order success isn't blocked by stock issues
          }
        }
        await loadStoreData(); // Refresh products to reflect new stock
      }

      return orderId;
    } catch (error: any) {
      console.error("CRITICAL Order Save Error:", error);
      throw new Error(error.message || "Failed to save order to database.");
    }
  };

  const updateOrderStatus = async (orderDocId: string, status: string, reason?: string) => {
    try {
      const updates: any = { status };
      if (reason) updates.cancellationReason = reason;
      
      // If cancelling, restock products
      if (status === 'Cancelled') {
        const orderSnap = await getDoc(doc(db, 'orders', orderDocId));
        if (orderSnap.exists()) {
          const orderData = orderSnap.data();
          if (orderData.items) {
            for (const item of orderData.items) {
              const productRef = doc(db, 'products', String(item.id));
              const productSnap = await getDoc(productRef);
              if (productSnap.exists()) {
                const pData = productSnap.data();
                let pUpdates: any = {};
                
                // Restock general stock
                if (typeof pData.stock === 'number') {
                  pUpdates.stock = pData.stock + (item.quantity || 1);
                }
                
                // Restock size-specific stock if applicable
                if (pData.stockBySize && item.size && typeof pData.stockBySize[item.size] === 'number') {
                  pUpdates.stockBySize = {
                    ...pData.stockBySize,
                    [item.size]: pData.stockBySize[item.size] + (item.quantity || 1)
                  };
                }
                
                if (Object.keys(pUpdates).length > 0) {
                  await setDoc(productRef, pUpdates, { merge: true });
                }
              }
            }
          }
        }
      }

      await setDoc(doc(db, 'orders', orderDocId), updates, { merge: true });
      setOrders(prev => prev.map(o => o.id === orderDocId ? { ...o, ...updates } : o));
      alert(`Order updated to ${status}! ${status === 'Cancelled' ? 'Inventory restocked. 🔄' : '📦'}`);
    } catch (e) {
      console.error("Update Error:", e);
      alert("Failed to update status.");
    }
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem('royal_bangles_admin_auth');
    setAdminUser(null);
    window.location.href = '/';
  };

  const addCategory = async (name: string) => {
    await addDoc(collection(db, 'categories'), { name });
    setCategories(prev => [...prev, name]);
  };

  const deleteCategory = async (name: string) => {
    const q = query(collection(db, 'categories'), where('name', '==', name));
    const snap = await getDocs(q);
    snap.docs.forEach(async (d) => await deleteDoc(doc(db, 'categories', d.id)));
    setCategories(prev => prev.filter(c => c !== name));
  };

  const addCoupon = async (coupon: any) => {
    const docRef = await addDoc(collection(db, 'coupons'), coupon);
    setCoupons(prev => [...prev, { id: docRef.id, ...coupon }]);
  };

  const deleteCoupon = async (id: string) => {
    await deleteDoc(doc(db, 'coupons', id));
    setCoupons(prev => prev.filter(c => c.id !== id));
  };

  const applyCoupon = async (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const coupon = (coupons || []).find(c => c.code.trim().toUpperCase() === cleanCode);
    if (!coupon) return { success: false, message: "Invalid coupon code." };
    if (new Date(coupon.expiry) < new Date()) return { success: false, message: "This coupon has expired." };
    
    // Clear previous coupon if any
    setPercentageDiscount(0);
    setFixedDiscount(prev => prev - (appliedCoupon?.type === 'fixed' ? appliedCoupon.discount : 0));

      setAppliedCoupon(coupon);
      if (currentUser?.uid) syncToCloud({ appliedCoupon: coupon });
    
      if (coupon.type === 'fixed') {
      setFixedDiscount(prev => prev + coupon.discount);
      return { success: true, discount: coupon.discount, message: `Coupon applied! You got ₹${coupon.discount} off.` };
    } else {
      setPercentageDiscount(coupon.discount);
      return { success: true, discount: coupon.discount, message: `Coupon applied! You got ${coupon.discount}% off.` };
    }
  };

  const adminLogin = (email: string, _password?: string) => {
    setAdminUser({ email } as any);
    localStorage.setItem('royal_bangles_admin_auth', 'true');
    if (email.includes('@')) localStorage.setItem('royal_bangles_admin_email', email);
    setTimeout(() => { window.location.href = '/admin'; }, 100);
  };

  const googleLogin = async () => {
    const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const addReview = async (review: Omit<Review, 'id' | 'createdAt'>) => {
    const reviewData: Omit<Review, 'id'> = { ...review, createdAt: new Date().toISOString() };
    await addDoc(collection(db, 'reviews'), reviewData);
    await updateProductRating(review.productId);
    await loadStoreData();
  };

  const getProductReviews = async (productId: string): Promise<Review[]> => {
    const snap = await getDocs(query(collection(db, 'reviews'), where('productId', '==', productId)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Review));
  };

  const getAllReviews = async (): Promise<Review[]> => {
    const snap = await getDocs(collection(db, 'reviews'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Review));
  };

  const deleteReview = async (reviewId: string, productId: string) => {
    await deleteDoc(doc(db, 'reviews', reviewId));
    await updateProductRating(productId);
    await loadStoreData();
  };

  const updateProductRating = async (productId: string) => {
    const existingReviews = await getDocs(query(collection(db, 'reviews'), where('productId', '==', productId)));
    const allReviews = existingReviews.docs.map(d => d.data() as Review);
    const avgRating = allReviews.length > 0 ? allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length : 5;
    await setDoc(doc(db, 'products', productId), { rating: Math.round(avgRating * 10) / 10, reviews: allReviews.length }, { merge: true });
  };

  const trackView = (productId: string) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(id => id !== productId);
      const updated = [productId, ...filtered].slice(0, 10);
      if (currentUser) syncToCloud({ recentlyViewed: updated });
      return updated;
    });
  };

  const notifyWhenInStock = async (productId: string) => {
    if (!currentUser) return;
    const productRef = doc(db, 'products', productId);
    const productSnap = await getDoc(productRef);
    if (productSnap.exists()) {
      const data = productSnap.data();
      const notifyList: string[] = data.notifyList || [];
      if (!notifyList.includes(currentUser.uid)) {
        await setDoc(productRef, { notifyList: [...notifyList, currentUser.uid] }, { merge: true });
      }
    }
  };

  const redeemPoints = async (points: number): Promise<{ success: boolean; discount: number }> => {
    if (!currentUser || loyaltyPoints < points) return { success: false, discount: 0 };
    const discountAmount = Math.floor(points / 100); // 100 points = ₹1
    const newPoints = loyaltyPoints - points;
    setLoyaltyPoints(newPoints);
    await syncToCloud({ loyaltyPoints: newPoints });
    setFixedDiscount(prev => prev + discountAmount);
    return { success: true, discount: discountAmount };
  };

  const shareWishlist = (): string => {
    const ids = (wishlist || []).join(',');
    return `${window.location.origin}/shop?wishlist=${ids}`;
  };

  const saveStoreSettings = async (settings: any) => {
    await setDoc(doc(db, 'settings', 'store'), settings, { merge: true });
    setStoreSettings(settings);
  };

  const saveTaxSettings = async (settings: any) => {
    await setDoc(doc(db, 'settings', 'tax'), settings, { merge: true });
    setTaxSettings(settings);
  };

  const saveFlashSale = async (sale: any) => {
    await setDoc(doc(db, 'settings', 'flashSale'), sale, { merge: true });
    setFlashSale(sale);
  };

  const applyReferralCode = async (code: string): Promise<{ success: boolean; message: string; discount?: number }> => {
    if (!currentUser) return { success: false, message: 'Login required.' };
    const cleanCode = code.trim().toUpperCase();
    // Referral code = RB + first 6 chars of uid
    const ownCode = 'RB' + currentUser.uid.slice(0, 6).toUpperCase();
    if (cleanCode === ownCode) return { success: false, message: "You can't use your own referral code." };
    // Check if already used
    const userSnap = await getDoc(doc(db, 'users', currentUser.uid));
    if (userSnap.exists() && userSnap.data().usedReferral) return { success: false, message: 'You have already used a referral code.' };
    // Find owner of code
    const usersSnap = await getDocs(collection(db, 'users'));
    const owner = usersSnap.docs.find(d => ('RB' + d.id.slice(0, 6).toUpperCase()) === cleanCode);
    if (!owner) return { success: false, message: 'Invalid referral code.' };
    // Apply ₹200 discount
    setFixedDiscount(prev => prev + 200);
    await setDoc(doc(db, 'users', currentUser.uid), { usedReferral: cleanCode }, { merge: true });
    // Award 500 points to referrer
    const ownerData = owner.data();
    await setDoc(doc(db, 'users', owner.id), { loyaltyPoints: (ownerData.loyaltyPoints || 0) + 500 }, { merge: true });
    return { success: true, message: '🎉 ₹200 discount applied! Your friend earned 500 loyalty points.', discount: 200 };
  };

  const bulkDeleteProducts = async (ids: string[]) => {
    await Promise.all(ids.map(id => deleteDoc(doc(db, 'products', id))));
    await loadStoreData();
  };

  const bulkUpdateProducts = async (ids: string[], data: Partial<Product>) => {
    await Promise.all(ids.map(id => setDoc(doc(db, 'products', id), data, { merge: true })));
    await loadStoreData();
  };

  const toggleFeaturedProduct = async (id: string) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    const newVal = !product.isFeatured;
    await setDoc(doc(db, 'products', id), { isFeatured: newVal }, { merge: true });
    await loadStoreData();
  };


  return (
    <ShopContext.Provider value={{
      products, categories, cart, wishlist, currentUser, adminUser, profile, addresses, orders, isLoading,
      recentlyViewed, loyaltyPoints, storeSettings, taxSettings, flashSale, referralCode,
      addToCart, removeFromCart, updateQuantity, toggleWishlist, isInWishlist,
      addAddress, deleteAddress, updateProfile, placeOrder, logout,
      refreshProducts: loadStoreData, addCategory, deleteCategory, adminLogin, googleLogin,
      applyCoupon, addCoupon, deleteCoupon, coupons, percentageDiscount, fixedDiscount, updateOrderStatus,
      addReview, getProductReviews, trackView, notifyWhenInStock, redeemPoints, shareWishlist,
      saveStoreSettings, saveTaxSettings, saveFlashSale, applyReferralCode,
      bulkDeleteProducts, bulkUpdateProducts,
      toggleFeaturedProduct,
      getAllReviews,
      deleteReview
    }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) throw new Error('useShop must be used within ShopProvider');
  return context;
};
