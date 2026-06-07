// Verified real sneaker photography (Unsplash CDN — all return 200, hotlinkable).
// Tagged by tone/silhouette from visual review so shoes map to a matching photo.
// Swap to exact per-colorway product shots later via a sneaker-data API key.
export const PHOTOS = {
  red_runner: '1542291026-7eec264c27ff',
  grey_runner: '1460353581641-37baddab0fa2',
  volt_train: '1606107557195-0e29a4b5b4aa',
  white_pastel: '1595950653106-6c9ebd614d3a',
  cream_orange: '1600185365926-3a2ce3cdb9eb',
  tan_af1: '1549298916-b41d501d3772',
  olive_nb: '1539185441755-769473a23570',
  cream_suede: '1608231387042-66d1773070a5',
  jordan_chicago: '1597045566677-8cf032ed6634',
  black_low: '1605408499391-6368c628ef42',
  multicolor_runner: '1514989940723-e8e51635b782',
  pink_saucony: '1551107696-a4b0c5a0d9a2',
  brown_casual: '1556906781-9a412961c28c',
  maroon_vans: '1525966222134-fcfa99b8ae77',
  black_runner: '1491553895911-0055eca6402d',
  grey_af1: '1600269452121-4f2416e55c28',
  blackwhite_af1: '1543508282-6319a3e2621f',
  yellow_jordan: '1597248881519-db089d3744a5',
  white_nb: '1465453869711-7e174808ace9',
  grey_knit: '1562183241-b937e95585b6',
  blackwhite_af1b: '1570464197285-9949814674a7',
  grey_tech: '1584735175315-9d5df23860e6',
  grey_react: '1595341888016-a392ef81b7de',
  bred_jordan: '1606890737304-57a1ca8a5b62',
  red_high: '1552346154-21d32810aba3',
  white_yeezy: '1575537302964-96cd47c06b1b',
  blue_jordan: '1551489186-cf8726f514f8',
  beige_boot: '1578116922645-3976907a7671',
  olive_nike: '1582588678413-dbf45f4823e9',
  red_box: '1610398752800-146f269dfcc8',
}

export const photoUrl = (key, w = 600, h = 600) => {
  const id = PHOTOS[key] || PHOTOS.black_low
  return `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&crop=entropy&q=80&auto=format`
}
