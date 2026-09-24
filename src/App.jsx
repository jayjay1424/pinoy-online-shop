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

  // Dynamic catalog state with localStorage persistence and API sync
  const [products, setProducts] = useState(() => {
    try {
      const stored = localStorage.getItem('likha_catalog_items');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((x) => x.id));
          const missingFromCode = PRODUCTS.filter((p) => !existingIds.has(p.id));
          const combined = [...parsed, ...missingFromCode];
          return combined.map(normalizeProduct);
        }
      }
    } catch (e) {
      console.warn('Failed to parse catalog from localStorage', e);
    }
    return PRODUCTS.map(normalizeProduct);
  });

  const [activeProduct, setActiveProduct] = useState(() => {
    try {
      const stored = localStorage.getItem('likha_catalog_items');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return normalizeProduct(parsed[0]);
        }
      }
    } catch (e) {}
    return normalizeProduct(PRODUCTS[0]);
  });

  const [selectedMaterial, setSelectedMaterial] = useState(
    PRODUCTS[0].materials && PRODUCTS[0].materials.length > 0 ? PRODUCTS[0].materials[0] : null
  );
  const [monogram, setMonogram] = useState('JR');
  const [activeMood, setActiveMood] = useState('jeweler_daylight');
  const [activeCurrency, setActiveCurrency] = useState('PHP');

  const [cart, setCart] = useState([]);
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

  // Sync with PostgreSQL / Serverless API on mount if available
  useEffect(() => {
    fetch('/api/products')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const prods = data?.products || data?.data;
        if (data && data.success && Array.isArray(prods) && prods.length > 0) {
          const normalizedList = prods.map(normalizeProduct);
          setProducts(normalizedList);
          try {
            localStorage.setItem('likha_catalog_items', JSON.stringify(normalizedList));
          } catch (e) {}
        }
      })
      .catch((err) => {
        console.log('Using local catalog cache:', err.message);
      });
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
    setCart((prev) => [...prev, itemConfig]);
    setIsCartOpen(true);
  };

  // Quick Add from Catalog Grid
  const handleQuickAddToCart = (product, price, currency) => {
    const itemConfig = {
      product,
      selectedMaterial: product.materials ? product.materials[0] : null,
      monogram: product.modelType === 'bayong' ? monogram : '',
      price,
      currency,
    };
    setCart((prev) => [...prev, itemConfig]);
    setIsCartOpen(true);
  };

  // Remove Item from Bag
  const handleRemoveFromCart = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  // Proceed to Checkout
  const handleProceedToCheckout = (packagingConfig) => {
    if (!isAuthenticated) {
      sound.playBrassClick();
      setPendingCheckoutPackaging(packagingConfig);
      setAuthNotice('Patron sign-in is required before placing an order or authorizing payment.');
      setIsCartOpen(false);
      setIsAuthOpen(true);
      return;
    }
    setCheckoutPackaging(packagingConfig);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Order Completed
  const handleOrderCompleted = (orderData) => {
    // Clear cart after successful order authorization
    setCart([]);
    if (orderData) {
      setOrders((prev) => {
        const updated = [orderData, ...prev];
        try {
          localStorage.setItem('likha_patron_orders', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
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
    } catch (e) {
      console.warn('API POST failed, saved to local storage cache:', e);
    }
  };

  const handleUpdateProduct = async (updatedProd) => {
    const normalized = normalizeProduct(updatedProd);
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
        <section id="stage" className="max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left 3D Viewport (7 Cols on desktop) */}
            <div className="lg:col-span-7 w-full">
              <Stage3D
                product={activeProduct}
                selectedMaterial={selectedMaterial}
                activeMood={activeMood}
                onMoodChange={setActiveMood}
              />
            </div>

            {/* Right Product Specs & Customizer (5 Cols on desktop) */}
            <div className="lg:col-span-5 w-full">
              <ProductInfo
                product={activeProduct}
                selectedMaterial={selectedMaterial}
                onSelectMaterial={setSelectedMaterial}
                monogram={monogram}
                onMonogramChange={setMonogram}
                activeCurrency={activeCurrency}
                onAddToCart={handleAddToCart}
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
        onProceedToCheckout={handleProceedToCheckout}
        activeCurrency={activeCurrency}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
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
