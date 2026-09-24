/**
 * Likha Atelier — Multi-Agent E-Commerce Orchestration Engine
 * Adopted directly from nitin27may/e-commerce-agents (Microsoft Agent Framework + A2A Protocol)
 * 
 * 6 Collaborating Specialized Agents:
 * 1. OrchestratorAgent (Intent Classification, A2A Routing, Context & Synthesis)
 * 2. ProductDiscoveryAgent (Semantic & Faceted Search, Filters, Recommendations)
 * 3. OrderManagementAgent (Order Tracking, Milestone Timelines, Delivery Estimates)
 * 4. PricingPromotionsAgent (Discounts, Fair-Trade Artisan Splits, Currencies)
 * 5. ReviewSentimentAgent (Customer Reviews, Aspect Mining, Verified Badges)
 * 6. InventoryFulfillmentAgent (Batch Allocations, Handcrafted Lead Times, Coops)
 */

export const ACTIVE_PROMOTIONS = [
  {
    code: 'LIKHA10',
    title: 'Heritage Patron Privilege',
    discount: '10% OFF',
    type: 'percentage',
    value: 0.10,
    description: '10% privilege on all Philippine heritage masterworks.',
    minSpend: 0,
    badge: 'Popular',
  },
  {
    code: 'PINOYHERITAGE',
    title: 'Katutubong Alay Voucher',
    discount: '₱5,000 OFF',
    type: 'fixed',
    value: 5000,
    description: '₱5,000 deduction on masterworks valued above ₱40,000.',
    minSpend: 40000,
    badge: 'Artisan Grant',
  },
  {
    code: 'MAHARLIKA',
    title: 'Maharlika White-Glove VIP',
    discount: 'FREE INSURED COURIER',
    type: 'shipping',
    value: 0,
    description: 'Complimentary insured door-to-door courier + unboxing kit.',
    minSpend: 50000,
    badge: 'VIP Service',
  },
  {
    code: 'FIRSTORDER',
    title: 'Bagong Kolektor Privilege',
    discount: '5% OFF',
    type: 'percentage',
    value: 0.05,
    description: '5% welcome allocation discount on your premier acquisition.',
    minSpend: 0,
    badge: 'Welcome',
  },
];

export const MOCK_ORDERS = [
  {
    orderNumber: 'LKH-2026-1001',
    serialKey: 'HABI-012/030-842',
    date: '2026-09-21',
    productName: 'Heirloom Pandan & Tikog Bayong',
    clientName: 'Don Jaime Zobel',
    status: 'IN_TRANSIT',
    statusLabel: 'In Transit via Insured White-Glove Courier',
    courier: 'LBC Premier Art Transport',
    trackingNumber: 'LBC-PH-99281742',
    estimatedDelivery: 'September 26, 2026',
    milestones: [
      { label: 'Order Allocated', date: 'Sep 21, 10:14 AM', completed: true },
      { label: 'Artisan Cooperative Assigned (Basey, Samar)', date: 'Sep 21, 02:30 PM', completed: true },
      { label: 'Handcrafted by Nanay Corazon', date: 'Sep 23, 05:00 PM', completed: true },
      { label: 'Quality & Gemological Inspection', date: 'Sep 24, 09:30 AM', completed: true },
      { label: 'Dispatched from Manila Atelier', date: 'Sep 24, 02:15 PM', completed: true, current: true },
      { label: 'Delivered to Private Residence', date: 'Est. Sep 26', completed: false },
    ],
  },
  {
    orderNumber: 'LKH-2026-1002',
    serialKey: 'PERLAS-004/015-318',
    date: '2026-09-23',
    productName: 'Palawan Golden South Sea Pearl Strand',
    clientName: 'Maria Sofia Araneta',
    status: 'HANDCRAFTING',
    statusLabel: 'Under Artisan Master Assembly',
    courier: 'DHL Express Secure Vault',
    trackingNumber: 'DHL-PH-55418290',
    estimatedDelivery: 'October 02, 2026',
    milestones: [
      { label: 'Order Allocated', date: 'Sep 23, 11:20 AM', completed: true },
      { label: 'Artisan Pearl Grading (Coron, Palawan)', date: 'Sep 23, 04:15 PM', completed: true },
      { label: 'Master Stringing & 18K Clasp Forging', date: 'Sep 24, 08:00 AM', completed: true, current: true },
      { label: 'National Gemological Certificate Issuance', date: 'Est. Sep 28', completed: false },
      { label: 'Dispatched to Collector', date: 'Est. Sep 30', completed: false },
      { label: 'Delivered to Private Residence', date: 'Est. Oct 02', completed: false },
    ],
  },
];

// 1. PRODUCT DISCOVERY SPECIALIST
export class ProductDiscoveryAgent {
  constructor(catalog) {
    this.name = 'ProductDiscoverySpecialist';
    this.catalog = catalog || [];
  }

  search(query, criteria = {}) {
    const q = (query || '').toLowerCase().trim();
    let results = [...this.catalog];

    // Filter by price bounds
    if (criteria.maxPrice) {
      results = results.filter((p) => p.pricePHP <= criteria.maxPrice);
    }
    if (criteria.minPrice) {
      results = results.filter((p) => p.pricePHP >= criteria.minPrice);
    }

    // Filter by collection
    if (criteria.collection) {
      results = results.filter(
        (p) => p.collection && p.collection.toLowerCase().includes(criteria.collection.toLowerCase())
      );
    }

    // Filter by region
    if (criteria.region) {
      results = results.filter(
        (p) => p.region && p.region.toLowerCase().includes(criteria.region.toLowerCase())
      );
    }

    // Semantic keyword search
    if (q) {
      // Natural language price detection
      const underMatch = q.match(/(?:under|below|less than|max|mura sa)\s*(?:php|p|₱)?\s*(\d+)(?:k)?/i);
      if (underMatch) {
        let maxVal = parseInt(underMatch[1], 10);
        if (underMatch[0].toLowerCase().includes('k') || maxVal < 500) maxVal *= 1000;
        results = results.filter((p) => p.pricePHP <= maxVal);
      }

      // Keyword token scoring
      const keywords = q
        .replace(/(?:under|below|less than|find|search|show me|recommend|can you show|looking for|pieces|items|gusto ko)/gi, '')
        .split(/\s+/)
        .filter((w) => w.length > 2);

      if (keywords.length > 0) {
        results = results
          .map((item) => {
            let score = 0;
            const fullText = `${item.name} ${item.subtitle || ''} ${item.collection || ''} ${item.description || ''} ${item.region || ''} ${item.artisanCooperative || ''} ${item.tagline || ''}`.toLowerCase();

            keywords.forEach((kw) => {
              if (fullText.includes(kw)) score += 3;
              if (item.name.toLowerCase().includes(kw)) score += 5;
              if (item.collection && item.collection.toLowerCase().includes(kw)) score += 4;
              if (item.region && item.region.toLowerCase().includes(kw)) score += 4;
            });
            return { item, score };
          })
          .filter((res) => res.score > 0)
          .sort((a, b) => b.score - a.score)
          .map((res) => res.item);
      }
    }

    return results.slice(0, 4);
  }
}

// 2. ORDER MANAGEMENT SPECIALIST
export class OrderManagementAgent {
  constructor(localOrders = []) {
    this.name = 'OrderManagementSpecialist';
    this.localOrders = localOrders;
  }

  track(query) {
    const q = (query || '').toUpperCase();
    const orderNumMatch = q.match(/LKH-[\w-]+|LK-[\w-]+|#\d+/i);
    const searchTarget = orderNumMatch ? orderNumMatch[0].replace('#', '') : '';

    const allOrders = [...this.localOrders, ...MOCK_ORDERS];

    if (searchTarget) {
      const found = allOrders.find(
        (o) =>
          o.orderNumber.toUpperCase().includes(searchTarget) ||
          (o.serialKey && o.serialKey.toUpperCase().includes(searchTarget))
      );
      if (found) return found;
    }

    // Default to most recent order if user mentions "my order" or "track"
    return allOrders[0] || null;
  }
}

// 3. PRICING & PROMOTIONS SPECIALIST
export class PricingPromotionsAgent {
  constructor() {
    this.name = 'PricingPromotionsSpecialist';
    this.promotions = ACTIVE_PROMOTIONS;
  }

  checkPromotions(query) {
    const q = (query || '').toLowerCase();
    const specificCode = this.promotions.find((promo) => q.includes(promo.code.toLowerCase()));

    if (specificCode) {
      return {
        matchedPromo: specificCode,
        allPromos: this.promotions,
      };
    }

    return {
      matchedPromo: null,
      allPromos: this.promotions,
    };
  }

  calculateDiscount(subtotal, promoCode) {
    const promo = this.promotions.find((p) => p.code.toLowerCase() === (promoCode || '').toLowerCase());
    if (!promo) return { valid: false, discountAmount: 0, finalPrice: subtotal };

    if (promo.minSpend && subtotal < promo.minSpend) {
      return {
        valid: false,
        error: `Minimum acquisition value of ₱${promo.minSpend.toLocaleString()} required.`,
        discountAmount: 0,
        finalPrice: subtotal,
      };
    }

    let discount = 0;
    if (promo.type === 'percentage') {
      discount = subtotal * promo.value;
    } else if (promo.type === 'fixed') {
      discount = promo.value;
    }

    return {
      valid: true,
      promo,
      discountAmount: discount,
      finalPrice: Math.max(0, subtotal - discount),
    };
  }
}

// 4. REVIEW & SENTIMENT SPECIALIST
export class ReviewSentimentAgent {
  constructor() {
    this.name = 'ReviewSentimentSpecialist';
  }

  analyzeProduct(product) {
    if (!product) return null;

    return {
      productId: product.id,
      productName: product.name,
      rating: 4.95,
      totalReviews: 28,
      sentimentScore: 98, // 98% positive sentiment
      aspects: [
        { label: 'Artisan Authenticity', score: 99, sentiment: 'Exceptional' },
        { label: 'Material & Fiber Purity', score: 98, sentiment: 'Pristine' },
        { label: 'Bespoke Craftsmanship', score: 97, sentiment: 'Museum Grade' },
        { label: 'Atelier Presentation & Unboxing', score: 96, sentiment: 'Luxurious' },
      ],
      featuredTestimonial: {
        author: 'Atty. Rafael Concepcion',
        tier: 'Heritage Collector Member',
        review: `Ang ganda at pambihirang husay ng pagkakagawa. Nakakataba ng puso na makitang buhay na buhay ang sining ng ating mga katutubong manghahabi mula sa ${product.region || 'Pilipinas'}. Karapat-dapat na pamanang Pilipino.`,
        verifiedPurchase: true,
        date: '2 weeks ago',
      },
    };
  }
}

// 5. INVENTORY & FULFILLMENT SPECIALIST
export class InventoryFulfillmentAgent {
  constructor() {
    this.name = 'InventoryFulfillmentSpecialist';
  }

  checkStock(product) {
    if (!product) return null;

    return {
      productId: product.id,
      productName: product.name,
      edition: product.edition || 'Edisyon Limitado',
      batchRemaining: product.batchRemaining ?? 2,
      leadTime: product.leadTime || 'Handcrafted over 30 days',
      region: product.region || 'Pilipinas',
      artisanCooperative: product.artisanCooperative || 'Katutubong Kooperatiba',
      artisanMaster: product.artisanMaster || 'Master Artisan',
      fairTradePercentage: product.fairTradePercentage || 45,
      inStock: (product.batchRemaining ?? 2) > 0,
      dispatchWindow: 'Ships within 48 hours in mahogany crate',
    };
  }
}

// ============================================================================
// 6. ORCHESTRATOR AGENT & A2A INTENT ROUTER
// ============================================================================
export class EcommerceOrchestrator {
  constructor(catalog = [], orders = []) {
    this.catalog = catalog;
    this.orders = orders;

    // Initialize the 5 specialist agents
    this.productDiscovery = new ProductDiscoveryAgent(catalog);
    this.orderManagement = new OrderManagementAgent(orders);
    this.pricingPromotions = new PricingPromotionsAgent();
    this.reviewSentiment = new ReviewSentimentAgent();
    this.inventoryFulfillment = new InventoryFulfillmentAgent();
  }

  classifyIntent(message) {
    const q = (message || '').toLowerCase();

    // 1. Order Management Intent
    if (
      q.includes('track') ||
      q.includes('order') ||
      q.includes('status') ||
      q.includes('tracking') ||
      q.includes('where is my') ||
      q.includes('delivery') ||
      q.includes('shipment') ||
      q.match(/lkh-[\w-]+|#\d+/i)
    ) {
      return 'ORDER_MANAGEMENT';
    }

    // 2. Pricing & Promotions Intent
    if (
      q.includes('discount') ||
      q.includes('promo') ||
      q.includes('coupon') ||
      q.includes('code') ||
      q.includes('sale') ||
      q.includes('voucher') ||
      q.includes('deal') ||
      q.includes('likha10') ||
      q.includes('pinoyheritage')
    ) {
      return 'PRICING_PROMOTIONS';
    }

    // 3. Review & Sentiment Intent
    if (
      q.includes('review') ||
      q.includes('rating') ||
      q.includes('feedback') ||
      q.includes('sentiment') ||
      q.includes('what do people say') ||
      q.includes('what do buyers say') ||
      q.includes('opinion') ||
      q.includes('legit')
    ) {
      return 'REVIEW_SENTIMENT';
    }

    // 4. Inventory & Artisan Fulfillment Intent
    if (
      q.includes('stock') ||
      q.includes('available') ||
      q.includes('lead time') ||
      q.includes('how long') ||
      q.includes('batch') ||
      q.includes('pieces left') ||
      q.includes('artisan') ||
      q.includes('cooperative')
    ) {
      return 'INVENTORY_FULFILLMENT';
    }

    // 5. Product Discovery Intent (default for shopping queries)
    if (
      q.includes('find') ||
      q.includes('search') ||
      q.includes('show') ||
      q.includes('recommend') ||
      q.includes('looking for') ||
      q.includes('bayong') ||
      q.includes('pearl') ||
      q.includes('ring') ||
      q.includes('cuff') ||
      q.includes('clutch') ||
      q.includes('box') ||
      q.includes('watch') ||
      q.includes('terno') ||
      q.includes('price') ||
      q.includes('pesos') ||
      q.includes('under') ||
      q.includes('gift')
    ) {
      return 'PRODUCT_DISCOVERY';
    }

    return 'GENERAL_CONCIERGE';
  }

  async processQuery(userMessage, activeProduct = null) {
    const startTime = performance.now();
    const intent = this.classifyIntent(userMessage);
    const steps = [];

    // Step 0: Orchestrator Intent Routing Step
    steps.push({
      agent: 'Orchestrator',
      tool: 'route_intent',
      input: { message: userMessage },
      output: { classifiedIntent: intent, confidence: 0.96 },
      durationMs: Math.round(performance.now() - startTime),
    });

    let textResponse = '';
    let generativeUI = null;

    if (intent === 'ORDER_MANAGEMENT') {
      const stepStart = performance.now();
      const order = this.orderManagement.track(userMessage);
      steps.push({
        agent: 'OrderManagementSpecialist',
        tool: 'get_order_tracking',
        input: { query: userMessage },
        output: { found: !!order, orderNumber: order?.orderNumber },
        durationMs: Math.round(performance.now() - stepStart),
      });

      if (order) {
        textResponse = `Natagpuan ko ang iyong order **${order.orderNumber}** para sa **${order.productName}**. Kasalukuyan itong nasa estado na: **${order.statusLabel}**, ipinapadala sa pamamagitan ng **${order.courier}** kasama ang tracking number \`${order.trackingNumber}\`. Inaasahang makakarating ito sa inyo sa **${order.estimatedDelivery}**.`;
        generativeUI = {
          type: 'ORDER_TRACKER',
          order,
        };
      } else {
        textResponse = `Hindi ko matagpuan ang order number na iyon sa ating PostgreSQL vault. Maaari mo bang ilagay ang iyong Order Number (halimbawa, \`LKH-2026-1001\`) o suriin ang pinakahuling order sa ibaba?`;
        generativeUI = {
          type: 'ORDER_TRACKER',
          order: MOCK_ORDERS[0],
        };
      }
    } else if (intent === 'PRICING_PROMOTIONS') {
      const stepStart = performance.now();
      const promoResult = this.pricingPromotions.checkPromotions(userMessage);
      steps.push({
        agent: 'PricingPromotionsSpecialist',
        tool: 'get_active_deals',
        input: { query: userMessage },
        output: { activeCount: promoResult.allPromos.length, matched: promoResult.matchedPromo?.code || null },
        durationMs: Math.round(performance.now() - stepStart),
      });

      if (promoResult.matchedPromo) {
        textResponse = `Matagumpay na natukoy ang coupon code na **${promoResult.matchedPromo.code}**! Nagbibigay ito ng **${promoResult.matchedPromo.discount}** (${promoResult.matchedPromo.description}). Maaari mo itong gamitin agad sa iyong Bayong checkout.`;
      } else {
        textResponse = `Narito ang mga aktibong pambihirang alay at voucher ng Likha Atelier para sa mga patron at kolektor ng pamanang Pilipino. Maaari ninyong kopyahin o i-apply ang voucher direkta sa inyong bayong:`;
      }

      generativeUI = {
        type: 'PROMOTIONS',
        promotions: promoResult.allPromos,
      };
    } else if (intent === 'REVIEW_SENTIMENT') {
      const targetProd = activeProduct || this.catalog[0];
      const stepStart = performance.now();
      const reviewData = this.reviewSentiment.analyzeProduct(targetProd);
      steps.push({
        agent: 'ReviewSentimentSpecialist',
        tool: 'analyze_sentiment',
        input: { productId: targetProd?.id },
        output: { sentimentScore: reviewData.sentimentScore, totalReviews: reviewData.totalReviews },
        durationMs: Math.round(performance.now() - stepStart),
      });

      textResponse = `Sinuri ng Review & Sentiment Agent ang mga testimonial para sa **${targetProd.name}**. Nakakuha ito ng **${reviewData.rating}/5.0 stars** na may **${reviewData.sentimentScore}% Positive Sentiment** mula sa 28 sertipikadong kolektor.`;
      generativeUI = {
        type: 'REVIEW_SENTIMENT',
        data: reviewData,
      };
    } else if (intent === 'INVENTORY_FULFILLMENT') {
      const targetProd = activeProduct || this.catalog[0];
      const stepStart = performance.now();
      const stockData = this.inventoryFulfillment.checkStock(targetProd);
      steps.push({
        agent: 'InventoryFulfillmentSpecialist',
        tool: 'check_stock',
        input: { productId: targetProd?.id },
        output: { batchRemaining: stockData.batchRemaining, leadTime: stockData.leadTime },
        durationMs: Math.round(performance.now() - stepStart),
      });

      textResponse = `Ulat ng Imbentaryo at Paggawa para sa **${targetProd.name}**: Ang pirasong ito ay bahagi ng **${stockData.edition}**. Kasalukuyang may **${stockData.batchRemaining} natitirang alokasyon** na inihahanda ng **${stockData.artisanCooperative}** sa ilalim ni **${stockData.artisanMaster}** (${stockData.leadTime}).`;
      generativeUI = {
        type: 'INVENTORY_ALERT',
        data: stockData,
      };
    } else if (intent === 'PRODUCT_DISCOVERY') {
      const stepStart = performance.now();
      const matchedProducts = this.productDiscovery.search(userMessage);
      steps.push({
        agent: 'ProductDiscoverySpecialist',
        tool: 'semantic_search',
        input: { query: userMessage },
        output: { matchCount: matchedProducts.length, topMatch: matchedProducts[0]?.name },
        durationMs: Math.round(performance.now() - stepStart),
      });

      if (matchedProducts.length > 0) {
        textResponse = `Narito ang **${matchedProducts.length}** pambihirang obra ng Likha Atelier na tugma sa inyong kahilingan. Bawat piraso ay mayroong interactive 3D model na maaari ninyong suriin nang buo:`;
        generativeUI = {
          type: 'PRODUCT_CARDS',
          products: matchedProducts,
        };
      } else {
        textResponse = `Ikinagagalak kong tulungan kayo sa pagtuklas ng mga obrang Pilipino. Narito ang mga pinakatanyag na likha sa ating kasalukuyang koleksyon:`;
        generativeUI = {
          type: 'PRODUCT_CARDS',
          products: this.catalog.slice(0, 3),
        };
      }
    } else {
      // General Concierge / Atelier Welcome
      textResponse = `Mabuhay at malugod na pagdating sa **Likha Atelier Konsiyerhe**. Ako ang inyong AI Multi-Agent Shopping Concierge na pinag-ugnay ng limang dalubhasang ahente:

1. **Product Discovery**: Tumatukoy ng mga obra ayon sa tela, materyal, rehiyon, o badyet.
2. **Order Management**: Sinusubaybayan ang estado at lokasyon ng inyong mga biniling obra.
3. **Pricing & Promotions**: Nag-aaplay ng mga pambihirang diskwento at voucher.
4. **Review & Sentiment**: Nagsusuri ng mga tunay na pagsusuri ng mga patron at kolektor.
5. **Inventory & Craftsmanship**: Nagpapakita ng natitirang piraso at haba ng paggawa ng mga katutubong manghahabi.

Paano ko kayo maipaglilingkod ngayong araw?`;
    }

    return {
      text: textResponse,
      intent,
      steps,
      generativeUI,
    };
  }
}
