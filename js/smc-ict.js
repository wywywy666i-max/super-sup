// ============================================================
// SMC & ICT MARKET STRUCTURE ANALYSIS
// ============================================================

/**
 * SMC Analysis Engine
 * Smart Money Concepts - Market Structure Detection
 */
class SMCEngine {
    constructor() {
        this.swingHigh = null;
        this.swingLow = null;
        this.orderBlocks = [];
        this.fvg = []; // Fair Value Gaps
        this.breaker = null;
        this.bos = []; // Break of Structure
        this.choch = []; // Change of Character
    }

    /**
     * Identify Swings (HH/LL/LH/HL)
     */
    identifySwings(candles, period = 5) {
        try {
            if (!candles || candles.length < period * 2) return [];

            const swings = [];

            for (let i = period; i < candles.length - period; i++) {
                const current = candles[i];
                const prevCandles = candles.slice(i - period, i);
                const nextCandles = candles.slice(i + 1, i + period + 1);

                const isPeak = current.high >= Math.max(...prevCandles.map(c => c.high)) &&
                              current.high >= Math.max(...nextCandles.map(c => c.high));

                const isTrough = current.low <= Math.min(...prevCandles.map(c => c.low)) &&
                                current.low <= Math.min(...nextCandles.map(c => c.low));

                if (isPeak) {
                    swings.push({
                        type: 'peak',
                        price: current.high,
                        index: i,
                        time: current.time
                    });
                } else if (isTrough) {
                    swings.push({
                        type: 'trough',
                        price: current.low,
                        index: i,
                        time: current.time
                    });
                }
            }

            return swings;
        } catch (err) {
            console.error('Swing identification error:', err);
            return [];
        }
    }

    /**
     * Identify Order Blocks
     */
    identifyOrderBlocks(candles, swings) {
        try {
            const blocks = [];

            for (let i = 0; i < swings.length - 1; i++) {
                const currentSwing = swings[i];
                const nextSwing = swings[i + 1];

                // Buy-side Order Block (after downmove rejected)
                if (currentSwing.type === 'trough' && nextSwing.type === 'peak') {
                    const blockCandle = candles[currentSwing.index];
                    blocks.push({
                        type: 'buy',
                        high: Math.max(blockCandle.high, nextSwing.price),
                        low: Math.min(blockCandle.low, currentSwing.price),
                        strongPrice: blockCandle.close,
                        timeCreated: blockCandle.time,
                        confidence: this.calculateOBConfidence(blockCandle, nextSwing.price)
                    });
                }

                // Sell-side Order Block (after upmove rejected)
                if (currentSwing.type === 'peak' && nextSwing.type === 'trough') {
                    const blockCandle = candles[currentSwing.index];
                    blocks.push({
                        type: 'sell',
                        high: Math.max(blockCandle.high, currentSwing.price),
                        low: Math.min(blockCandle.low, nextSwing.price),
                        strongPrice: blockCandle.close,
                        timeCreated: blockCandle.time,
                        confidence: this.calculateOBConfidence(blockCandle, nextSwing.price)
                    });
                }
            }

            this.orderBlocks = blocks;
            return blocks;
        } catch (err) {
            console.error('Order block identification error:', err);
            return [];
        }
    }

    /**
     * Calculate OB Confidence
     */
    calculateOBConfidence(candle, swingPrice) {
        const bodySize = Math.abs(candle.close - candle.open);
        const wickSize = Math.abs(candle.high - candle.low) - bodySize;
        const bodyRatio = bodySize / (bodySize + wickSize || 1);

        // Strong candle = small wick, large body
        let confidence = bodyRatio * 100;

        // Boost if price rejected to opposite side
        if (candle.close > candle.open && swingPrice < candle.low) {
            confidence += 10;
        } else if (candle.close < candle.open && swingPrice > candle.high) {
            confidence += 10;
        }

        return Math.min(confidence, 100);
    }

    /**
     * Identify Fair Value Gaps (FVG)
     */
    identifyFVG(candles) {
        try {
            const gaps = [];

            for (let i = 2; i < candles.length; i++) {
                const candle1 = candles[i - 2];
                const candle2 = candles[i - 1];
                const candle3 = candles[i];

                // Bullish FVG: candle1.low > candle3.high
                if (candle1.low > candle3.high) {
                    gaps.push({
                        type: 'bullish',
                        topPrice: candle1.low,
                        bottomPrice: candle3.high,
                        size: candle1.low - candle3.high,
                        timeCreated: candle2.time,
                        mitigated: false
                    });
                }

                // Bearish FVG: candle1.high < candle3.low
                if (candle1.high < candle3.low) {
                    gaps.push({
                        type: 'bearish',
                        topPrice: candle3.low,
                        bottomPrice: candle1.high,
                        size: candle3.low - candle1.high,
                        timeCreated: candle2.time,
                        mitigated: false
                    });
                }
            }

            this.fvg = gaps;
            return gaps;
        } catch (err) {
            console.error('FVG identification error:', err);
            return [];
        }
    }

    /**
     * Identify Break of Structure (BOS)
     */
    identifyBOS(candles, swings) {
        try {
            const breaks = [];

            for (let i = 2; i < swings.length; i++) {
                const prev2 = swings[i - 2];
                const prev1 = swings[i - 1];
                const current = swings[i];

                // Bullish BOS
                if (prev2.type === 'trough' && prev1.type === 'peak' && current.type === 'trough') {
                    if (current.price < prev2.price) {
                        breaks.push({
                            type: 'bearish',
                            price: current.price,
                            previousStructure: prev2.price,
                            index: current.index,
                            reason: 'Lower Low (Bearish Structure Break)'
                        });
                    }
                }

                // Bearish BOS
                if (prev2.type === 'peak' && prev1.type === 'trough' && current.type === 'peak') {
                    if (current.price > prev2.price) {
                        breaks.push({
                            type: 'bullish',
                            price: current.price,
                            previousStructure: prev2.price,
                            index: current.index,
                            reason: 'Higher High (Bullish Structure Break)'
                        });
                    }
                }
            }

            this.bos = breaks;
            return breaks;
        } catch (err) {
            console.error('BOS identification error:', err);
            return [];
        }
    }

    /**
     * Identify Change of Character (CHoCH)
     */
    identifyChoch(candles, swings) {
        try {
            const changes = [];

            for (let i = 3; i < swings.length; i++) {
                const prev3 = swings[i - 3];
                const prev2 = swings[i - 2];
                const prev1 = swings[i - 1];
                const current = swings[i];

                // Uptrend to Downtrend
                if (prev3.type === 'trough' && prev2.type === 'peak' && prev1.type === 'trough' && current.type === 'peak') {
                    if (prev1.price < prev3.price && current.price < prev2.price) {
                        changes.push({
                            type: 'downtrend',
                            index: current.index,
                            timestamp: current.time
                        });
                    }
                }

                // Downtrend to Uptrend
                if (prev3.type === 'peak' && prev2.type === 'trough' && prev1.type === 'peak' && current.type === 'trough') {
                    if (prev1.price > prev3.price && current.price > prev2.price) {
                        changes.push({
                            type: 'uptrend',
                            index: current.index,
                            timestamp: current.time
                        });
                    }
                }
            }

            this.choch = changes;
            return changes;
        } catch (err) {
            console.error('CHoCH identification error:', err);
            return [];
        }
    }

    /**
     * Full Market Structure Analysis
     */
    analyzeStructure(candles) {
        try {
            const analysis = {};

            // Identify swings
            const swings = this.identifySwings(candles, 5);
            analysis.swings = swings;

            // Identify order blocks
            const orderBlocks = this.identifyOrderBlocks(candles, swings);
            analysis.orderBlocks = orderBlocks;

            // Identify FVG
            const fvgs = this.identifyFVG(candles);
            analysis.fvg = fvgs;

            // Identify BOS
            const bos = this.identifyBOS(candles, swings);
            analysis.bos = bos;

            // Identify CHoCH
            const choch = this.identifyChoch(candles, swings);
            analysis.choch = choch;

            // Determine trend
            analysis.trend = this.determineTrend(swings, candles);

            // Find confluence zones
            analysis.confluenceZones = this.findConfluence(analysis);

            return analysis;
        } catch (err) {
            console.error('Structure analysis error:', err);
            return {};
        }
    }

    /**
     * Determine Trend
     */
    determineTrend(swings, candles) {
        if (!swings || swings.length < 2) return 'unknown';

        const lastSwings = swings.slice(-2);
        const lastCandle = candles[candles.length - 1];

        // Check last 2 swings
        if (lastSwings[0]?.type === 'trough' && lastSwings[1]?.type === 'peak') {
            return 'bullish';
        } else if (lastSwings[0]?.type === 'peak' && lastSwings[1]?.type === 'trough') {
            return 'bearish';
        }

        return 'consolidation';
    }

    /**
     * Find Confluence Zones
     */
    findConfluence(analysis) {
        try {
            const zones = [];

            // Check where OB overlaps with FVG
            analysis.orderBlocks?.forEach(ob => {
                analysis.fvg?.forEach(fvg => {
                    if ((ob.low <= fvg.topPrice && ob.high >= fvg.bottomPrice) ||
                        (fvg.bottomPrice <= ob.high && fvg.topPrice >= ob.low)) {
                        zones.push({
                            type: 'ob_fvg_confluence',
                            topPrice: Math.max(ob.low, fvg.bottomPrice),
                            bottomPrice: Math.min(ob.high, fvg.topPrice),
                            strength: 'very_high',
                            components: ['order_block', 'fvg']
                        });
                    }
                });
            });

            return zones;
        } catch (err) {
            console.error('Confluence finding error:', err);
            return [];
        }
    }

    /**
     * Find Optimal Entry Points
     */
    findEntryPoints(analysis) {
        try {
            const entries = [];

            // Entry at confluence zones
            analysis.confluenceZones?.forEach(zone => {
                entries.push({
                    price: (zone.topPrice + zone.bottomPrice) / 2,
                    type: 'confluence',
                    zone: zone,
                    confidence: 90
                });
            });

            // Entry at order block rejection
            analysis.orderBlocks?.forEach(ob => {
                if (ob.type === 'buy') {
                    entries.push({
                        price: ob.low,
                        type: 'ob_support',
                        confidence: ob.confidence
                    });
                } else {
                    entries.push({
                        price: ob.high,
                        type: 'ob_resistance',
                        confidence: ob.confidence
                    });
                }
            });

            // Sort by confidence
            return entries.sort((a, b) => b.confidence - a.confidence);
        } catch (err) {
            console.error('Entry point finding error:', err);
            return [];
        }
    }
}

/**
 * ICT Analysis Engine
 * Inner Circle Trader Concepts
 */
class ICTEngine {
    constructor() {
        this.opl = null; // Opening Price Level
        this.otl = null; // Opening Time Level
        this.ote = null; // Order Template Entry
        this.poi = null; // Point of Interest
        this.premiumZone = null;
        this.discountZone = null;
    }

    /**
     * Identify OPL (Opening Price Level)
     */
    identifyOPL(candles) {
        if (!candles || candles.length === 0) return null;
        const firstCandle = candles[0];
        this.opl = firstCandle.open;
        return this.opl;
    }

    /**
     * Identify Premium/Discount Zones
     */
    identifyPremiumDiscountZones(candles) {
        try {
            const prices = candles.map(c => c.close);
            const avgPrice = prices.reduce((a, b) => a + b) / prices.length;

            // Premium Zone: Above average
            this.premiumZone = {
                high: Math.max(...prices),
                low: avgPrice
            };

            // Discount Zone: Below average
            this.discountZone = {
                high: avgPrice,
                low: Math.min(...prices)
            };

            return { premium: this.premiumZone, discount: this.discountZone };
        } catch (err) {
            console.error('Premium/discount zone error:', err);
            return {};
        }
    }

    /**
     * Calculate OTE (Order Template Entry)
     */
    calculateOTE(highPrice, lowPrice) {
        try {
            const range = highPrice - lowPrice;
            const midPoint = lowPrice + (range / 2);

            // OTE typically at 50% retracement
            this.ote = {
                price: midPoint,
                upTarget: highPrice,
                downTarget: lowPrice,
                range: range
            };

            return this.ote;
        } catch (err) {
            console.error('OTE calculation error:', err);
            return null;
        }
    }

    /**
     * Calculate POI (Point of Interest)
     */
    calculatePOI(entryPrice, risk, rewardMultiplier = 1) {
        try {
            this.poi = {
                entryPrice: entryPrice,
                takeProfit: entryPrice + (risk * rewardMultiplier),
                stopLoss: entryPrice - risk,
                riskReward: rewardMultiplier,
                riskAmount: risk
            };

            return this.poi;
        } catch (err) {
            console.error('POI calculation error:', err);
            return null;
        }
    }

    /**
     * Identify Liquidity Zones
     */
    identifyLiquidityZones(candles, swings) {
        try {
            const zones = [];

            // Recent swing highs/lows are liquidity zones
            swings.forEach(swing => {
                zones.push({
                    price: swing.price,
                    type: swing.type === 'peak' ? 'resistance' : 'support',
                    time: swing.time
                });
            });

            return zones;
        } catch (err) {
            console.error('Liquidity zone error:', err);
            return [];
        }
    }

    /**
     * Full ICT Analysis
     */
    analyzeICT(candles, swings) {
        try {
            const analysis = {};

            // Identify OPL
            analysis.opl = this.identifyOPL(candles);

            // Identify premium/discount
            const zones = this.identifyPremiumDiscountZones(candles);
            analysis.premiumZone = zones.premium;
            analysis.discountZone = zones.discount;

            // Calculate OTE
            const highPrice = Math.max(...candles.map(c => c.high));
            const lowPrice = Math.min(...candles.map(c => c.low));
            analysis.ote = this.calculateOTE(highPrice, lowPrice);

            // Identify liquidity zones
            analysis.liquidityZones = this.identifyLiquidityZones(candles, swings);

            // Current price analysis
            const currentPrice = candles[candles.length - 1].close;
            analysis.currentPrice = currentPrice;
            analysis.inPremium = currentPrice > zones.premium.low;
            analysis.inDiscount = currentPrice < zones.discount.high;

            return analysis;
        } catch (err) {
            console.error('ICT analysis error:', err);
            return {};
        }
    }
}

/**
 * Initialize Engines
 */
const smcEngine = new SMCEngine();
const ictEngine = new ICTEngine();

// Export for use
window.MarketAnalysis = {
    smc: smcEngine,
    ict: ictEngine,
    analyzeStructure: (candles) => smcEngine.analyzeStructure(candles),
    analyzeICT: (candles, swings) => ictEngine.analyzeICT(candles, swings)
};