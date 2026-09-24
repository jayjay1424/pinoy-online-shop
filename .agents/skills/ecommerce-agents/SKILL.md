---
name: ecommerce-agents
description: >-
  Multi-Agent E-Commerce Architecture adopted directly from nitin27may/e-commerce-agents.
  Equips systems with 6 collaborating specialized AI agents over the A2A (Agent-to-Agent) protocol:
  Orchestrator (Intent Routing & Session Auth), Product Discovery (Semantic & Faceted Search),
  Order Management (Lifecycle Tracking, Cancellations & Returns), Pricing & Promotions (Discounts & Loyalty),
  Review & Sentiment (Aspect Analysis & Authenticity), and Inventory & Fulfillment (Stock Allocations & Lead Times).
  Enforces Generative UI patterns (interactive cards, charts, timelines, tone badges, never raw JSON).
---

# Multi-Agent E-Commerce Architecture Skill

Adopted directly from **E-Commerce Agents** (`https://github.com/nitin27may/e-commerce-agents`), built on Microsoft Agent Framework (MAF), FastAPI, Next.js, and PostgreSQL + pgvector.

---

## 1. System Overview & The 6 Specialized Agents

The architecture splits monolithic e-commerce logic into **one Orchestrator** and **five Specialist Agents** communicating over the **A2A (Agent-to-Agent) protocol**:

```mermaid
graph TB
    subgraph Client["Client Tier"]
        FE["Next.js / React 19 Frontend<br/>Generative UI Engine"]
    end

    subgraph Gateway["Orchestrator & Intent Router"]
        ORCH["Orchestrator Agent<br/>JWT Auth · Intent Classification · Multi-Agent Synthesis"]
    end

    subgraph Specialists["Specialist Agent Tier (A2A Protocol)"]
        PD["1. Product Discovery<br/>Semantic & Faceted Search"]
        OM["2. Order Management<br/>Tracking & Returns"]
        PP["3. Pricing & Promotions<br/>Discounts & Loyalty Tiers"]
        RS["4. Review & Sentiment<br/>Aspect Mining & Authenticity"]
        IF["5. Inventory & Fulfillment<br/>Stock & Artisan Lead Times"]
    end

    subgraph Storage["Data & Vector Infrastructure"]
        PG[("PostgreSQL + pgvector<br/>Catalog · Orders · Reviews")]
    end

    FE -->|"Chat Stream / SSE"| ORCH
    ORCH -->|"A2A /message:send"| PD
    ORCH -->|"A2A /message:send"| OM
    ORCH -->|"A2A /message:send"| PP
    ORCH -->|"A2A /message:send"| RS
    ORCH -->|"A2A /message:send"| IF

    PD --> PG
    OM --> PG
    PP --> PG
    RS --> PG
    IF --> PG
```

---

## 2. Specialist Agent Matrix & Tool Registry

| Agent | Core Responsibility | Key Tools & Functions | Generative UI Output |
| :--- | :--- | :--- | :--- |
| **Orchestrator** | Intent classification, conversation context, specialist dispatch, and final multi-agent synthesis. | `route_intent()`, `call_specialist_agent()`, `synthesize_response()` | Agent Activity Timeline disclosure, multi-agent status badges |
| **Product Discovery** | Natural language semantic discovery, price/region filtering, recommendations, and product comparisons. | `search_products()`, `semantic_search()`, `compare_products()`, `get_recommendations()` | Interactive Product Cards with "View in 3D" and "Add to Cart" actions |
| **Order Management** | Order tracking, milestone timelines, cancellations, and return eligibility verification. | `get_user_orders()`, `get_order_tracking()`, `cancel_order()`, `initiate_return()` | Visual Order Milestone Stepper (Placed -> Crafting -> Inspected -> Dispatched -> Delivered) |
| **Pricing & Promotions** | Coupon validation, discount application, loyalty tier perks, and artisan fair-trade splits. | `validate_coupon()`, `get_active_deals()`, `calculate_loyalty_tier()`, `calculate_split()` | Interactive Coupon Cards with 1-click "Claim/Apply" button and savings breakdown |
| **Review & Sentiment** | Customer review aggregation, sentiment topic extraction, and verified buyer checks. | `get_product_reviews()`, `analyze_sentiment()`, `get_topic_breakdown()`, `detect_fake_reviews()` | Rating Distribution Chart, Aspect Sentiment Gauges, and Verified Buyer Testimonial Badges |
| **Inventory & Fulfillment** | Real-time stock levels, batch allocation, handcrafted lead times, and warehouse dispatch estimates. | `check_stock()`, `get_batch_status()`, `estimate_lead_time()`, `get_artisan_coop()` | Stock Level Badges ("Limited Batch: 2 Left"), Artisan Lead Time Callout |

---

## 3. Generative UI Philosophy (Strict Rule: Never Dump Raw JSON)

The chat interface **never dumps raw JSON or unformatted prose** when structured data is returned:

1. **Product Query** $\to$ Render an interactive grid or carousel of **Product Cards** with image, title, price, artisan region, and actionable buttons.
2. **Order Inquiry** $\to$ Render a visual **Order Stepper** with progress bar, delivery date, courier name, and current fulfillment phase.
3. **Discount Query** $\to$ Render **Coupon Voucher Badges** with copy/apply action and countdown/expiry tags.
4. **Review Query** $\to$ Render **Sentiment Aspect Bars** (e.g., Craftsmanship 98%, Material Quality 96%) and star ratings.
5. **Inventory Query** $\to$ Render a **Batch Remaining Meter** and craft timeline estimate.

---

## 4. Multi-Agent Collaboration Flows

### Scenario A: Complex Return & Repurchase
```mermaid
sequenceDiagram
    actor User
    participant ORCH as Orchestrator
    participant OM as Order Management
    participant PD as Product Discovery
    participant IF as Inventory
    participant PP as Pricing

    User->>ORCH: "Track my order #LIKHA-1001 and find me a matching pearl ring"
    ORCH->>OM: A2A Call 1: Fetch order #LIKHA-1001 status
    OM-->>ORCH: Order in transit, delivered in 2 days
    ORCH->>PD: A2A Call 2: Search matching pearl jewelry
    PD-->>ORCH: Found Palawan Golden Pearl Ring
    ORCH->>IF: A2A Call 3: Check pearl ring stock
    IF-->>ORCH: 3 pieces available in Manila Atelier
    ORCH->>PP: A2A Call 4: Check collector discount
    PP-->>ORCH: 10% Loyalty discount applicable (Code: LIKHA10)
    ORCH-->>User: Synthesized reply with Order Stepper + Product Card + Coupon Voucher
```

---

## 5. Implementation Standards for Pinoy Online Shop

1. **Client-Side & Serverless Agility**:
   - Provide an in-browser Multi-Agent Orchestration Engine inside `ConciergeModal.jsx` that runs instantaneously with zero cold-start delay.
   - Support seamless fallback between local rule-based intent parsing and remote LLM endpoints.
2. **Heritage Cultural Resonance**:
   - Reflect Philippine artisan cooperatives, regional origins (Lumban, Basey, Lake Sebu, Meycauayan, Palawan, Vigan), and fair-trade metrics.
3. **Interactive 3D Integration**:
   - Product recommendations link directly to the Three.js 3D viewport, allowing users to inspect items in real time.
