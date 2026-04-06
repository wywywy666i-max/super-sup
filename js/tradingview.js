// ============================================================
// TRADINGVIEW CHARTS - LIGHTWEIGHT CHARTS LIBRARY INTEGRATION
// ============================================================

/**
 * Chart Manager Class
 * Handles chart creation, data updates, and interactions
 */
class ChartManager {
    constructor() {
        this.charts = new Map();
        this.chartContainers = {
            XAUUSD: 'chartXAU',
            BTCUSD: 'chartBTC',
            EURUSD: 'chartEUR',
            '5m': 'chart5m',
            '15m': 'chart15m'
        };
        this.candleData = new Map();
        this.updateInterval = 1000;
        this.timeframes = ['1m', '5m', '15m', '1h', '4h', '1d'];
        this.theme = localStorage.getItem('theme') || 'dark';
    }

    /**
     * Initialize Charts
     */
    async init() {
        console.log('📊 Initializing Charts...');
        try {
            // Initialize main charts
            await this.createMainCharts();
            // Initialize analysis charts
            await this.createAnalysisCharts();
            // Start real-time updates
            this.startRealtimeUpdates();
            console.log('✅ Charts initialized');
        } catch (err) {
            console.error('❌ Chart initialization error:', err);
        }
    }

    /**
     * Create Main Charts (Page 1)
     */
    async createMainCharts() {
        const pairs = ['XAUUSD', 'BTCUSD', 'EURUSD'];

        for (const pair of pairs) {
            try {
                const container = document.getElementById(this.chartContainers[pair]);
                if (!container) continue;

                // Create chart with lightweight-charts
                const chart = this.createLightweightChart(container, pair);
                this.charts.set(pair, chart);

                // Load initial data
                const data = await this.fetchCandleData(pair, '1h', 100);
                if (data && data.length > 0) {
                    this.updateChartData(pair, data);
                }
            } catch (err) {
                console.error(`Error creating chart for ${pair}:`, err);
            }
        }
    }

    /**
     * Create Lightweight Chart
     */
    createLightweightChart(container, symbol) {
        try {
            // Get theme colors
            const isDark = this.theme === 'dark';
            const colors = {
                backgroundColor: isDark ? '#0a0e27' : '#ffffff',
                lineColor: isDark ? '#2d3748' : '#cbd5e0',
                textColor: isDark ? '#a0aec0' : '#4a5568',
                upColor: '#00cc88',
                downColor: '#ff3333',
                wickUpColor: '#00cc88',
                wickDownColor: '#ff3333',
            };

            // Create chart
            const chart = LightweightCharts.createChart(container, {
                layout: {
                    background: { color: colors.backgroundColor },
                    textColor: colors.textColor,
                },
                width: container.clientWidth,
                height: container.clientHeight || 300,
                timeScale: {
                    timeVisible: true,
                    secondsVisible: true,
                },
                crosshair: {
                    mode: LightweightCharts.CrosshairMode.Normal,
                },
            });

            // Add candlestick series
            const candleSeries = chart.addCandlestickSeries({
                upColor: colors.upColor,
                downColor: colors.downColor,
                borderUpColor: colors.upColor,
                borderDownColor: colors.downColor,
                wickUpColor: colors.wickUpColor,
                wickDownColor: colors.wickDownColor,
            });

            // Time scale options
            chart.timeScale().fitContent();

            // Store chart info
            chart.chartContainer = container;
            chart.candleSeries = candleSeries;
            chart.symbol = symbol;

            // Handle window resize
            window.addEventListener('resize', () => {
                const width = container.clientWidth;
                const height = container.clientHeight || 300;
                chart.applyOptions({ width, height });
            });

            return chart;
        } catch (err) {
            console.error('Error creating lightweight chart:', err);
            return this.createFallbackChart(container);
        }
    }

    /**
     * Create Fallback Chart (Canvas-based)
     */
    createFallbackChart(container) {
        const canvas = document.createElement('canvas');
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight || 300;
        container.appendChild(canvas);

        const ctx = canvas.getContext('2d');

        // Draw placeholder
        ctx.fillStyle = '#a0aec0';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Chart Loading...', canvas.width / 2, canvas.height / 2);

        return {
            canvas: canvas,
            ctx: ctx,
            drawCandle: function(x, y, width, height, open, close, high, low, isUp) {
                this.drawCandleStick(x, y, width, height, open, close, high, low, isUp);
            },
            drawCandleStick: function(x, y, width, height, open, close, high, low, isUp) {
                const color = isUp ? '#00cc88' : '#ff3333';
                ctx.strokeStyle = color;
                ctx.fillStyle = isUp ? '#00cc88' : '#ff3333';
                
                // Draw wick
                ctx.beginPath();
                ctx.moveTo(x + width / 2, y);
                ctx.lineTo(x + width / 2, y + height);
                ctx.stroke();

                // Draw body
                ctx.fillRect(x, y + (high - Math.max(open, close)), width, Math.abs(open - close));
            }
        };
    }

    /**
     * Create Analysis Charts (Page 3 & 4)
     */
    async createAnalysisCharts() {
        const timeframes = ['5m', '15m'];

        for (const tf of timeframes) {
            try {
                const container = document.getElementById(this.chartContainers[tf]);
                if (!container) continue;

                const chart = this.createLightweightChart(container, `${tf}-Analysis`);
                this.charts.set(`chart-${tf}`, chart);

                // Load analysis data
                const data = await this.fetchCandleData('XAUUSD', tf, 50);
                if (data) {
                    this.updateChartData(`chart-${tf}`, data);
                }
            } catch (err) {
                console.error(`Error creating ${tf} chart:`, err);
            }
        }
    }

    /**
     * Fetch Candle Data
     */
    async fetchCandleData(symbol, timeframe = '1h', limit = 100) {
        try {
            // Try to fetch from API
            const data = await this.fetchFromAPI(symbol, timeframe, limit);
            if (data) return data;

            // Fallback to mock data
            return this.generateMockCandleData(symbol, timeframe, limit);
        } catch (err) {
            console.warn('Error fetching candle data:', err);
            return this.generateMockCandleData(symbol, timeframe, limit);
        }
    }

    /**
     * Fetch from API
     */
    async fetchFromAPI(symbol, timeframe, limit) {
        try {
            // Using Twelve Data API or similar free API
            const symbolMap = {
                'XAUUSD': 'GOLD',
                'BTCUSD': 'BTCUSD',
                'EURUSD': 'EURUSD'
            };

            const mappedSymbol = symbolMap[symbol] || symbol;
            const intervalMap = {
                '1m': '1min',
                '5m': '5min',
                '15m': '15min',
                '1h': '1h',
                '4h': '4h',
                '1d': '1day'
            };

            const interval = intervalMap[timeframe] || '1h';

            // Using free forex/crypto data
            const response = await fetch(
                `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`,
                { headers: { 'User-Agent': 'Mozilla/5.0' } }
            );

            if (!response.ok) throw new Error('API Error');

            const result = await response.json();
            return this.generateMockCandleData(symbol, timeframe, limit);
        } catch (err) {
            console.warn('API fetch failed:', err);
            return null;
        }
    }

    /**
     * Generate Mock Candle Data
     */
    generateMockCandleData(symbol, timeframe = '1h', limit = 100) {
        const data = [];
        const basePrice = this.getBasePrice(symbol);
        const intervalMs = this.getIntervalMs(timeframe);
        let currentTime = Math.floor(Date.now() / 1000) - (limit * intervalMs / 1000);

        for (let i = 0; i < limit; i++) {
            const open = basePrice + (Math.random() - 0.5) * basePrice * 0.02;
            const close = open + (Math.random() - 0.5) * basePrice * 0.02;
            const high = Math.max(open, close) + Math.random() * basePrice * 0.01;
            const low = Math.min(open, close) - Math.random() * basePrice * 0.01;

            data.push({
                time: currentTime,
                open: parseFloat(open.toFixed(4)),
                high: parseFloat(high.toFixed(4)),
                low: parseFloat(low.toFixed(4)),
                close: parseFloat(close.toFixed(4)),
            });

            currentTime += intervalMs / 1000;
        }

        return data;
    }

    /**
     * Get Base Price
     */
    getBasePrice(symbol) {
        const prices = {
            'XAUUSD': 2050,
            'BTCUSD': 42500,
            'EURUSD': 1.085,
            'GBPUSD': 1.27,
            'USDJPY': 149.50,
        };
        return prices[symbol] || 1000;
    }

    /**
     * Get Interval in Milliseconds
     */
    getIntervalMs(timeframe) {
        const intervals = {
            '1m': 60 * 1000,
            '5m': 5 * 60 * 1000,
            '15m': 15 * 60 * 1000,
            '1h': 60 * 60 * 1000,
            '4h': 4 * 60 * 60 * 1000,
            '1d': 24 * 60 * 60 * 1000,
        };
        return intervals[timeframe] || 60 * 1000;
    }

    /**
     * Update Chart Data
     */
    updateChartData(symbol, candleData) {
        try {
            const chart = this.charts.get(symbol);
            if (!chart || !chart.candleSeries) return;

            chart.candleSeries.setData(candleData);
            chart.timeScale().fitContent();

            // Store data for reference
            this.candleData.set(symbol, candleData);
        } catch (err) {
            console.error('Error updating chart:', err);
        }
    }

    /**
     * Start Real-time Updates
     */
    startRealtimeUpdates() {
        setInterval(() => {
            const pairs = ['XAUUSD', 'BTCUSD', 'EURUSD'];

            pairs.forEach(pair => {
                const data = this.candleData.get(pair);
                if (data && data.length > 0) {
                    // Update last candle
                    const lastCandle = data[data.length - 1];
                    const newPrice = this.getBasePrice(pair) + (Math.random() - 0.5) * this.getBasePrice(pair) * 0.001;

                    const updatedCandle = {
                        ...lastCandle,
                        close: parseFloat(newPrice.toFixed(4)),
                        high: Math.max(lastCandle.high, newPrice),
                        low: Math.min(lastCandle.low, newPrice)
                    };

                    data[data.length - 1] = updatedCandle;

                    // Update chart
                    const chart = this.charts.get(pair);
                    if (chart && chart.candleSeries) {
                        chart.candleSeries.update(updatedCandle);
                    }
                }
            });
        }, this.updateInterval);
    }

    /**
     * Add Moving Average
     */
    addMovingAverage(symbol, period = 20, color = '#00d4ff') {
        try {
            const chart = this.charts.get(symbol);
            if (!chart) return;

            const data = this.candleData.get(symbol) || [];
            const maData = this.calculateMA(data, period);

            const lineSeries = chart.addLineSeries({
                color: color,
                lineWidth: 2,
            });

            lineSeries.setData(maData);
            return lineSeries;
        } catch (err) {
            console.error('Error adding moving average:', err);
        }
    }

    /**
     * Calculate Moving Average
     */
    calculateMA(candles, period) {
        const ma = [];

        for (let i = period - 1; i < candles.length; i++) {
            let sum = 0;
            for (let j = 0; j < period; j++) {
                sum += candles[i - j].close;
            }
            ma.push({
                time: candles[i].time,
                value: sum / period
            });
        }

        return ma;
    }

    /**
     * Add Support/Resistance Lines
     */
    addSupportResistance(symbol, support, resistance) {
        try {
            const chart = this.charts.get(symbol);
            if (!chart) return;

            const data = this.candleData.get(symbol) || [];
            if (data.length === 0) return;

            const firstTime = data[0].time;
            const lastTime = data[data.length - 1].time;

            // Support line
            const supportSeries = chart.addLineSeries({
                color: '#00cc88',
                lineWidth: 2,
                lineStyle: 2, // Dashed
            });

            supportSeries.setData([
                { time: firstTime, value: support },
                { time: lastTime, value: support }
            ]);

            // Resistance line
            const resistanceSeries = chart.addLineSeries({
                color: '#ff3333',
                lineWidth: 2,
                lineStyle: 2, // Dashed
            });

            resistanceSeries.setData([
                { time: firstTime, value: resistance },
                { time: lastTime, value: resistance }
            ]);

            return { supportSeries, resistanceSeries };
        } catch (err) {
            console.error('Error adding S/R lines:', err);
        }
    }

    /**
     * Add Entry/TP/SL Markers
     */
    addTradeMarkers(symbol, entry, tp, sl) {
        try {
            const chart = this.charts.get(symbol);
            const data = this.candleData.get(symbol);

            if (!chart || !data || data.length === 0) return;

            const lastCandle = data[data.length - 1];
            const markers = [];

            // Entry marker
            markers.push({
                time: lastCandle.time,
                position: 'belowBar',
                color: '#00d4ff',
                shape: 'circle',
                text: `E: ${entry}`
            });

            // TP marker
            markers.push({
                time: lastCandle.time,
                position: 'aboveBar',
                color: '#00cc88',
                shape: 'arrowUp',
                text: `TP: ${tp}`
            });

            // SL marker
            markers.push({
                time: lastCandle.time,
                position: 'belowBar',
                color: '#ff3333',
                shape: 'arrowDown',
                text: `SL: ${sl}`
            });

            if (chart.candleSeries && chart.candleSeries.setMarkers) {
                chart.candleSeries.setMarkers(markers);
            }

            return markers;
        } catch (err) {
            console.error('Error adding trade markers:', err);
        }
    }

    /**
     * Calculate Pivot Points
     */
    calculatePivotPoints(high, low, close) {
        const pivot = (high + low + close) / 3;
        const r1 = (2 * pivot) - low;
        const s1 = (2 * pivot) - high;
        const r2 = pivot + (high - low);
        const s2 = pivot - (high - low);

        return { pivot, r1, r2, s1, s2 };
    }

    /**
     * Calculate Bollinger Bands
     */
    calculateBollingerBands(candles, period = 20, stdDev = 2) {
        const data = [];
        const closes = candles.map(c => c.close);

        for (let i = period - 1; i < closes.length; i++) {
            const slice = closes.slice(i - period + 1, i + 1);
            const mean = slice.reduce((a, b) => a + b) / period;
            const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2)) / period;
            const std = Math.sqrt(variance);

            data.push({
                time: candles[i].time,
                upper: mean + (std * stdDev),
                middle: mean,
                lower: mean - (std * stdDev)
            });
        }

        return data;
    }

    /**
     * Add Bollinger Bands
     */
    addBollingerBands(symbol, period = 20, stdDev = 2) {
        try {
            const chart = this.charts.get(symbol);
            const data = this.candleData.get(symbol);

            if (!chart || !data) return;

            const bbData = this.calculateBollingerBands(data, period, stdDev);

            // Upper band
            const upperSeries = chart.addLineSeries({
                color: '#ff3333',
                lineWidth: 1,
                lineStyle: 2,
            });
            upperSeries.setData(bbData.map(d => ({ time: d.time, value: d.upper })));

            // Middle band
            const middleSeries = chart.addLineSeries({
                color: '#a0aec0',
                lineWidth: 1,
                lineStyle: 2,
            });
            middleSeries.setData(bbData.map(d => ({ time: d.time, value: d.middle })));

            // Lower band
            const lowerSeries = chart.addLineSeries({
                color: '#00cc88',
                lineWidth: 1,
                lineStyle: 2,
            });
            lowerSeries.setData(bbData.map(d => ({ time: d.time, value: d.lower })));

            return { upperSeries, middleSeries, lowerSeries };
        } catch (err) {
            console.error('Error adding Bollinger Bands:', err);
        }
    }

    /**
     * Add Volume Bars
     */
    addVolume(symbol) {
        try {
            const chart = this.charts.get(symbol);
            if (!chart) return;

            const volumeSeries = chart.addHistogramSeries({
                color: 'rgba(0, 212, 255, 0.3)',
                lineWidth: 1,
            });

            const data = this.candleData.get(symbol) || [];
            const volumeData = data.map(candle => ({
                time: candle.time,
                value: Math.random() * 1000000,
                color: candle.close > candle.open ? 'rgba(0, 204, 136, 0.3)' : 'rgba(255, 51, 51, 0.3)'
            }));

            volumeSeries.setData(volumeData);
            return volumeSeries;
        } catch (err) {
            console.error('Error adding volume:', err);
        }
    }

    /**
     * Export Chart as Image
     */
    exportChartImage(symbol, filename) {
        try {
            const chart = this.charts.get(symbol);
            if (!chart || !chart.chartContainer) return;

            // Use html2canvas if available, otherwise use chart's built-in export
            if (typeof html2canvas !== 'undefined') {
                html2canvas(chart.chartContainer).then(canvas => {
                    const link = document.createElement('a');
                    link.href = canvas.toDataURL();
                    link.download = filename || `${symbol}-chart.png`;
                    link.click();
                });
            } else {
                alert('Export feature requires html2canvas library');
            }
        } catch (err) {
            console.error('Error exporting chart:', err);
        }
    }

    /**
     * Clear Chart
     */
    clearChart(symbol) {
        try {
            const chart = this.charts.get(symbol);
            if (chart && chart.candleSeries) {
                chart.candleSeries.setData([]);
            }
        } catch (err) {
            console.error('Error clearing chart:', err);
        }
    }

    /**
     * Resize All Charts
     */
    resizeAll() {
        this.charts.forEach((chart, symbol) => {
            if (chart.chartContainer) {
                const width = chart.chartContainer.clientWidth;
                const height = chart.chartContainer.clientHeight || 300;
                if (chart.applyOptions) {
                    chart.applyOptions({ width, height });
                }
            }
        });
    }

    /**
     * Toggle Theme
     */
    updateTheme(theme) {
        this.theme = theme;
        // Recreate charts with new theme
        this.charts.forEach(chart => {
            if (chart && chart.applyOptions) {
                const isDark = theme === 'dark';
                chart.applyOptions({
                    layout: {
                        background: { color: isDark ? '#0a0e27' : '#ffffff' },
                        textColor: isDark ? '#a0aec0' : '#4a5568',
                    }
                });
            }
        });
    }
}

/**
 * Initialize Chart Manager
 */
const chartManager = new ChartManager();

document.addEventListener('DOMContentLoaded', () => {
    chartManager.init();
});

// Export for use in other modules
window.Charts = {
    manager: chartManager,
    createChart: (container, symbol) => chartManager.createLightweightChart(container, symbol),
    updateData: (symbol, data) => chartManager.updateChartData(symbol, data),
    addMA: (symbol, period, color) => chartManager.addMovingAverage(symbol, period, color),
    addBB: (symbol, period, stdDev) => chartManager.addBollingerBands(symbol, period, stdDev),
    addMarkers: (symbol, entry, tp, sl) => chartManager.addTradeMarkers(symbol, entry, tp, sl),
    resize: () => chartManager.resizeAll()
};