const SneaksAPI = require('sneaks-api')
const sneaks = new SneaksAPI()
sneaks.getProducts('Jordan 1', 5, (err, products) => {
  if (err) { console.log('ERR', String(err).slice(0, 200)); process.exit(1) }
  if (!products || !products.length) { console.log('NO PRODUCTS'); process.exit(1) }
  for (const p of products) {
    console.log(JSON.stringify({ name: p.shoeName, brand: p.brand, price: p.retailPrice, thumb: p.thumbnail, style: p.styleID }))
  }
  process.exit(0)
})
setTimeout(() => { console.log('TIMEOUT'); process.exit(2) }, 45000)
