// Outfit pieces used by the engine.
// formality: 1 very casual ... 5 formal | warmth: 0 none ... 3 heavy
// gender: male | female | unisex | modest (modest pieces favour full coverage)
export const TOPS = [
  { id: 't-white-tee', name: 'White Crew Tee', hex: '#f4f4f2', price: 25, gender: 'unisex', modest: false, formality: 1, warmth: 0, tags: ['staple', 'minimal'] },
  { id: 't-black-tee', name: 'Black Boxy Tee', hex: '#161616', price: 28, gender: 'unisex', modest: false, formality: 1, warmth: 0, tags: ['street', 'staple'] },
  { id: 't-grey-hoodie', name: 'Heather Grey Hoodie', hex: '#9a9aa0', price: 70, gender: 'unisex', modest: false, formality: 1, warmth: 2, tags: ['street', 'cozy'] },
  { id: 't-cream-knit', name: 'Cream Knit Sweater', hex: '#e8e0cf', price: 85, gender: 'unisex', modest: false, formality: 3, warmth: 2, tags: ['smart', 'cozy'] },
  { id: 't-oxford-blue', name: 'Light Blue Oxford Shirt', hex: '#bcd4e6', price: 65, gender: 'unisex', modest: false, formality: 4, warmth: 1, tags: ['smart', 'classic'] },
  { id: 't-black-button', name: 'Black Camp Collar Shirt', hex: '#1d1d1d', price: 70, gender: 'unisex', modest: false, formality: 3, warmth: 1, tags: ['date', 'smart'] },
  { id: 't-stripe-polo', name: 'Navy Knit Polo', hex: '#27344f', price: 60, gender: 'unisex', modest: false, formality: 3, warmth: 1, tags: ['smart', 'classic'] },
  { id: 't-graphic', name: 'Vintage Graphic Tee', hex: '#3a3a3a', price: 35, gender: 'unisex', modest: false, formality: 1, warmth: 0, tags: ['street', 'statement'] },
  { id: 't-olive-overshirt', name: 'Olive Overshirt', hex: '#5c5b3e', price: 90, gender: 'unisex', modest: false, formality: 2, warmth: 2, tags: ['utility', 'layer'] },
  { id: 't-rugby', name: 'Striped Rugby Shirt', hex: '#7a2d35', price: 75, gender: 'unisex', modest: false, formality: 2, warmth: 1, tags: ['preppy', 'statement'] },
  { id: 't-tank-w', name: 'Ribbed Tank', hex: '#efe7da', price: 22, gender: 'female', modest: false, formality: 1, warmth: 0, tags: ['minimal', 'summer'] },
  { id: 't-satin-cami', name: 'Satin Cami', hex: '#caa6b4', price: 45, gender: 'female', modest: false, formality: 3, warmth: 0, tags: ['date', 'evening'] },
  { id: 't-crop-hoodie', name: 'Cropped Hoodie', hex: '#b6b0c4', price: 55, gender: 'female', modest: false, formality: 1, warmth: 2, tags: ['street', 'cozy'] },
  { id: 't-blazer-tee', name: 'Fitted Mock Neck', hex: '#101014', price: 40, gender: 'female', modest: false, formality: 3, warmth: 1, tags: ['smart', 'evening'] },
  { id: 't-kurta', name: 'Linen Kurta', hex: '#eae3d2', price: 60, gender: 'modest', modest: true, formality: 4, warmth: 1, tags: ['cultural', 'festival', 'prayer'] },
  { id: 't-thobe', name: 'White Thobe', hex: '#f4f1e9', price: 70, gender: 'modest', modest: true, formality: 4, warmth: 1, tags: ['cultural', 'prayer', 'eid'] },
  { id: 't-mandarin', name: 'Mandarin Collar Shirt', hex: '#2a2f3a', price: 65, gender: 'modest', modest: true, formality: 4, warmth: 1, tags: ['cultural', 'smart'] },
  { id: 't-longline', name: 'Longline Cardigan', hex: '#7c7164', price: 80, gender: 'modest', modest: true, formality: 3, warmth: 2, tags: ['modest', 'layer', 'cozy'] },
  { id: 't-tunic', name: 'Flowy Tunic Top', hex: '#cdbfae', price: 55, gender: 'modest', modest: true, formality: 3, warmth: 1, tags: ['modest', 'festival'] },
  { id: 't-puffer-gilet', name: 'Quilted Gilet', hex: '#27303a', price: 95, gender: 'unisex', modest: false, formality: 2, warmth: 2, tags: ['outdoor', 'layer'] },
  { id: 't-dress-white', name: 'Crisp White Dress Shirt', hex: '#f4f4f2', price: 70, gender: 'unisex', modest: false, formality: 5, warmth: 1, tags: ['formal', 'wedding', 'smart', 'classic'] },
  { id: 't-turtleneck', name: 'Black Fine-Knit Turtleneck', hex: '#141417', price: 65, gender: 'unisex', modest: false, formality: 4, warmth: 2, tags: ['smart', 'evening', 'date'] },
  { id: 't-silk-blouse', name: 'Silk Blouse', hex: '#e7d8d2', price: 75, gender: 'female', modest: false, formality: 4, warmth: 1, tags: ['smart', 'evening', 'date'] },
  { id: 't-henley', name: 'Waffle Henley', hex: '#6b6257', price: 45, gender: 'male', modest: false, formality: 2, warmth: 1, tags: ['casual', 'classic'] },
  { id: 't-flannel', name: 'Brushed Flannel Shirt', hex: '#5c3a3a', price: 70, gender: 'male', modest: false, formality: 2, warmth: 2, tags: ['casual', 'cozy'] },
]

export const BOTTOMS = [
  { id: 'b-raw-denim', name: 'Raw Indigo Jeans', hex: '#2a3a55', price: 90, gender: 'unisex', modest: false, formality: 2, warmth: 1, tags: ['staple', 'classic'] },
  { id: 'b-black-jeans', name: 'Black Slim Jeans', hex: '#161616', price: 80, gender: 'unisex', modest: false, formality: 2, warmth: 1, tags: ['street', 'staple'] },
  { id: 'b-cargo', name: 'Washed Cargo Pants', hex: '#6b6457', price: 85, gender: 'unisex', modest: false, formality: 1, warmth: 1, tags: ['street', 'utility'] },
  { id: 'b-chino-stone', name: 'Stone Chinos', hex: '#cbbfa6', price: 70, gender: 'unisex', modest: false, formality: 3, warmth: 1, tags: ['smart', 'classic'] },
  { id: 'b-wool-trouser', name: 'Charcoal Wool Trousers', hex: '#3a3a40', price: 110, gender: 'unisex', modest: false, formality: 5, warmth: 1, tags: ['formal', 'wedding'] },
  { id: 'b-grey-sweat', name: 'Grey Sweatpants', hex: '#8f9095', price: 60, gender: 'unisex', modest: false, formality: 1, warmth: 2, tags: ['gym', 'cozy'] },
  { id: 'b-nylon-short', name: 'Nylon Training Shorts', hex: '#1c1c1c', price: 40, gender: 'unisex', modest: false, formality: 1, warmth: 0, tags: ['gym', 'summer'] },
  { id: 'b-linen-pant', name: 'Linen Drawstring Pants', hex: '#ece3d0', price: 65, gender: 'unisex', modest: false, formality: 2, warmth: 0, tags: ['summer', 'travel'] },
  { id: 'b-pleated-skirt', name: 'Pleated Midi Skirt', hex: '#3d3a4a', price: 70, gender: 'female', modest: false, formality: 3, warmth: 1, tags: ['date', 'smart'] },
  { id: 'b-wide-jean', name: 'Wide-Leg Jeans', hex: '#5a6b85', price: 85, gender: 'female', modest: false, formality: 2, warmth: 1, tags: ['street', 'statement'] },
  { id: 'b-bike-short', name: 'Bike Shorts', hex: '#161616', price: 35, gender: 'female', modest: false, formality: 1, warmth: 0, tags: ['gym', 'street'] },
  { id: 'b-maxi-skirt', name: 'Maxi Skirt', hex: '#4a4036', price: 75, gender: 'modest', modest: true, formality: 3, warmth: 1, tags: ['modest', 'festival'] },
  { id: 'b-shalwar', name: 'Shalwar Pants', hex: '#e7e0d0', price: 55, gender: 'modest', modest: true, formality: 4, warmth: 1, tags: ['cultural', 'prayer', 'eid'] },
  { id: 'b-dress-trouser', name: 'Pleated Dress Trousers', hex: '#23242a', price: 120, gender: 'unisex', modest: false, formality: 5, warmth: 1, tags: ['formal', 'wedding', 'smart'] },
  { id: 'b-tailored-black', name: 'Tailored Black Trousers', hex: '#141414', price: 110, gender: 'unisex', modest: false, formality: 5, warmth: 1, tags: ['formal', 'smart', 'classic'] },
  { id: 'b-satin-slip', name: 'Satin Slip Skirt', hex: '#3a3340', price: 70, gender: 'female', modest: false, formality: 4, warmth: 0, tags: ['evening', 'date', 'statement'] },
  { id: 'b-corduroy', name: 'Corduroy Trousers', hex: '#7a6a4f', price: 80, gender: 'unisex', modest: false, formality: 3, warmth: 2, tags: ['smart', 'cozy', 'classic'] },
]

export const LAYERS = [
  { id: 'l-denim-jacket', name: 'Washed Denim Jacket', hex: '#5c7392', price: 110, gender: 'unisex', modest: false, formality: 2, warmth: 2, tags: ['classic', 'transition'] },
  { id: 'l-bomber', name: 'Nylon Bomber', hex: '#1b1f26', price: 130, gender: 'unisex', modest: false, formality: 2, warmth: 2, tags: ['street', 'transition'] },
  { id: 'l-puffer', name: 'Black Puffer Jacket', hex: '#121212', price: 180, gender: 'unisex', modest: false, formality: 2, warmth: 3, tags: ['winter', 'outdoor'] },
  { id: 'l-trench', name: 'Stone Trench Coat', hex: '#c2b18f', price: 220, gender: 'unisex', modest: false, formality: 4, warmth: 2, tags: ['smart', 'classic'] },
  { id: 'l-overcoat', name: 'Charcoal Overcoat', hex: '#33353b', price: 240, gender: 'unisex', modest: false, formality: 5, warmth: 3, tags: ['formal', 'winter'] },
  { id: 'l-shacket', name: 'Wool Shacket', hex: '#6a5d4d', price: 120, gender: 'unisex', modest: false, formality: 2, warmth: 2, tags: ['transition', 'cozy'] },
  { id: 'l-kimono', name: 'Kimono Jacket', hex: '#2b2b33', price: 95, gender: 'modest', modest: true, formality: 3, warmth: 1, tags: ['modest', 'cultural', 'layer'] },
  { id: 'l-rain-shell', name: 'Packable Rain Shell', hex: '#2f6f5e', price: 100, gender: 'unisex', modest: false, formality: 1, warmth: 1, tags: ['outdoor', 'rain'] },
  { id: 'l-blazer', name: 'Tailored Blazer', hex: '#26262b', price: 180, gender: 'unisex', modest: false, formality: 5, warmth: 2, tags: ['formal', 'smart', 'wedding', 'classic'] },
  { id: 'l-suit-jacket', name: 'Navy Suit Jacket', hex: '#222a3a', price: 220, gender: 'unisex', modest: false, formality: 5, warmth: 2, tags: ['formal', 'wedding', 'classic'] },
  { id: 'l-leather', name: 'Leather Moto Jacket', hex: '#1a1718', price: 240, gender: 'unisex', modest: false, formality: 3, warmth: 2, tags: ['street', 'statement', 'evening'] },
]

export const ACCESSORIES = [
  { id: 'a-cap', name: 'Logo Cap', hex: '#161616', price: 30, gender: 'unisex', formality: 1, tags: ['street', 'sun'] },
  { id: 'a-beanie', name: 'Ribbed Beanie', hex: '#3a3a40', price: 25, gender: 'unisex', formality: 1, tags: ['winter', 'cozy'] },
  { id: 'a-tote', name: 'Canvas Tote', hex: '#d8cfb8', price: 35, gender: 'unisex', formality: 2, tags: ['travel', 'casual'] },
  { id: 'a-crossbody', name: 'Tech Crossbody Bag', hex: '#1c1c1c', price: 60, gender: 'unisex', formality: 2, tags: ['street', 'travel'] },
  { id: 'a-chain', name: 'Silver Chain', hex: '#c8ccd2', price: 45, gender: 'unisex', formality: 2, tags: ['street', 'statement'] },
  { id: 'a-watch', name: 'Minimal Watch', hex: '#9a9aa0', price: 120, gender: 'unisex', formality: 4, tags: ['smart', 'classic'] },
  { id: 'a-sunnies', name: 'Black Sunglasses', hex: '#0e0e0e', price: 50, gender: 'unisex', formality: 2, tags: ['summer', 'sun'] },
  { id: 'a-scarf', name: 'Lightweight Scarf', hex: '#b3493f', price: 40, gender: 'modest', formality: 2, tags: ['modest', 'winter'] },
]

export const ALL_PIECES = { TOPS, BOTTOMS, LAYERS, ACCESSORIES }
