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
import { UnboxingModal } from './components/UnboxingModal';
import { ArtisanMapModal } from './components/ArtisanMapModal';
import { ConciergeModal } from './components/ConciergeModal';
import { AuthModal } from './components/AuthModal';
import { AccountModal } from './components/AccountModal';
import { AdminModal } from './components/AdminModal';
import { useAuth } from './context/AuthContext';
import { sound } from './utils/sound';

export function App() {
  const { isAuthenticated } = useAuth();

  // Dynamic catalog state with localStorage persistence and API sync
  const [products, setProducts] = useState(() => {
    try {
      const stored = localStorage.getItem('likha_catalog_items');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse catalog from localStorage', e);
    }
    return PRODUCTS;
  });

  const [activeProduct, setActiveProduct] = useState(() => {
    try {
      const stored = localStorage.getItem('likha_catalog_items');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
      }
    } catch (e) {}
    return PRODUCTS[0];
  });

  const [selectedMaterial, setSelectedMaterial] = useState(
    PRODUCTS[0].materials && PRODUCTS[0].materials.length > 0 ? PRODUCTS[0].materials[0] : null
  );
  const [monogram, setMonogram] = useState('JR');
  const [activeMood, setActiveMood] = useState('jeweler_daylight');
  const [activeCurrency, setActiveCurrency] = useState('PHP');

  const [cart, setCart] = useState([]);
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
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Sync with PostgreSQL / Serverless API on mount if available
  useEffect(() => {
    fetch('/api/products')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.success && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
          try {
            localStorage.setItem('likha_catalog_items', JSON.stringify(data.products));
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
  };

  // Admin CRUD Handlers
  const handleCreateProduct = async (newProd) => {
    setProducts((prev) => {
      const updated = [newProd, ...prev];
      try {
        localStorage.setItem('likha_catalog_items', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProd),
      });
    } catch (e) {
      console.warn('API POST failed, saved to local storage cache:', e);
    }
  };

  const handleUpdateProduct = async (updatedProd) => {
    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === updatedProd.id ? updatedProd : p));
      try {
        localStorage.setItem('likha_catalog_items', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (activeProduct && activeProduct.id === updatedProd.id) {
      setActiveProduct(updatedProd);
      if (updatedProd.materials && updatedProd.materials.length > 0) {
        setSelectedMaterial(updatedProd.materials[0]);
      }
    }

    try {
      await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProd),
      });
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

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#24140E] font-sans antialiased flex flex-col justify-between">
      
      {/* Floating Liquid Glass Navigation with Top Prestige Ticker */}
      <Navbar
        cartCount={cart.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenMap={() => setIsMapOpen(true)}
        onOpenUnboxing={() => setIsUnboxingOpen(true)}
        onOpenConcierge={() => setIsConciergeOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
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

      <UnboxingModal
        isOpen={isUnboxingOpen}
        onClose={() => setIsUnboxingOpen(false)}
      />

      <ArtisanMapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
      />

      <ConciergeModal
        isOpen={isConciergeOpen}
        onClose={() => setIsConciergeOpen(false)}
      />

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

      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
      />

      {/* Curator Studio (Admin Catalog CRUD Portal) */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        onCreateProduct={handleCreateProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        onSelectForStage={(prod) => {
          handleSelectProduct(prod);
          document.getElementById('stage')?.scrollIntoView({ behavior: 'smooth' });
        }}
        activeCurrency={activeCurrency}
      />

    </div>
  );
}
