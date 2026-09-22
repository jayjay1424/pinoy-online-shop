import React, { useState } from 'react';
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
import { sound } from './utils/sound';

export function App() {
  const [activeProduct, setActiveProduct] = useState(PRODUCTS[0]); // Default: Bayong Royale
  const [selectedMaterial, setSelectedMaterial] = useState(PRODUCTS[0].materials[0]);
  const [monogram, setMonogram] = useState('JR');
  const [activeMood, setActiveMood] = useState('jeweler_daylight');
  const [activeCurrency, setActiveCurrency] = useState('PHP');

  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutPackaging, setCheckoutPackaging] = useState(null);

  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isUnboxingOpen, setIsUnboxingOpen] = useState(false);
  const [isConciergeOpen, setIsConciergeOpen] = useState(false);

  // Handle product change
  const handleSelectProduct = (prod) => {
    setActiveProduct(prod);
    if (prod.materials && prod.materials.length > 0) {
      setSelectedMaterial(prod.materials[0]);
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
    setCheckoutPackaging(packagingConfig);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Order Completed
  const handleOrderCompleted = (orderData) => {
    // Clear cart after successful order authorization
    setCart([]);
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

          {/* 3D Stage Carousel Deck (All 7 3D Models) */}
          <ProductCarousel
            products={PRODUCTS}
            activeProductId={activeProduct.id}
            onSelectProduct={handleSelectProduct}
            activeCurrency={activeCurrency}
          />
        </section>

        {/* 18-Piece Heritage Catalog Grid */}
        <CatalogGrid
          products={PRODUCTS}
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

    </div>
  );
}
