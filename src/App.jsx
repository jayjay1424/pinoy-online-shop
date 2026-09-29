import React, { useState, useEffect } from 'react';
import { PRODUCTS, CURRENCY_RATES } from './data/products';
import { Navbar } from './components/Navbar';
import { Stage3D } from './components/Stage3D';
import { ProductInfo } from './components/ProductInfo';
import { ProductCarousel } from './components/ProductCarousel';
import { CatalogGrid } from './components/CatalogGrid';
import { StorySection } from './components/StorySection';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { normalizeProduct } from './utils/productUtils';
import {
  mergeProductsWithInventory,
  deductStockForOrder,
  updateProductStockInStorage,
} from './utils/inventory';
import { useAuth } from './context/AuthContext';
import { sound } from './utils/sound';

// Lazy load heavy admin portal and secondary modals for ultra-fast initial load
const CuratorStudioPage = React.lazy(() =>
  import('./pages/CuratorStudioPage').then((m) => ({ default: m.CuratorStudioPage }))
);
const UnboxingModal = React.lazy(() =>
  import('./components/UnboxingModal').then((m) => ({ default: m.UnboxingModal }))
);
const ArtisanMapModal = React.lazy(() =>
  import('./components/ArtisanMapModal').then((m) => ({ default: m.ArtisanMapModal }))
);
const ConciergeModal = React.lazy(() =>
  import('./components/ConciergeModal').then((m) => ({ default: m.ConciergeModal }))
);
const AuthModal = React.lazy(() =>
  import('./components/AuthModal').then((m) => ({ default: m.AuthModal }))
);
const AccountModal = React.lazy(() =>
  import('./components/AccountModal').then((m) => ({ default: m.AccountModal }))
);

function AtelierLoadingChamber() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#24140E]/60 backdrop-blur-sm animate-fadeIn">
      <div className="p-6 rounded-3xl bg-[#FAF8F5] border border-[#C4975D]/40 text-center shadow-warm flex flex-col items-center">
        <div className="w-9 h-9 rounded-full border-2 border-[#FAF8F5] border-t-[#C4975D] animate-spin mb-3" />
        <span className="text-[10px] uppercase tracking-widest font-bold text-[#8C5A3C]">
          Likha Atelier • Accessing Vault Chamber
        </span>
      </div>
    </div>
  );
}

export function App() {
  const { isAuthenticated } = useAuth();

  // Hidden Route detection (/admin or /curator or #/admin)
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (pathname.startsWith('/admin') || pathname.startsWith('/curator') || hash.startsWith('#/admin')) {
        return '/admin';
      }
    }
    return '/';
  });

  // Client-side Navigation
  const navigateToStorefront = () => {
    window.history.pushState({}, '', '/');
    setCurrentPath('/');
  };

  const navigateToAdmin = () => {
    window.history.pushState({}, '', '/admin');
    setCurrentPath('/admin');
  };

  // Route event listener & discreet owner shortcut (Ctrl+Shift+A or Alt+A)
  useEffect(() => {
    const handleLocationChange = () => {
      const pathname = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (pathname.startsWith('/admin') || pathname.startsWith('/curator') || hash.startsWith('#/admin')) {
        setCurrentPath('/admin');
      } else {
        setCurrentPath('/');
      }
    };

    const handleKeyDown = (e) => {
      // Secret key combination for owner: Ctrl+Shift+A or Alt+A toggles between Admin and Storefront
      if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') || (e.altKey && e.key.toLowerCase() === 'a')) {
        e.preventDefault();
        if (window.location.pathname.toLowerCase().startsWith('/admin')) {
          navigateToStorefront();
        } else {
          navigateToAdmin();
        }
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Dynamic catalog state with localStorage persistence, persistent inventory tracking, and API sync
  // Helper: merge stored/API products ON TOP of base PRODUCTS so code-defined fields
  // (cameraPresets, specs, materials) are never lost when localStorage/API data is stale.
  const mergeWithBase = (storedList) => {
    const storedMap = new Map(storedList.map((p) => [p.id, p]));
    return PRODUCTS.map((base) => {
      const stored = storedMap.get(base.id);
      if (!stored) return base; // new product added to code, not in storage yet
      // Spread base first so code fields are defaults, then overwrite with stored user/admin edits
      return { ...base, ...stored, cameraPresets: base.cameraPresets };
    }).concat(
      // Admin-created products (not in PRODUCTS) come through as-is
      storedList.filter((p) => !PRODUCTS.find((b) => b.id === p.id))
    );
  };

  const [products, setProducts] = useState(() => {
    try {
      const stored = localStorage.getItem('likha_catalog_items');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const combined = mergeWithBase(parsed);
          return mergeProductsWithInventory(combined.map(normalizeProduct));
        }
      }
    } catch (e) {
      console.warn('Failed to parse catalog from localStorage', e);
    }
    return mergeProductsWithInventory(PRODUCTS.map(normalizeProduct));
  });

  const [activeProduct, setActiveProduct] = useState(() => {
    try {
      const stored = localStorage.getItem('likha_catalog_items');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const merged = mergeProductsWithInventory(mergeWithBase(parsed).map(normalizeProduct));
          return merged[0];
        }
      }
    } catch (e) {}
    const defaultMerged = mergeProductsWithInventory(PRODUCTS.map(normalizeProduct));
    return defaultMerged[0];
  });

  const [selectedMaterial, setSelectedMaterial] = useState(
    PRODUCTS[0].materials && PRODUCTS[0].materials.length > 0 ? PRODUCTS[0].materials[0] : null
  );
  const [monogram, setMonogram] = useState('JR');
  const [activeMood, setActiveMood] = useState('jeweler_daylight');
  const [activeCurrency, setActiveCurrency] = useState('PHP');

  const [cart, setCart] = useState([]);
  const [directCheckoutItem, setDirectCheckoutItem] = useState(null);
  const [orders, setOrders] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('likha_patron_orders') || '[]');
    } catch (e) {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutPackaging, setCheckoutPackaging] = useState(null);
  const [pendingCheckoutPackaging, setPendingCheckoutPackaging] = useState(null);

  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isUnboxingOpen, setIsUnboxingOpen] = useState(false);
  const [isConciergeOpen, setIsConciergeOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authNotice, setAuthNotice] = useState('');
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  // Sync with PostgreSQL / Serverless API on mount and on demand, merging with persistent inventory
  const refreshProducts = async (forceSeed = false) => {
    try {
      const url = forceSeed ? '/api/products?seed=true' : '/api/products';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const prods = data?.products || data?.data;
        if (data && data.success && Array.isArray(prods) && prods.length > 0) {
          // Protect cameraPresets + other code-defined fields, then protect inventory stock
          const withBase = mergeWithBase(prods.map(normalizeProduct));
          const syncedList = mergeProductsWithInventory(withBase);

          setProducts(syncedList);
          setActiveProduct((prevActive) => {
            if (!prevActive) return syncedList[0];
            const updatedActive = syncedList.find((p) => p.id === prevActive.id);
            return updatedActive || syncedList[0];
          });
          try {
            localStorage.setItem('likha_catalog_items', JSON.stringify(syncedList));
          } catch (e) {}
          return syncedList;
        }
      }
    } catch (err) {
      console.log('Using local catalog cache:', err.message);
    }
    return products;
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  // Handle product change
  const handleSelectProduct = (prod) => {
    setActiveProduct(prod);
    if (prod.materials && prod.materials.length > 0) {
      setSelectedMaterial(prod.materials[0]);
    } else {
      setSelectedMaterial(null);
    }
  };

  // Handle Add to Bag from 3D Hero
  const handleAddToCart = (itemConfig) => {
    setCart((prev) => {
      const pId = itemConfig.product.id;
      const matId = itemConfig.selectedMaterial?.id;
      const mono = itemConfig.monogram || '';
      const motif = itemConfig.embroideryMotif || '';

      const existingIndex = prev.findIndex(
        (it) =>
          it.product.id === pId &&
          (it.selectedMaterial?.id || null) === (matId || null) &&
          (it.monogram || '') === mono &&
          (it.embroideryMotif || '') === motif
      );

      if (existingIndex > -1) {
        const copy = [...prev];
        const currentItem = copy[existingIndex];
        const maxStock = typeof itemConfig.product.batchRemaining === 'number'
          ? itemConfig.product.batchRemaining
          : 99;
        const newQty = Math.min(maxStock, (currentItem.quantity || 1) + (itemConfig.quantity || 1));
        const unitPrice = itemConfig.unitPrice || Math.round(itemConfig.price / (itemConfig.quantity || 1));
        copy[existingIndex] = {
          ...currentItem,
          quantity: newQty,
          price: unitPrice * newQty,
        };
        return copy;
      }

      return [...prev, itemConfig];
    });
    setIsCartOpen(true);
  };

  // Quick Add from Catalog Grid
  const handleQuickAddToCart = (product, price, currency) => {
    const itemConfig = {
      product,
      selectedMaterial: product.materials ? product.materials[0] : null,
      monogram: product.modelType === 'bayong' ? monogram : '',
      unitPrice: price,
      quantity: 1,
      price,
      currency,
    };
    handleAddToCart(itemConfig);
  };

  // Update Item Quantity in Bag
  const handleUpdateCartQuantity = (index, newQty) => {
    setCart((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          const maxStock = typeof item.product?.batchRemaining === 'number' ? item.product.batchRemaining : 99;
          const clampedQty = Math.max(1, Math.min(maxStock, newQty));
          const unitPrice = item.unitPrice || Math.round(item.price / (item.quantity || 1));
          return {
            ...item,
            quantity: clampedQty,
            price: unitPrice * clampedQty,
          };
        }
        return item;
      })
    );
  };

  // Remove Item from Bag
  const handleRemoveFromCart = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  // Proceed to Checkout from Bag
  const handleProceedToCheckout = (packagingConfig) => {
    sound.playBrassClick();
    setDirectCheckoutItem(null);
    setCheckoutPackaging(packagingConfig);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Direct 1-Click Acquisition from Product Page
  const handleDirectCheckout = (itemConfig) => {
    sound.playBrassClick();
    setDirectCheckoutItem(itemConfig);
    setCheckoutPackaging({ packagingType: 'Kamagong Crate', giftNote: 'Heirloom Reserve' });
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Order Completed: Record order and atomically deduct purchased stock from product inventory
  const handleOrderCompleted = (orderData) => {
    // Clear cart and directCheckoutItem after successful order authorization
    setCart([]);
    setDirectCheckoutItem(null);
    if (orderData) {
      setOrders((prev) => {
        const updated = [orderData, ...prev];
        try {
          localStorage.setItem('likha_patron_orders', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      // Atomically deduct inventory for every purchased item
      if (Array.isArray(orderData.items) && orderData.items.length > 0) {
        setProducts((prevProducts) => {
          const { updatedProducts } = deductStockForOrder(orderData.items, prevProducts);

          try {
            localStorage.setItem('likha_catalog_items', JSON.stringify(updatedProducts));
          } catch (e) {
            console.warn('localStorage catalog save warning:', e);
          }

          return updatedProducts;
        });

        // Also update activeProduct displayed in 3D Hero / ProductInfo
        setActiveProduct((currentActive) => {
          if (!currentActive) return currentActive;
          const purchasedItem = orderData.items.find(
            (it) => (it.product?.id || it.productId || it.id) === currentActive.id
          );
          if (purchasedItem) {
            const purchasedQty = Math.max(1, Number(purchasedItem.quantity || 1));
            const curStock = typeof currentActive.batchRemaining === 'number'
              ? currentActive.batchRemaining
              : (typeof currentActive.batch_remaining === 'number' ? currentActive.batch_remaining : 3);
            const newRemaining = Math.max(0, curStock - purchasedQty);
            const isArchived = newRemaining === 0;
            return {
              ...currentActive,
              batchRemaining: newRemaining,
              batch_remaining: newRemaining,
              stockStatus: isArchived ? 'archived' : currentActive.stockStatus,
              stock_status: isArchived ? 'archived' : currentActive.stock_status,
            };
          }
          return currentActive;
        });

        // Ensure the order and stock deduction are recorded in PostgreSQL database
        try {
          fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData),
          })
            .then((r) => r.json())
            .then(() => refreshProducts())
            .catch((e) => console.warn('Order sync non-fatal:', e));
        } catch (err) {
          console.warn('Order API sync notice:', err);
        }
      }
    }
  };

  // Admin CRUD Handlers
  const handleCreateProduct = async (newProd) => {
    const normalized = normalizeProduct(newProd);
    setProducts((prev) => {
      const updated = [normalized, ...prev.filter((p) => p.id !== normalized.id)];
      try {
        localStorage.setItem('likha_catalog_items', JSON.stringify(updated));
      } catch (e) {
        console.warn('localStorage quota warning:', e);
      }
      return updated;
    });

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalized),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.product) {
          const finalProd = normalizeProduct(data.product);
          setProducts((prev) => prev.map((p) => (p.id === finalProd.id ? finalProd : p)));
        }
      }
      refreshProducts();
    } catch (e) {
      console.warn('API POST failed, saved to local storage cache:', e);
    }
  };

  const handleUpdateProduct = async (updatedProd) => {
    const normalized = normalizeProduct(updatedProd);

    // Update persistent stock map if admin modified stock
    if (typeof normalized.batchRemaining === 'number') {
      updateProductStockInStorage(normalized.id, normalized.batchRemaining);
    }

    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === normalized.id ? normalized : p));
      try {
        localStorage.setItem('likha_catalog_items', JSON.stringify(updated));
      } catch (e) {
        console.warn('localStorage quota warning:', e);
      }
      return updated;
    });

    if (activeProduct && activeProduct.id === normalized.id) {
      setActiveProduct(normalized);
      if (normalized.materials && normalized.materials.length > 0) {
        setSelectedMaterial(normalized.materials[0]);
      }
    }

    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalized),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.product) {
          const finalProd = normalizeProduct(data.product);
          setProducts((prev) => prev.map((p) => (p.id === finalProd.id ? finalProd : p)));
        }
      }
      refreshProducts();
    } catch (e) {
      console.warn('API PUT failed, saved to local storage cache:', e);
    }
  };

  const handleDeleteProduct = async (productId) => {
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== productId);
      try {
        localStorage.setItem('likha_catalog_items', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (activeProduct && activeProduct.id === productId) {
      const remaining = products.filter((p) => p.id !== productId);
      if (remaining.length > 0) {
        handleSelectProduct(remaining[0]);
      }
    }

    try {
      await fetch(`/api/products?id=${encodeURIComponent(productId)}`, {
        method: 'DELETE',
      });
      refreshProducts();
    } catch (e) {
      console.warn('API DELETE failed, saved to local storage cache:', e);
    }
  };

  // If user accesses the hidden /admin or /curator route, render the dedicated Curator Studio Portal
  if (currentPath === '/admin') {
    return (
      <React.Suspense fallback={<AtelierLoadingChamber />}>
        <CuratorStudioPage
          products={products}
          onCreateProduct={handleCreateProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
          onNavigateToStorefront={navigateToStorefront}
          onRefreshProducts={refreshProducts}
          activeCurrency={activeCurrency}
        />
      </React.Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#24140E] font-sans antialiased flex flex-col justify-between">
      
      {/* Floating Liquid Glass Navigation with Top Prestige Ticker (Customer Storefront) */}
      <Navbar
        cartCount={cart.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenMap={() => setIsMapOpen(true)}
        onOpenUnboxing={() => setIsUnboxingOpen(true)}
        onOpenConcierge={() => setIsConciergeOpen(true)}
        onOpenAuth={(notice) => {
          setAuthNotice(notice || '');
          setIsAuthOpen(true);
        }}
        onOpenAccount={() => setIsAccountOpen(true)}
        onSelectTerno={() => {
          const terno = products.find((p) => p.id === 'terno-capelet') || products[0];
          if (terno) handleSelectProduct(terno);
          document.getElementById('stage')?.scrollIntoView({ behavior: 'smooth' });
        }}
        activeCurrency={activeCurrency}
        onCurrencyChange={setActiveCurrency}
      />

      {/* Main Content */}
      <main className="pt-28 sm:pt-32">
        
        {/* 3D Flagship Hero Stage */}
        <section id="stage" className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-4 sm:py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 items-center">
            
            {/* Left 3D Viewport (7 Cols on desktop) */}
            <div className="lg:col-span-7 xl:col-span-7 w-full">
              <Stage3D
                product={activeProduct}
                selectedMaterial={selectedMaterial}
                activeMood={activeMood}
                onMoodChange={setActiveMood}
              />
            </div>

            {/* Right Product Specs & Customizer (5 Cols on desktop) */}
            <div className="lg:col-span-5 xl:col-span-5 w-full">
              <ProductInfo
                product={activeProduct}
                selectedMaterial={selectedMaterial}
                onSelectMaterial={setSelectedMaterial}
                monogram={monogram}
                onMonogramChange={setMonogram}
                activeCurrency={activeCurrency}
                onAddToCart={handleAddToCart}
                onDirectCheckout={handleDirectCheckout}
                onOpenConcierge={() => setIsConciergeOpen(true)}
              />
            </div>

          </div>

          {/* 3D Stage Carousel Deck (All 3D Models in Catalog) */}
          <ProductCarousel
            products={products}
            activeProductId={activeProduct.id}
            onSelectProduct={handleSelectProduct}
            activeCurrency={activeCurrency}
          />
        </section>

        {/* Heritage Catalog Grid */}
        <CatalogGrid
          products={products}
          onSelectProduct={handleSelectProduct}
          onQuickAddToCart={handleQuickAddToCart}
          activeCurrency={activeCurrency}
        />

        {/* Craftsmanship Storytelling */}
        <StorySection />

      </main>

      {/* Footer */}
      <Footer />

      {/* Modals & Drawers */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onRemoveItem={handleRemoveFromCart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onProceedToCheckout={handleProceedToCheckout}
        activeCurrency={activeCurrency}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => {
          setIsCheckoutOpen(false);
          setDirectCheckoutItem(null);
        }}
        items={directCheckoutItem ? [directCheckoutItem] : cart}
        packagingOptions={checkoutPackaging}
        activeCurrency={activeCurrency}
        onOrderCompleted={handleOrderCompleted}
        onOpenAuth={(notice) => {
          setAuthNotice(notice || 'Patron sign-in is required before paying.');
          setIsAuthOpen(true);
        }}
      />

      <React.Suspense fallback={null}>
        {isUnboxingOpen && (
          <UnboxingModal
            isOpen={isUnboxingOpen}
            onClose={() => setIsUnboxingOpen(false)}
          />
        )}

        {isMapOpen && (
          <ArtisanMapModal
            isOpen={isMapOpen}
            onClose={() => setIsMapOpen(false)}
          />
        )}

        {isConciergeOpen && (
          <ConciergeModal
            isOpen={isConciergeOpen}
            onClose={() => setIsConciergeOpen(false)}
            catalog={products}
            activeProduct={activeProduct}
            onSelectProduct={handleSelectProduct}
            onAddToCart={handleQuickAddToCart}
            orders={orders}
          />
        )}

        {isAuthOpen && (
          <AuthModal
            isOpen={isAuthOpen}
            onClose={() => {
              setIsAuthOpen(false);
              setAuthNotice('');
            }}
            notice={authNotice}
            onSuccess={() => {
              if (pendingCheckoutPackaging) {
                setCheckoutPackaging(pendingCheckoutPackaging);
                setPendingCheckoutPackaging(null);
                setAuthNotice('');
                setIsCheckoutOpen(true);
              }
            }}
          />
        )}

        {isAccountOpen && (
          <AccountModal
            isOpen={isAccountOpen}
            onClose={() => setIsAccountOpen(false)}
          />
        )}
      </React.Suspense>

    </div>
  );
}
