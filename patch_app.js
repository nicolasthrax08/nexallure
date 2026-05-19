const fs = require('fs')

let file = fs.readFileSync('src/App.jsx', 'utf8')
file = file.replace(
  "import Footer from './components/Footer'",
  "import Footer from './components/Footer'\nimport MarketGuidePage from './pages/MarketGuidePage'"
)
file = file.replace(
  "buyers: '/buyers',",
  "buyers: '/buyers',\n  marketGuide: '/market-guide',"
)
file = file.replace(
  /<Route path="\/buyers">[\s\S]*?<\/Route>/,
  "<Route path=\"/buyers\">\n          <BuyersPage setPage={setPage} t={t} />\n        </Route>\n        <Route path=\"/market-guide\">\n          <MarketGuidePage t={t} setPage={setPage} />\n        </Route>"
)

fs.writeFileSync('src/App.jsx', file)
