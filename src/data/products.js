// Philippine Heritage Haute Collection Data — 18 Masterworks
export const CURRENCY_RATES = {
  PHP: { symbol: '₱', rate: 1, label: 'PHP (₱)' },
  USD: { symbol: '$', rate: 0.0177, label: 'USD ($)' },
  EUR: { symbol: '€', rate: 0.0163, label: 'EUR (€)' },
  JPY: { symbol: '¥', rate: 2.72, label: 'JPY (¥)' },
};

export const PRODUCTS = [
  {
    id: 'terno-capelet',
    name: 'Modern Sculptural Terno (Barong para sa Kababaihan)',
    subtitle: 'Haute Butterfly Sleeves in Woven Pandan & Tikog Twill',
    collection: 'Kasuotan & Sutla',
    tagline: 'Handwoven Tikog & Pandan Twill • Architectural Butterfly Silhouette',
    pricePHP: 125000,
    edition: 'Edisyon Limitado — No. 04 ng 12',
    batchRemaining: 2,
    leadTime: 'Woven & sculpted over 40 days',
    region: 'Basey, Samar & Lumban, Laguna',
    artisanCooperative: 'Tikog Dreamweavers & Haute Couture Guild',
    artisanMaster: 'Nanay Corazon & Master Filipiniana Couturiers',
    fairTradePercentage: 48,
    has3DModel: true,
    modelType: 'terno',
    modelGlbUrl: '/models/terno.glb',
    description: 'An architectural Philippine haute-couture gown uniting the iconic towering butterfly sleeves of the traditional Maria Clara and Terno with authentic handwoven pandan and tikog grass fiber twill weave, accented with deep botanical crimson and magenta herringbone borders.',
    specs: [
      { label: 'Silhouette', value: 'High-slit architectural mermaid silhouette with soaring butterfly sleeves' },
      { label: 'Weaving', value: 'Handwoven Tikog and wild coastal Pandan fiber twill weave' },
      { label: 'Natural Accents', value: 'Botanical madder root and magenta dyed warp bands' },
      { label: 'Structure', value: 'Architectural boning with couture silk organza backing' }
    ],
    materials: [],
    cameraPresets: [
      { id: 'overview', label: 'Overview (3/4)', pos: [0, 1.4, 3.4], target: [0, 0.75, 0] },
      { id: 'sleeve', label: 'Butterfly Sleeve', pos: [0.85, 1.55, 1.4], target: [0.35, 1.35, 0] },
      { id: 'bodice', label: 'Woven Bodice', pos: [0, 1.15, 1.5], target: [0, 1.0, 0] },
      { id: 'skirt', label: 'Flared Mermaid Hem', pos: [0.95, 0.45, 1.6], target: [0, 0.25, 0] }
    ]
  },
  {
    id: 'bayong-royale',
    name: 'Bayong Royale',
    subtitle: 'Haute Woven Palm Leaf Tote',
    collection: 'Habi & Dahon',
    tagline: 'Handwoven in Laguna & Bohol • Italian Vachetta & Cast Brass',
    pricePHP: 48500,
    edition: 'Edisyon Limitado — Habi No. 12 ng 30',
    batchRemaining: 4,
    leadTime: 'Handcrafted in 18 days per piece',
    region: 'Laguna & Bohol, Luzon/Visayas',
    artisanCooperative: 'Laguna Leaf Weavers Master Guild',
    artisanMaster: 'Nanay Elena & 14 Master Leaf Strippers',
    fairTradePercentage: 42,
    has3DModel: true,
    modelType: 'bayong',
    description: 'An elevated masterpiece uniting the ancient Philippine tradition of wild pandan and buri palm weaving with the exacting standards of European haute maroquinerie. Featuring a tight diagonal herringbone weave, full-grain vegetable-tanned Vachetta leather handles, and hand-chiseled antique Philippine brass hardware.',
    specs: [
      { label: 'Weave Type', value: 'Double-warp diagonal herringbone weave' },
      { label: 'Primary Leaf', value: 'Wild coastal Pandan (P. odorifer) & Buri palm' },
      { label: 'Leather Details', value: 'Vegetable-tanned Vachetta leather (Tuscan tannery)' },
      { label: 'Hardware', value: 'Solid hand-cast antique Philippine brass' },
      { label: 'Lining', value: 'Handloom Ilocos Inabel unbleached cotton lining' },
      { label: 'Dimensions', value: '38 cm (W) x 28 cm (H) x 15 cm (D)' },
      { label: 'Weight', value: '720 grams' }
    ],
    materials: [
      { id: 'pandan-natural', name: 'Sun-Dried Pandan', colorName: 'Warm Golden Straw', hex: '#D8B781', leatherHex: '#8C5A3C', brassHex: '#C4975D' },
      { id: 'buri-chestnut', name: 'Smoked Buri Bark', colorName: 'Toasted Chestnut Brown', hex: '#6E473B', leatherHex: '#4A2E1B', brassHex: '#D8B277' },
      { id: 'abaca-indigo', name: 'Midnight Indigo', colorName: 'Deep Botanical Indigo', hex: '#2B384E', leatherHex: '#24140E', brassHex: '#C4975D' }
    ],
    cameraPresets: [
      { id: 'overview', label: 'Overview (3/4)', pos: [0, 1.2, 3.2], target: [0, 0, 0] },
      { id: 'macro', label: 'Weave Macro', pos: [0.3, 0.4, 1.3], target: [0, 0.2, 0] },
      { id: 'profile', label: 'Handle & Hardware', pos: [1.8, 1.4, 0.8], target: [0, 0.6, 0] },
      { id: 'top', label: 'Top Interior', pos: [0, 3.2, 0.2], target: [0, 0, 0] }
    ]
  },

  {
    id: 'perlas-silangan',
    name: 'Perlas ng Silangan',
    subtitle: 'Palawan Golden South Sea Pearl & Tamborin',
    collection: 'Perlas & Alahas',
    tagline: '14.5mm Golden Pearl • 18K Meycauayan Filigree Gold',
    pricePHP: 185000,
    edition: 'Piece Unique No. 03 ng 10',
    batchRemaining: 2,
    leadTime: 'Hand-granulated over 24 days',
    region: 'Palawan & Meycauayan, Bulacan',
    artisanCooperative: 'Meycauayan Heirloom Goldsmiths Guild',
    artisanMaster: 'Mang Celso (3rd Gen Filigree Master)',
    fairTradePercentage: 46,
    has3DModel: true,
    modelType: 'pearl',
    description: 'A crown jewel of the Philippine archipelago. A rare 14.5mm deep-golden South Sea pearl harvested sustainably from the coral sanctuaries of Palawan, cradled inside an intricate 18K yellow gold filigree Tamborin basket with micro-granulated wire beads.',
    specs: [
      { label: 'Pearl Origin', value: 'Palawan Coral Archipelago, Philippines' },
      { label: 'Pearl Grade', value: '14.5mm AAA Natural Deep Golden Luster' },
      { label: 'Filigree Metal', value: '18K Solid Philippine Yellow Gold' },
      { label: 'Technique', value: 'Century-old Tamborin filigree wire granulation' },
      { label: 'Chain', value: 'Hand-twisted 18K gold cable chain (45 cm)' }
    ],
    materials: [
      { id: 'gold-18k', name: '18K Yellow Gold', colorName: 'Heirloom Philippine Gold', hex: '#D4AF37', pearlTint: '#FDF7E7' },
      { id: 'rose-18k', name: 'Champagne Rose', colorName: '18K Warm Rose Gold', hex: '#E0A899', pearlTint: '#FFF5F0' },
      { id: 'platinum-950', name: 'Platinum 950', colorName: 'Brushed Pure Platinum', hex: '#E5E7EB', pearlTint: '#F8FAFC' }
    ],
    cameraPresets: [
      { id: 'overview', label: 'Overview (3/4)', pos: [0, 0.8, 2.5], target: [0, 0, 0] },
      { id: 'macro', label: 'Nacre Orient', pos: [0.1, 0.2, 1.1], target: [0, 0, 0] },
      { id: 'profile', label: 'Filigree Profile', pos: [1.6, 0.4, 0.6], target: [0, 0.1, 0] },
      { id: 'top', label: 'Bail & Setting', pos: [0, 2.4, 0.3], target: [0, 0.3, 0] }
    ]
  },
  {
    id: 'solihiya-valet',
    name: 'Solihiya Kamagong Valet Box',
    subtitle: 'Hand-Carved Philippine Ebony & Rattan Canework',
    collection: 'Tahanan & Luho',
    tagline: 'Pampanga Sunburst Solihiya • Paete Kamagong Wood',
    pricePHP: 38000,
    edition: 'Edisyon Limitado — No. 09 ng 40',
    batchRemaining: 4,
    leadTime: 'Crafted in 14 days',
    region: 'Pampanga & Paete, Laguna',
    artisanCooperative: 'Paete Woodcarvers Guild',
    artisanMaster: 'Mang Danilo & Pampanga Caners',
    fairTradePercentage: 42,
    has3DModel: true,
    modelType: 'solihiya',
    description: 'A stately collector’s desk valet and timepiece box carved from native Philippine Ironwood (Kamagong / Philippine Ebony), capped with an intricate hand-woven natural rattan Solihiya sunburst lid insert and lined with emerald velvet.',
    specs: [
      { label: 'Wood', value: 'Native Philippine Kamagong (Philippine Ebony)' },
      { label: 'Canework', value: 'Natural peeled rattan sunburst Solihiya weave' },
      { label: 'Interior', value: 'Deep emerald velvet watch pillows and jewelry tray' },
      { label: 'Hardware', value: 'Solid brass quadrant hinges and lock' },
      { label: 'Dimensions', value: '30 cm x 20 cm x 10 cm' }
    ],
    materials: [
      { id: 'kamagong-dark', name: 'Deep Kamagong', colorName: 'Satin Dark Ebony', hex: '#24140E', woodHex: '#24140E', caneHex: '#D8B781', brassHex: '#C4975D' },
      { id: 'kamagong-warm', name: 'Warm Narra Blend', colorName: 'Warm Cacao Wood', hex: '#5C3A21', woodHex: '#4A2E1B', caneHex: '#EAD7B2', brassHex: '#D8B277' }
    ],
    cameraPresets: [
      { id: 'overview', label: 'Overview (3/4)', pos: [0, 1.2, 2.8], target: [0, 0.3, 0] },
      { id: 'macro', label: 'Solihiya Weave', pos: [0, 1.1, 1.3], target: [0, 0.4, 0] },
      { id: 'profile', label: 'Brass Lock', pos: [0, 0.4, 1.5], target: [0, 0.3, 0] },
      { id: 'top', label: 'Top Sunburst', pos: [0, 2.8, 0.1], target: [0, 0.3, 0] }
    ]
  },
  {
    id: 'capiz-luminary',
    name: 'Ilaw ng Silangan Luminary',
    subtitle: 'Architectural Capiz Shell & Brass Lantern',
    collection: 'Tahanan & Luho',
    tagline: 'Panay Iridescent Capiz Shell • Hand-Soldered Brass',
    pricePHP: 42000,
    edition: 'Edisyon Limitado — No. 18 ng 50',
    batchRemaining: 5,
    leadTime: 'Crafted in 12 days',
    region: 'Roxas City, Capiz & Cebu',
    artisanCooperative: 'Panay Shellcraft Artisans Association',
    artisanMaster: 'Mang Nestor & Cebu Metal Smiths',
    fairTradePercentage: 40,
    has3DModel: true,
    modelType: 'luminary',
    description: 'An architectural table luminary hand-crafted from harvested Placuna placenta (Capiz) shells. Each shell is hand-cut, bound in delicate brass ribbon, and soldered into clean geometric facets. Features an interactive warm internal glow.',
    specs: [
      { label: 'Shell Material', value: 'Natural Panay Capiz Shell (Placuna placenta)' },
      { label: 'Metalwork', value: 'Hand-soldered antique architectural brass' },
      { label: 'Lighting Core', value: 'Warm 2400K dimmable ambient LED core' }
    ],
    materials: [
      { id: 'capiz-pearl', name: 'Natural Pearl Capiz', colorName: 'Translucent Opaline Shell', hex: '#FFFDF8', brassHex: '#C4975D' },
      { id: 'capiz-amber', name: 'Smoked Honey Capiz', colorName: 'Golden Honey Toned Shell', hex: '#EAD7B2', brassHex: '#8C5A3C' }
    ],
    cameraPresets: [
      { id: 'overview', label: 'Overview (3/4)', pos: [0, 1.4, 3.2], target: [0, 0.4, 0] },
      { id: 'macro', label: 'Shell Texture', pos: [0.4, 0.7, 1.4], target: [0, 0.5, 0] },
      { id: 'profile', label: 'Side Geometric', pos: [2.0, 0.8, 0], target: [0, 0.5, 0] },
      { id: 'top', label: 'Top Facets', pos: [0, 3.4, 0.2], target: [0, 0.4, 0] }
    ]
  },
  {
    id: 'mandirigma-watch',
    name: 'Mandirigma Damascus & Kamagong Watch',
    subtitle: 'Pattern-Welded Steel Dial with Abaca Strap',
    collection: 'Perlas & Alahas',
    tagline: 'Kalis Sword Damascus Dial • Native Philippine Ebony',
    pricePHP: 145000,
    edition: 'Piece Unique No. 02 ng 12',
    batchRemaining: 2,
    leadTime: 'Hand-forged over 40 days',
    region: 'Pampanga & Paete, Laguna',
    artisanCooperative: 'Apulit Bladesmiths & Horology Guild',
    artisanMaster: 'Panday Jose & Master Watchmakers',
    fairTradePercentage: 44,
    has3DModel: true,
    modelType: 'watch',
    description: 'A mechanical luxury timepiece featuring a dial hand-forged from folded Philippine pattern-welded Damascus steel inspired by ancient Kalis swords, encased in native Kamagong ebony wood with an abaca strap.',
    materials: [
      { id: 'kamagong-steel', name: 'Ebony & Damascus Steel', hex: '#24140E', steelHex: '#4A5568' }
    ],
    cameraPresets: [
      { id: 'overview', label: 'Overview (3/4)', pos: [0, 1.1, 2.4], target: [0, 0.65, 0] },
      { id: 'dial', label: 'Damascus Dial', pos: [0, 0.7, 1.1], target: [0, 0.65, 0] },
      { id: 'profile', label: 'Crown & Bezel', pos: [1.5, 0.7, 0.6], target: [0, 0.65, 0] }
    ]
  },
  {
    id: 'butuan-ring',
    name: 'Ginto ng Butuan 24K Granulated Ring',
    subtitle: '10th-Century Pre-Colonial Filigree Signet',
    collection: 'Perlas & Alahas',
    tagline: 'Solid 24K Philippine Gold • Sacred Granulation',
    pricePHP: 115000,
    edition: 'Edisyon Limitado — No. 04 ng 15',
    batchRemaining: 2,
    leadTime: 'Hand-soldered in 18 days',
    region: 'Butuan & Meycauayan, Bulacan',
    artisanCooperative: 'Meycauayan Heirloom Goldsmiths',
    artisanMaster: 'Mang Celso',
    fairTradePercentage: 46,
    has3DModel: true,
    modelType: 'ring',
    description: 'Recreating the legendary pre-colonial 10th-century gold granulation discovered in Butuan, cast in heavy solid gold with micro-wire filigree granulation.',
    materials: [
      { id: 'butuan-24k', name: '24K Golden Sun', hex: '#E5C158' }
    ],
    cameraPresets: [
      { id: 'overview', label: 'Overview (3/4)', pos: [0, 1.1, 2.2], target: [0, 0.8, 0] },
      { id: 'table', label: 'Granulated Solar Boss', pos: [0, 1.6, 0.8], target: [0, 1.25, 0] }
    ]
  },
  {
    id: 'salakot-datu',
    name: 'Salakot ng Datu Architectural Headpiece',
    subtitle: 'Shaved Bamboo Ribs & Antique Silver Finial',
    collection: 'Habi & Dahon',
    tagline: 'Hand-Shaved Bamboo • Mother-of-Pearl Beads',
    pricePHP: 34000,
    edition: 'Edisyon Limitado — No. 11 ng 30',
    batchRemaining: 5,
    leadTime: 'Handcrafted in 10 days',
    region: 'Bulacan & Pampanga',
    artisanCooperative: 'Bulacan Traditional Hatters Guild',
    artisanMaster: 'Mang Tacio',
    fairTradePercentage: 42,
    has3DModel: true,
    modelType: 'salakot',
    description: 'An avant-garde high-fashion sun hat crafted from paper-thin shaved native bamboo ribs, edged with antique silver filigree finials and mother-of-pearl beads.',
    materials: [
      { id: 'bamboo-natural', name: 'Sun-Bleached Shaved Bamboo', hex: '#D8B781', silverHex: '#E2E8F0' }
    ],
    cameraPresets: [
      { id: 'overview', label: 'Overview (3/4)', pos: [0, 1.2, 2.8], target: [0, 0.6, 0] },
      { id: 'spire', label: 'Silver Spire Finial', pos: [0, 1.6, 1.2], target: [0, 1.0, 0] }
    ]
  },
  {
    id: 'batek-robe',
    name: '"Batek" Kalinga Sacred Silk Robe',
    subtitle: 'Warrior Tattoo Ikat Motif Loungewear',
    collection: 'Kasuotan & Sutla',
    tagline: 'Kalinga Sacred Backstrap Loom • Botanical Indigo',
    pricePHP: 46000,
    edition: 'Edisyon Limitado — No. 08 ng 25',
    batchRemaining: 4,
    leadTime: 'Hand-loomed in 18 days',
    region: 'Buscalan, Kalinga, Cordillera',
    artisanCooperative: 'Kalinga Indigenous Weavers Association',
    artisanMaster: 'Ina Rebecca (Tattoo Lineage)',
    fairTradePercentage: 50,
    has3DModel: true,
    modelType: 'robe',
    description: 'A floor-length luxury lounge robe inspired by indigenous warrior tattoo motifs, hand-loomed with natural indigo and charcoal plant dyes.',
    materials: [
      { id: 'kalinga-indigo', name: 'Botanical Indigo & Charcoal', hex: '#1D2A3A' }
    ],
    cameraPresets: [
      { id: 'overview', label: 'Overview (3/4)', pos: [0, 1.2, 2.8], target: [0, 0.7, 0] }
    ]
  },
  {
    id: 'burnay-decanter',
    name: 'Vigan Dragon-Kiln Burnay Decanter',
    subtitle: 'Wood-Fired Stoneware Vessel with Brass Spout',
    collection: 'Tahanan & Luho',
    tagline: '200-Year-Old Burnayan Kiln • Hand-Forged Brass',
    pricePHP: 32000,
    edition: 'Edisyon Limitado — No. 15 ng 40',
    batchRemaining: 6,
    leadTime: 'Fired over 14 days in wood kiln',
    region: 'Vigan, Ilocos Sur',
    artisanCooperative: 'Vigan Burnayan Pottery Master Guild',
    artisanMaster: 'Mang Fidel (National Folk Artist)',
    fairTradePercentage: 45,
    has3DModel: true,
    modelType: 'burnay',
    description: 'A heavy unglazed stoneware decanter for vintage Philippine reserve spirits, wood-fired in ancient dragon kilns and wrapped with woven abaca neck rope and a brass stopper.',
    materials: [
      { id: 'vigan-clay', name: 'Dragon-Kiln Unglazed Clay', hex: '#4A3528', brassHex: '#C4975D' }
    ],
    cameraPresets: [
      { id: 'overview', label: 'Overview (3/4)', pos: [0, 1.3, 3.0], target: [0, 0.8, 0] },
      { id: 'spout', label: 'Forged Brass Spout', pos: [0, 1.8, 1.2], target: [0, 1.5, 0] }
    ]
  },
  {
    id: 'barong-dalisay',
    name: 'Barong Tagalog "Dalisay"',
    subtitle: 'Classic Pure Hand-Scraped Piña-Seda',
    collection: 'Kasuotan & Sutla',
    tagline: 'Kalibo Handloom Piña • Lumban Calado Needlework',
    pricePHP: 76000,
    edition: 'Tailored Bespoke Allocation',
    batchRemaining: 3,
    leadTime: 'Hand-embroidered over 45 days',
    region: 'Kalibo, Aklan & Lumban, Laguna',
    artisanCooperative: 'Lumban Master Embroiderers Guild',
    artisanMaster: 'Aling Remedios',
    fairTradePercentage: 48,
    has3DModel: true,
    modelType: 'dalisay',
    description: 'Classic bespoke formal Barong Tagalog tailored from pure hand-scraped Piña-Seda with Lumban Calado open-work needlework and Mother-of-Pearl buttons.',
    materials: [
      { id: 'pina-pure', name: 'Pure Handloom Piña Ivory', hex: '#FAF8F2', embroideryHex: '#D4AF37', trimHex: '#3D2415' }
    ],
    cameraPresets: [
      { id: 'overview', label: 'Overview (3/4)', pos: [0, 1.2, 3.0], target: [0, 0.7, 0] }
    ]
  },
  {
    id: 'barong-ilustrado',
    name: 'Barong Tagalog "Ilustrado" (Barong para sa Kalalakihan)',
    subtitle: 'Haute Formal Piña-Seda with Lumban Calado Pechera',
    collection: 'Kasuotan & Sutla',
    tagline: 'Kalibo Handloom Piña-Seda • Lumban Calado Pechera • Palawan Madreperla Buttons',
    pricePHP: 68500,
    edition: 'Edisyon Limitado — No. 06 ng 20',
    batchRemaining: 3,
    leadTime: 'Hand-loomed and embroidered over 42 days',
    region: 'Lumban, Laguna & Kalibo, Aklan',
    artisanCooperative: 'Lumban Master Calado Guild & Aklan Piña Weavers',
    artisanMaster: 'Mang Nestor & Aling Remedios (4th Gen Master Calado Artisans)',
    fairTradePercentage: 48,
    has3DModel: true,
    modelType: 'barong-men',
    description: 'An authentic Philippine formal masterpiece tailored for gentlemen. Woven from gossamer-sheer handloom Piña-Seda (red Spanish pineapple fiber and mulberry silk), featuring the iconic U-shaped Lumban Calado chest Pechera embroidery shield, architectural Mandarin standing collar, iridescent Palawan Mother-of-Pearl (Madreperla) buttons, and dual side vents (bolas) for an impeccable tailored drape over formal trousers.',
    specs: [
      { label: 'Silweta / Silhouette', value: 'Masculine tailored straight cut with dual reinforced side vents (bolas)' },
      { label: 'Tela / Fabric', value: '70% Hand-scraped Red Spanish Piña fiber, 30% Fine Mulberry Silk' },
      { label: 'Burdang Pechera', value: 'Hand-drawn Lumban Calado open-work lattice with Sampaguita floral medallions' },
      { label: 'Mga Butones / Buttons', value: 'Authentic Palawan Mother-of-Pearl (Madreperla) iridescent buttons with cross-stitching' },
      { label: 'Kwelyo / Collar', value: 'Architectural Mandarin standing collar with gold-ecru Calado border piping' },
      { label: 'Panloob / Layering', value: 'Includes tailored Supima cotton Camisa de Chino undershirt' },
      { label: 'Manga / Sleeves', value: 'Full-length ergonomic tailored sleeves with Calado French cuffs and cufflink buttons' },
    ],
    materials: [
      {
        id: 'pina-natural',
        name: 'Natural Piña Ivory',
        colorName: 'Sun-Bleached Warm Ivory Piña',
        hex: '#FAF6EB',
        fabricHex: '#FAF6EB',
        embroideryHex: '#E6CE98',
        buttonHex: '#FFFDF5',
      },
      {
        id: 'pina-seda-noir',
        name: 'Piña-Seda Onyx',
        colorName: 'Midnight Botanical Onyx',
        hex: '#222126',
        fabricHex: '#222126',
        embroideryHex: '#C4C8D0',
        buttonHex: '#4A4850',
      },
      {
        id: 'pina-sage-celadon',
        name: 'Heritage Celadon',
        colorName: 'Muted Ilocano Sage Green',
        hex: '#D7DFD5',
        fabricHex: '#D7DFD5',
        embroideryHex: '#F0ECE1',
        buttonHex: '#FAF6EB',
      },
    ],
    cameraPresets: [
      { id: 'overview', label: 'Overview (3/4)', pos: [0, 1.25, 3.1], target: [0, 0.70, 0] },
      { id: 'pechera', label: 'Calado Pechera', pos: [0, 1.15, 1.35], target: [0, 0.98, 0] },
      { id: 'collar', label: 'Mandarin Collar', pos: [0, 1.48, 1.10], target: [0, 1.34, 0] },
      { id: 'cuff', label: 'French Cuff & MOP', pos: [0.75, 0.65, 1.25], target: [0.55, 0.50, 0] },
      { id: 'vent', label: 'Side Vent & Hem', pos: [0.70, 0.35, 1.40], target: [0.35, 0.20, 0] },
    ],
  },
  {
    id: 'creolla-earrings',
    name: 'Filipino Creolla "Palamuti" Earrings',
    subtitle: '18K Gold Filigree Hoop with Seed Pearls',
    collection: 'Perlas & Alahas',
    tagline: '19th-Century Vigan Silhouette • Meycauayan Wirework',
    pricePHP: 54000,
    edition: 'Edisyon Limitado — No. 08 ng 25',
    batchRemaining: 3,
    leadTime: 'Crafted in 12 days',
    region: 'Vigan, Ilocos Sur & Bulacan',
    artisanCooperative: 'Meycauayan Goldsmiths Guild',
    artisanMaster: 'Mang Rodolfo',
    fairTradePercentage: 44,
    has3DModel: true,
    modelType: 'creolla',
    description: 'Traditional 19th-century hoop silhouette fashioned from hand-twisted 18K gold filigree wirework with natural Palawan seed pearls.',
    materials: [
      { id: 'creolla-gold', name: '18K Filigree Gold', hex: '#D4AF37' }
    ],
    cameraPresets: [
      { id: 'overview', label: 'Overview (3/4)', pos: [0, 1.0, 2.4], target: [0, 0.6, 0] },
      { id: 'pearl-drop', label: 'Palawan Pearl Drop', pos: [0.55, 0.4, 1.2], target: [0.55, 0.2, 0] }
    ]
  },
  {
    id: 'chrono-vault',
    name: 'Kamagong & Carabao Horn Chrono Vault',
    subtitle: 'Hand-Carved Philippine Ebony Watch Trunk',
    collection: 'Tahanan & Luho',
    tagline: 'Paete Ebony Wood • Polished Carabao Horn',
    pricePHP: 52000,
    edition: 'Edisyon Limitado — No. 05 ng 20',
    batchRemaining: 3,
    leadTime: 'Hand-carved in 16 days',
    region: 'Paete, Laguna & Pampanga',
    artisanCooperative: 'Paete Master Woodcarvers Guild',
    artisanMaster: 'Mang Danilo',
    fairTradePercentage: 42,
    has3DModel: true,
    modelType: 'vault',
    description: 'A stately collector’s 4-piece watch trunk hand-carved from native Kamagong ebony wood with polished black carabao horn inlay corner brackets.',
    materials: [
      { id: 'kamagong-horn', name: 'Paete Ebony & Carabao Horn', hex: '#24140E', hornHex: '#120D0A' }
    ],
    cameraPresets: [
      { id: 'overview', label: 'Overview (3/4)', pos: [0, 1.3, 3.0], target: [0, 0.4, 0] },
      { id: 'tray', label: 'Velvet Watch Trays', pos: [0, 1.7, 1.4], target: [0, 0.4, 0] }
    ]
  }
];
