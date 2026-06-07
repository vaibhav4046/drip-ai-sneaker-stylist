// DRIP sneaker database. `hex` = dominant colorway tone (drives the outfit engine).
// `photo` = key into data/photos.js (verified real photography).
// popularity (0-100), releaseDate (YYYY-MM), isNew, styleTags (aesthetic) power the recommender.
export const SHOES = [
  // ---- Nike ----
  { id: 'nike-dunk-panda', brand: 'Nike', model: 'Dunk Low', colorway: 'Panda', hex: '#1c1c1c', accent: '#ffffff', price: 115, rating: 4.8, category: 'lifestyle', gender: 'unisex', photo: 'blackwhite_af1', popularity: 98, releaseDate: '2021-03', styleTags: ['court', 'retro', 'minimal', 'hype'] },
  { id: 'nike-af1-white', brand: 'Nike', model: 'Air Force 1 ’07', colorway: 'Triple White', hex: '#f2f2f0', accent: '#e8e8e8', price: 115, rating: 4.9, category: 'lifestyle', gender: 'unisex', photo: 'white_pastel', popularity: 96, releaseDate: '2014-01', styleTags: ['court', 'minimal', 'classic'] },
  { id: 'nike-af1-tan', brand: 'Nike', model: 'Air Force 1 ’07', colorway: 'Pecan', hex: '#9a6b43', accent: '#d9b382', price: 120, rating: 4.6, category: 'lifestyle', gender: 'unisex', photo: 'tan_af1', popularity: 74, releaseDate: '2025-10', isNew: true, styleTags: ['court', 'luxe', 'classic'] },
  { id: 'nike-airmax-90', brand: 'Nike', model: 'Air Max 90', colorway: 'Infrared', hex: '#d7d7d7', accent: '#ff3b30', price: 140, rating: 4.7, category: 'lifestyle', gender: 'unisex', photo: 'red_runner', popularity: 88, releaseDate: '2020-01', styleTags: ['runner', 'retro', 'classic'] },
  { id: 'nike-airmax-volt', brand: 'Nike', model: 'Air Max 90', colorway: 'Volt', hex: '#cde000', accent: '#1c1c1c', price: 150, rating: 4.5, category: 'lifestyle', gender: 'unisex', photo: 'volt_train', popularity: 71, releaseDate: '2026-04', isNew: true, styleTags: ['runner', 'hype', 'statement'] },
  { id: 'nike-vapormax', brand: 'Nike', model: 'Vapormax Plus', colorway: 'Triple Black', hex: '#121212', accent: '#2a2a2a', price: 210, rating: 4.5, category: 'running', gender: 'unisex', photo: 'black_runner', popularity: 79, releaseDate: '2018-03', styleTags: ['runner', 'techy', 'chunky'] },
  { id: 'nike-pegasus', brand: 'Nike', model: 'Pegasus 41', colorway: 'Wolf Grey', hex: '#8d9196', accent: '#00e0c6', price: 140, rating: 4.6, category: 'running', gender: 'unisex', photo: 'grey_runner', popularity: 72, releaseDate: '2024-05', styleTags: ['runner', 'techy', 'minimal'] },
  { id: 'nike-airmax-97', brand: 'Nike', model: 'Air Max 97', colorway: 'Silver Bullet', hex: '#b9bcc2', accent: '#cf1d2d', price: 185, rating: 4.6, category: 'lifestyle', gender: 'unisex', photo: 'grey_tech', popularity: 80, releaseDate: '2017-04', styleTags: ['runner', 'retro', 'techy', 'luxe'] },
  { id: 'nike-dunk-red', brand: 'Nike', model: 'Dunk Low', colorway: 'University Red', hex: '#a01f2d', accent: '#ffffff', price: 120, rating: 4.7, category: 'lifestyle', gender: 'unisex', photo: 'red_box', popularity: 83, releaseDate: '2025-12', isNew: true, styleTags: ['court', 'retro', 'hype', 'statement'] },

  // ---- Jordan ----
  { id: 'jordan-1-chicago', brand: 'Jordan', model: 'Air Jordan 1 High', colorway: 'Chicago', hex: '#c8102e', accent: '#111111', price: 180, rating: 4.9, category: 'basketball', gender: 'unisex', photo: 'jordan_chicago', popularity: 99, releaseDate: '2022-10', styleTags: ['court', 'retro', 'hype', 'luxe'] },
  { id: 'jordan-1-unc', brand: 'Jordan', model: 'Air Jordan 1 High', colorway: 'UNC', hex: '#7ab2dd', accent: '#ffffff', price: 180, rating: 4.8, category: 'basketball', gender: 'unisex', photo: 'blue_jordan', popularity: 90, releaseDate: '2023-02', styleTags: ['court', 'retro', 'hype'] },
  { id: 'jordan-1-pollen', brand: 'Jordan', model: 'Air Jordan 1 High', colorway: 'Pollen', hex: '#f0c419', accent: '#111111', price: 180, rating: 4.7, category: 'basketball', gender: 'unisex', photo: 'yellow_jordan', popularity: 78, releaseDate: '2025-09', isNew: true, styleTags: ['court', 'retro', 'statement', 'hype'] },
  { id: 'jordan-4-bred', brand: 'Jordan', model: 'Air Jordan 4', colorway: 'Bred', hex: '#1a1a1a', accent: '#cf1d2d', price: 215, rating: 4.8, category: 'basketball', gender: 'unisex', photo: 'bred_jordan', popularity: 92, releaseDate: '2019-05', styleTags: ['court', 'retro', 'chunky', 'hype'] },
  { id: 'jordan-12-red', brand: 'Jordan', model: 'Air Jordan 12', colorway: 'Reverse Flu Game', hex: '#9b1c2e', accent: '#111111', price: 210, rating: 4.6, category: 'basketball', gender: 'unisex', photo: 'red_high', popularity: 76, releaseDate: '2023-10', styleTags: ['court', 'retro', 'luxe'] },

  // ---- Adidas ----
  { id: 'adidas-samba-og', brand: 'Adidas', model: 'Samba OG', colorway: 'Black/White Gum', hex: '#15130f', accent: '#d9b382', price: 100, rating: 4.8, category: 'lifestyle', gender: 'unisex', photo: 'black_low', popularity: 97, releaseDate: '2023-06', styleTags: ['court', 'retro', 'minimal', 'classic'] },
  { id: 'adidas-yeezy-zebra', brand: 'Adidas', model: 'Yeezy Boost 350 V2', colorway: 'Zebra', hex: '#e8e4da', accent: '#1c1c1c', price: 230, rating: 4.7, category: 'lifestyle', gender: 'unisex', photo: 'white_yeezy', popularity: 89, releaseDate: '2022-04', styleTags: ['runner', 'techy', 'hype', 'luxe'] },
  { id: 'adidas-ultraboost', brand: 'Adidas', model: 'Ultraboost Light', colorway: 'Core Black', hex: '#141414', accent: '#5b5b5b', price: 190, rating: 4.5, category: 'running', gender: 'unisex', photo: 'grey_knit', popularity: 75, releaseDate: '2023-01', styleTags: ['runner', 'techy', 'minimal'] },
  { id: 'adidas-gazelle', brand: 'Adidas', model: 'Gazelle', colorway: 'Collegiate Green', hex: '#2f5d45', accent: '#f0ead6', price: 100, rating: 4.6, category: 'lifestyle', gender: 'unisex', photo: 'olive_nike', popularity: 81, releaseDate: '2023-08', styleTags: ['court', 'retro', 'classic'] },
  { id: 'adidas-campus', brand: 'Adidas', model: 'Campus 00s', colorway: 'Grey', hex: '#b9b3a7', accent: '#ffffff', price: 110, rating: 4.6, category: 'lifestyle', gender: 'unisex', photo: 'cream_suede', popularity: 84, releaseDate: '2023-03', styleTags: ['court', 'retro', 'chunky', 'hype'] },

  // ---- New Balance ----
  { id: 'nb-550-white', brand: 'New Balance', model: '550', colorway: 'White Green', hex: '#eceae4', accent: '#3f7d52', price: 120, rating: 4.7, category: 'lifestyle', gender: 'unisex', photo: 'white_nb', popularity: 86, releaseDate: '2021-09', styleTags: ['court', 'retro', 'minimal', 'classic'] },
  { id: 'nb-2002r', brand: 'New Balance', model: '2002R', colorway: 'Protection Pack', hex: '#6f6f72', accent: '#3a3a3c', price: 150, rating: 4.7, category: 'lifestyle', gender: 'unisex', photo: 'grey_react', popularity: 85, releaseDate: '2022-01', styleTags: ['runner', 'techy', 'chunky', 'luxe'] },
  { id: 'nb-9060', brand: 'New Balance', model: '9060', colorway: 'Sea Salt', hex: '#d8d2c6', accent: '#9b9588', price: 150, rating: 4.6, category: 'lifestyle', gender: 'unisex', photo: 'cream_orange', popularity: 82, releaseDate: '2023-04', styleTags: ['runner', 'chunky', 'techy', 'hype'] },
  { id: 'nb-1906r', brand: 'New Balance', model: '1906R', colorway: 'Silver Metallic', hex: '#c2c4c8', accent: '#7b7d82', price: 165, rating: 4.6, category: 'running', gender: 'unisex', photo: 'grey_af1', popularity: 77, releaseDate: '2022-06', styleTags: ['runner', 'techy', 'luxe'] },

  // ---- Converse ----
  { id: 'converse-chuck70', brand: 'Converse', model: 'Chuck 70 Hi', colorway: 'Black', hex: '#16161a', accent: '#f0ece1', price: 85, rating: 4.6, category: 'lifestyle', gender: 'unisex', photo: 'black_low', popularity: 70, releaseDate: '2019-01', styleTags: ['skate', 'retro', 'minimal', 'classic'] },
  { id: 'converse-chuck-cream', brand: 'Converse', model: 'Chuck Taylor Lo', colorway: 'Egret', hex: '#efe9dc', accent: '#d8cdb6', price: 65, rating: 4.5, category: 'lifestyle', gender: 'unisex', photo: 'cream_suede', popularity: 64, releaseDate: '2018-01', styleTags: ['skate', 'minimal', 'classic'] },

  // ---- Puma ----
  { id: 'puma-suede', brand: 'Puma', model: 'Suede Classic', colorway: 'Red', hex: '#8c2b30', accent: '#ffffff', price: 75, rating: 4.4, category: 'lifestyle', gender: 'unisex', photo: 'maroon_vans', popularity: 60, releaseDate: '2017-01', styleTags: ['court', 'retro', 'classic'] },
  { id: 'puma-palermo', brand: 'Puma', model: 'Palermo', colorway: 'Vapor Grey', hex: '#aeb4a9', accent: '#2f4a36', price: 90, rating: 4.5, category: 'lifestyle', gender: 'unisex', photo: 'olive_nb', popularity: 73, releaseDate: '2024-02', isNew: true, styleTags: ['court', 'retro', 'classic'] },

  // ---- Vans ----
  { id: 'vans-oldskool', brand: 'Vans', model: 'Old Skool', colorway: 'Black/White', hex: '#1b1b1b', accent: '#ffffff', price: 70, rating: 4.6, category: 'skate', gender: 'unisex', photo: 'blackwhite_af1b', popularity: 78, releaseDate: '2016-01', styleTags: ['skate', 'retro', 'classic', 'minimal'] },
  { id: 'vans-authentic', brand: 'Vans', model: 'Authentic', colorway: 'Off White', hex: '#e7e3d8', accent: '#cfc8b6', price: 60, rating: 4.4, category: 'skate', gender: 'unisex', photo: 'white_pastel', popularity: 62, releaseDate: '2015-01', styleTags: ['skate', 'minimal', 'classic'] },

  // ---- Asics ----
  { id: 'asics-gel1130', brand: 'Asics', model: 'GEL-1130', colorway: 'White/Clay Grey', hex: '#dcdce0', accent: '#9a8f86', price: 110, rating: 4.6, category: 'lifestyle', gender: 'unisex', photo: 'grey_tech', popularity: 80, releaseDate: '2022-09', styleTags: ['runner', 'techy', 'chunky', 'luxe'] },
  { id: 'asics-kayano14', brand: 'Asics', model: 'GEL-Kayano 14', colorway: 'Cream Black', hex: '#d9d3c7', accent: '#2b2b2b', price: 160, rating: 4.7, category: 'lifestyle', gender: 'unisex', photo: 'cream_orange', popularity: 83, releaseDate: '2023-05', styleTags: ['runner', 'techy', 'chunky', 'hype'] },
  { id: 'asics-novablast', brand: 'Asics', model: 'Novablast 4', colorway: 'Blue', hex: '#2f6fb0', accent: '#8fd3ff', price: 140, rating: 4.6, category: 'running', gender: 'unisex', photo: 'multicolor_runner', popularity: 68, releaseDate: '2024-01', styleTags: ['runner', 'techy', 'statement'] },

  // ---- Reebok ----
  { id: 'reebok-club-c', brand: 'Reebok', model: 'Club C 85', colorway: 'White/Green', hex: '#f1efe7', accent: '#2f5d45', price: 80, rating: 4.4, category: 'lifestyle', gender: 'unisex', photo: 'white_nb', popularity: 61, releaseDate: '2019-01', styleTags: ['court', 'minimal', 'classic'] },
  { id: 'reebok-classic', brand: 'Reebok', model: 'Classic Leather', colorway: 'Chalk', hex: '#e9e4d6', accent: '#c9c0a8', price: 90, rating: 4.3, category: 'lifestyle', gender: 'unisex', photo: 'cream_suede', popularity: 58, releaseDate: '2018-01', styleTags: ['runner', 'retro', 'classic'] },

  // ---- Onitsuka Tiger ----
  { id: 'onitsuka-mexico66', brand: 'Onitsuka Tiger', model: 'Mexico 66', colorway: 'White/Blue', hex: '#ece9e1', accent: '#1f3f7a', price: 110, rating: 4.7, category: 'lifestyle', gender: 'unisex', photo: 'white_pastel', popularity: 79, releaseDate: '2023-07', styleTags: ['retro', 'minimal', 'luxe', 'classic'] },
  { id: 'onitsuka-mexico-black', brand: 'Onitsuka Tiger', model: 'Mexico 66', colorway: 'Black/White', hex: '#1d1d1d', accent: '#e0e0e0', price: 110, rating: 4.6, category: 'lifestyle', gender: 'unisex', photo: 'blackwhite_af1', popularity: 72, releaseDate: '2023-07', styleTags: ['retro', 'minimal', 'classic'] },

  // ---- Hoka ----
  { id: 'hoka-cliftons', brand: 'Hoka', model: 'Clifton 9', colorway: 'Black/White', hex: '#1a1a1a', accent: '#f0f0f0', price: 145, rating: 4.6, category: 'running', gender: 'unisex', photo: 'black_runner', popularity: 74, releaseDate: '2023-02', styleTags: ['runner', 'techy', 'chunky'] },
  { id: 'hoka-bondi', brand: 'Hoka', model: 'Bondi 8', colorway: 'Shifting Sand', hex: '#cbbfa9', accent: '#8a7c63', price: 165, rating: 4.5, category: 'running', gender: 'unisex', photo: 'cream_orange', popularity: 67, releaseDate: '2023-02', styleTags: ['runner', 'techy', 'chunky'] },

  // ---- Salomon ----
  { id: 'salomon-xt6', brand: 'Salomon', model: 'XT-6', colorway: 'Black/Phantom', hex: '#171717', accent: '#4a4a4a', price: 200, rating: 4.6, category: 'trail', gender: 'unisex', photo: 'grey_knit', popularity: 78, releaseDate: '2022-03', styleTags: ['trail', 'techy', 'hype', 'luxe'] },
  { id: 'salomon-acs', brand: 'Salomon', model: 'ACS Pro', colorway: 'Vanilla Ice', hex: '#d7cdbb', accent: '#7d7363', price: 220, rating: 4.5, category: 'trail', gender: 'unisex', photo: 'cream_suede', popularity: 66, releaseDate: '2023-09', styleTags: ['trail', 'techy', 'luxe'] },

  // ---- Saucony ----
  { id: 'saucony-shadow', brand: 'Saucony', model: 'Shadow 6000', colorway: 'Grey/Cream', hex: '#bdbab2', accent: '#6f6a5e', price: 120, rating: 4.5, category: 'lifestyle', gender: 'unisex', photo: 'pink_saucony', popularity: 63, releaseDate: '2021-01', styleTags: ['runner', 'retro', 'classic'] },
  { id: 'saucony-jazz', brand: 'Saucony', model: 'Jazz Original', colorway: 'Navy', hex: '#23314f', accent: '#c9a24a', price: 90, rating: 4.4, category: 'lifestyle', gender: 'unisex', photo: 'grey_runner', popularity: 55, releaseDate: '2018-01', styleTags: ['runner', 'retro', 'classic'] },
]

// Keep `isNew` honest — derived from releaseDate so "New this week" never goes stale.
const NEW_WINDOW_MS = 150 * 24 * 60 * 60 * 1000
for (const s of SHOES) {
  const t = s.releaseDate ? Date.parse(`${s.releaseDate}-01`) : NaN
  s.isNew = Number.isFinite(t) && Date.now() - t < NEW_WINDOW_MS
}

// Accurate upper materials — drives honest weather/care advice (suede in rain = no).
const MATERIALS = {
  'nike-dunk-panda': 'leather', 'nike-af1-white': 'leather', 'nike-af1-tan': 'leather', 'nike-airmax-90': 'leather and mesh', 'nike-airmax-volt': 'mesh', 'nike-vapormax': 'flyknit', 'nike-pegasus': 'mesh', 'nike-airmax-97': 'mesh', 'nike-dunk-red': 'leather',
  'jordan-1-chicago': 'leather', 'jordan-1-unc': 'leather', 'jordan-1-pollen': 'leather', 'jordan-4-bred': 'leather and mesh', 'jordan-12-red': 'leather',
  'adidas-samba-og': 'leather and suede', 'adidas-yeezy-zebra': 'primeknit', 'adidas-ultraboost': 'primeknit', 'adidas-gazelle': 'suede', 'adidas-campus': 'suede',
  'nb-550-white': 'leather', 'nb-2002r': 'suede and mesh', 'nb-9060': 'suede and mesh', 'nb-1906r': 'mesh and synthetic',
  'converse-chuck70': 'canvas', 'converse-chuck-cream': 'canvas',
  'puma-suede': 'suede', 'puma-palermo': 'suede',
  'vans-oldskool': 'canvas and suede', 'vans-authentic': 'canvas',
  'asics-gel1130': 'mesh and synthetic', 'asics-kayano14': 'mesh', 'asics-novablast': 'mesh',
  'reebok-club-c': 'leather', 'reebok-classic': 'leather',
  'onitsuka-mexico66': 'suede and nylon', 'onitsuka-mexico-black': 'leather',
  'hoka-cliftons': 'mesh', 'hoka-bondi': 'mesh',
  'salomon-xt6': 'mesh and synthetic', 'salomon-acs': 'mesh and synthetic',
  'saucony-shadow': 'suede and mesh', 'saucony-jazz': 'suede and nylon',
}
for (const s of SHOES) s.material = MATERIALS[s.id] || 'synthetic'

export const BRANDS = [...new Set(SHOES.map((s) => s.brand))]
export const CATEGORIES = [...new Set(SHOES.map((s) => s.category))]
export const STYLE_TAGS = [...new Set(SHOES.flatMap((s) => s.styleTags))]
export const getShoe = (id) => SHOES.find((s) => s.id === id)
