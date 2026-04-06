# 📊 Trading Dashboard Pro

A professional, real-time trading analysis dashboard with SMC/ICT market structure analysis, AI-powered insights, and intelligent position sizing.

## ✨ Features

### 📈 **Real-time Charts**
- Live price feeds from multiple data sources
- Lightweight Charts integration for fast rendering
- Support for XAU/USD, BTC/USD, EUR/USD
- Multiple timeframe analysis (5m, 15m, 1h, 4h, 1d)
- Technical indicators (MA, Bollinger Bands, Volume)

### 🏆 **Entry Ranking System**
- Calculate best entry points with TP/SL combinations
- Win rate and Risk/Reward ratio analysis
- Real-time ranking scoring (0-100%)
- Comprehensive ranking table with performance metrics

### 🔍 **SMC/ICT Analysis**
- Smart Money Concepts market structure detection
- Order Block identification
- Fair Value Gap (FVG) analysis
- Break of Structure (BOS) detection
- Change of Character (CHoCH) identification
- Inner Circle Trader (ICT) concepts:
  - Order Template Entry (OTE)
  - Point of Interest (POI)
  - Premium/Discount zones
  - Liquidity zone identification

### 💰 **Intelligent Position Sizing**
- Lot size calculation based on risk management
- Multiple entry point scaling
- Trailing stop calculations
- ATR-based position sizing
- Compound growth projections

### 🤖 **AI-Powered Analysis (Gemini)**
- Market structure interpretation
- Trading recommendation generation
- Risk management optimization
- Volatility analysis
- Entry point suggestions with confidence levels

### 👤 **User Profile & Settings**
- Persistent user data with localStorage
- Trading statistics tracking
- API key management
- Data export/import (JSON)
- Theme switching (Dark/Light)
- Responsive design for all devices

---

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for API calls
- (Optional) Google Gemini API key for AI features

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/trading-dashboard-pro.git
cd trading-dashboard-pro
```

2. **Open locally:**
```bash
# Using Python 3
python -m http.server 8000

# Or using Node.js
npx http-server -p 8000
```

3. **Access the dashboard:**
```
http://localhost:8000
```

---

## 🔑 Setup API Keys

### Gemini AI Integration

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy your API key
4. Go to **Profile** (Page 5) → **API Configuration**
5. Paste your Gemini API key
6. Click **Test API Connection**

### TradingView API (Optional)

1. Visit [TradingView API](https://www.tradingview.com/rest-api-docs/)
2. Generate your API key
3. Add to Profile settings

---

## 📱 Page Guide

### Page 1: 📈 Real-time Charts
- Live price updates every 2 seconds
- Multi-pair support (XAU/USD, BTC/USD, EUR/USD)
- High/Low tracking
- API connection status indicator

### Page 2: 🏆 Entry Ranking
- Input Entry Price, TP, and SL
- Automatic ranking calculation
- Win rate estimation
- Risk/Reward ratio analysis
- Performance scoring (0-100%)

### Page 3: 🔍 SMC/ICT Analysis
- Select timeframe (5m, 15m, 1h)
- Choose trading pair
- Run market structure analysis
- AI-powered insights with Gemini
- Market structure, entry points, and confluence zones

### Page 4: 💰 Lot Calculator
- Account balance input
- Risk percentage per trade
- Entry/TP/SL calculation
- Lot size recommendation
- Smart TP/SL reasoning
- Reference charts (5m, 15m)

### Page 5: 👤 User Profile
- Account information management
- Trading statistics display
- API configuration
- Data export/import
- Deployment guide

---

## 💻 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub:**
```bash
git add .
git commit -m "Initial commit: Trading Dashboard Pro"
git push origin main
```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click **New Project**
   - Import your GitHub repository
   - Configure project settings (optional)

3. **Set Environment Variables in Vercel:**
   - Go to Project Settings → Environment Variables
   - Add `VITE_GEMINI_API` with your API key
   - Add `VITE_TRADINGVIEW_API` (optional)
   - Redeploy

4. **Deploy:**
```bash
vercel --prod
```

### Deploy to Other Platforms

**GitHub Pages:**
```bash
git push origin main
# Enable GitHub Pages in repository settings
# Point to main branch
```

**Netlify:**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir .
```

**Firebase Hosting:**
```bash
npm install -g firebase-tools
firebase init hosting
firebase deploy
```

---

## 🎨 Customization

### Theme Colors

Edit `css/theme.css`:
```css
:root {
    --primary-color: #0066cc;
    --secondary-color: #00d4ff;
    --success-color: #00cc88;
    --danger-color: #ff3333;
    /* ... more colors */
}
```

### Add New Trading Pair

Edit `js/main.js` in `getBasePrice()`:
```javascript
getBasePrice(pair) {
    const prices = {
        'XAUUSD': 2050,
        'BTCUSD': 42500,
        'EURUSD': 1.085,
        'GBPUSD': 1.27, // Add new pair
    };
    return prices[pair] || 1000;
}
```

### Modify Chart Settings

Edit `js/tradingview.js`:
```javascript
createLightweightChart(container, symbol) {
    const chart = LightweightCharts.createChart(container, {
        width: container.clientWidth,
        height: 300, // Change height
        timeScale: {
            timeVisible: true,
            secondsVisible: true,
        },
        // ... more options
    });
}
```

---

## 📊 API Integration

### Data Sources

- **Price Data**: Yahoo Finance API, TradingView API
- **Market Analysis**: AI-powered (Gemini)
- **Charts**: Lightweight Charts library

### Fallback Mode

If APIs are unavailable, the dashboard uses mock data:
- Realistic price movements
- Historical candle patterns
- Simulated technical indicators

---

## 🛠️ Development

### File Structure
```
trading-dashboard-pro/
├── index.html              # Main HTML
├── css/
│   ├── main.css           # Main stylesheet (2000+ lines)
│   ├── theme.css          # Theme system (1000+ lines)
│   └── responsive.css     # Responsive design (1000+ lines)
├── js/
│   ├── main.js            # Core app logic (2000+ lines)
│   ├── api-handlers.js    # API integration (1500+ lines)
│   ├── calculations.js    # Trading calculations (1500+ lines)
│   ├── tradingview.js     # Chart integration (2000+ lines)
│   ├── gemini.js          # AI analysis (1500+ lines)
│   ├── smc-ict.js         # Market structure (1500+ lines)
│   └── ui.js              # UI utilities (1000+ lines)
├── package.json           # NPM configuration
├── vercel.json           # Vercel deployment config
├── .env.example          # Environment variables template
└── README.md             # This file
```

### Total Lines of Code
- **HTML**: 500+ lines
- **CSS**: 4000+ lines
- **JavaScript**: 10000+ lines
- **Total**: 14,500+ lines of production code

### Browser Compatibility
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## 🔐 Security

- ✅ No sensitive data stored in code
- ✅ API keys stored in localStorage (client-side only)
- ✅ Environment variables for production
- ✅ HTTPS recommended for deployment
- ✅ CSP headers configured in Vercel
- ✅ No external tracking or analytics

---

## ⚠️ Disclaimer

**This is for educational purposes only.**

- Not financial advice
- Use at your own risk
- Verify all calculations
- Test strategies with demo accounts first
- Always use proper risk management

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

MIT License - see LICENSE file for details

---

## 📞 Support

- **Issues**: Use GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: support@tradingdashboard.dev

---

## 🙏 Acknowledgments

- [Lightweight Charts](https://tradingview.github.io/lightweight-charts/) - Chart library
- [Google Gemini](https://gemini.google.com/app) - AI analysis
- [Yahoo Finance API](https://finance.yahoo.com) - Price data

---

## 🎯 Roadmap

- [ ] WebSocket real-time updates
- [ ] Advanced charting tools
- [ ] Strategy backtesting
- [ ] Trade journal & statistics
- [ ] Mobile app version
- [ ] Multi-language support
- [ ] Community marketplace
- [ ] API for third-party tools

---

**Made with ❤️ by Trading Pro Team**

Last Updated: 2026-04-06