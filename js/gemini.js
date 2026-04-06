// ============================================================
// GEMINI AI INTEGRATION - MARKET ANALYSIS & TRADING INSIGHTS
// ============================================================

/**
 * Gemini AI Analysis Engine
 */
class GeminiAnalyzer {
    constructor() {
        this.apiKey = localStorage.getItem('geminiApiKey') || '';
        this.baseURL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
        this.analysisCache = new Map();
        this.cacheTTL = 5 * 60 * 1000; // 5 minutes
        this.requestQueue = [];
        this.isProcessing = false;
    }

    /**
     * Analyze Market Structure (SMC/ICT)
     */
    async analyzeMarketStructure(marketData) {
        try {
            const prompt = `
                Analyze the following market structure using Smart Money Concepts (SMC):
                
                Symbol: ${marketData.symbol}
                Timeframe: ${marketData.timeframe}
                Current Price: ${marketData.currentPrice}
                High: ${marketData.high}
                Low: ${marketData.low}
                Trend: ${marketData.trend}
                
                Provide analysis on:
                1. Market Structure (HTF vs LTF)
                2. Supply/Demand Zones
                3. Order Blocks
                4. Fair Value Gaps (FVG)
                5. Entry Points
                
                Format response as structured analysis.
            `;

            return await this.generateAnalysis(prompt, 'market_structure');
        } catch (err) {
            console.error('Market structure analysis error:', err);
            return this.getDefaultMarketStructure();
        }
    }

    /**
     * Analyze Using ICT Concepts
     */
    async analyzeICT(chartData) {
        try {
            const prompt = `
                Using Inner Circle Trader (ICT) methodology, analyze:
                
                Symbol: ${chartData.symbol}
                Current Price: ${chartData.price}
                ATR: ${chartData.atr}
                
                Identify:
                1. Order Template Entries (OTE)
                2. Points of Interest (POI)
                3. Premium/Discount Zones
                4. Optimal Entry Time
                5. Risk/Reward Setup
                
                Provide confidence level (0-100%) for each setup.
            `;

            return await this.generateAnalysis(prompt, 'ict_analysis');
        } catch (err) {
            console.error('ICT analysis error:', err);
            return this.getDefaultICTAnalysis();
        }
    }

    /**
     * Generate Trading Recommendation
     */
    async generateTradingRecommendation(tradeSetup) {
        try {
            const prompt = `
                Based on this trading setup, provide a recommendation:
                
                Entry Price: ${tradeSetup.entry}
                Take Profit: ${tradeSetup.tp}
                Stop Loss: ${tradeSetup.sl}
                Account Balance: $${tradeSetup.balance}
                Risk Percentage: ${tradeSetup.riskPercent}%
                
                Provide:
                1. Setup Quality Assessment (0-100%)
                2. Risk/Reward Analysis
                3. Recommended Lot Size
                4. Time Bias
                5. Go/No-Go Decision with reasoning
                
                Be concise and specific.
            `;

            return await this.generateAnalysis(prompt, 'trade_recommendation');
        } catch (err) {
            console.error('Trade recommendation error:', err);
            return this.getDefaultRecommendation();
        }
    }

    /**
     * Generate Entry Point Analysis
     */
    async analyzeEntryPoints(symbol, priceAction) {
        try {
            const prompt = `
                Analyze potential entry points for ${symbol}:
                
                Price Action: ${priceAction}
                Current Support: ${priceAction.support}
                Current Resistance: ${priceAction.resistance}
                
                Suggest 3 entry points with:
                1. Price Level
                2. Reason (confluence, support, breakout, etc.)
                3. Confidence (%)
                4. Ideal Stop Loss
                5. Target Take Profit
                
                Rank by probability of success.
            `;

            return await this.generateAnalysis(prompt, 'entry_points');
        } catch (err) {
            console.error('Entry point analysis error:', err);
            return this.getDefaultEntryPoints();
        }
    }

    /**
     * Analyze Risk Management
     */
    async analyzeRiskManagement(account) {
        try {
            const prompt = `
                Provide personalized risk management recommendations for:
                
                Account Balance: $${account.balance}
                Daily Target: ${account.dailyTarget}%
                Max Daily Loss: ${account.maxDailyLoss}%
                Win Rate: ${account.winRate}%
                
                Recommend:
                1. Optimal Risk per Trade
                2. Position Sizing Strategy
                3. Daily/Weekly/Monthly Targets
                4. Loss Limit Recommendations
                5. Portfolio Allocation
                
                Include reasoning for each recommendation.
            `;

            return await this.generateAnalysis(prompt, 'risk_management');
        } catch (err) {
            console.error('Risk management analysis error:', err);
            return this.getDefaultRiskManagement();
        }
    }

    /**
     * Analyze Volatility
     */
    async analyzeVolatility(volatilityData) {
        try {
            const prompt = `
                Analyze current market volatility:
                
                ATR: ${volatilityData.atr}
                ATR Period: ${volatilityData.period}
                Current Volatility Level: ${volatilityData.level}
                Historical Avg: ${volatilityData.avgVolatility}
                
                Provide:
                1. Volatility Classification (Low/Medium/High)
                2. Impact on Entry Points
                3. Recommended TP/SL Distances
                4. Best Trade Types (scalp/swing/position)
                5. Risk Adjustment Recommendations
            `;

            return await this.generateAnalysis(prompt, 'volatility');
        } catch (err) {
            console.error('Volatility analysis error:', err);
            return this.getDefaultVolatilityAnalysis();
        }
    }

    /**
     * Generate Analysis (Core Function)
     */
    async generateAnalysis(prompt, cacheKey) {
        try {
            // Check cache
            const cached = this.getFromCache(cacheKey);
            if (cached) {
                console.log('📦 Using cached analysis:', cacheKey);
                return cached;
            }

            // Check if API key is set
            if (!this.apiKey || this.apiKey === 'demo-key') {
                console.warn('⚠️ Gemini API key not configured, using default analysis');
                return this.getDefaultAnalysis(prompt);
            }

            // Add to queue
            this.requestQueue.push({ prompt, cacheKey });
            return await this.processQueue();
        } catch (err) {
            console.error('Generate analysis error:', err);
            return this.getDefaultAnalysis(prompt);
        }
    }

    /**
     * Process Request Queue
     */
    async processQueue() {
        if (this.isProcessing || this.requestQueue.length === 0) {
            return this.requestQueue[0] ? this.getDefaultAnalysis(this.requestQueue[0].prompt) : '';
        }

        this.isProcessing = true;
        const { prompt, cacheKey } = this.requestQueue.shift();

        try {
            const response = await this.callGeminiAPI(prompt);
            this.setInCache(cacheKey, response);
            return response;
        } catch (err) {
            console.error('Queue processing error:', err);
            return this.getDefaultAnalysis(prompt);
        } finally {
            this.isProcessing = false;
            if (this.requestQueue.length > 0) {
                setTimeout(() => this.processQueue(), 1000);
            }
        }
    }

    /**
     * Call Gemini API
     */
    async callGeminiAPI(prompt) {
        try {
            const response = await fetch(this.baseURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': this.apiKey
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    },
                    safetySettings: [
                        {
                            category: 'HARM_CATEGORY_HARASSMENT',
                            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
                        },
                    ]
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`API Error: ${error.error.message}`);
            }

            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || this.getDefaultAnalysis('');
        } catch (err) {
            console.error('Gemini API Error:', err);
            throw err;
        }
    }

    /**
     * Set API Key
     */
    setApiKey(key) {
        this.apiKey = key;
        localStorage.setItem('geminiApiKey', key);
        this.analysisCache.clear();
    }

    /**
     * Cache Management
     */
    getFromCache(key) {
        const item = this.analysisCache.get(key);
        if (!item) return null;

        if (Date.now() - item.timestamp > this.cacheTTL) {
            this.analysisCache.delete(key);
            return null;
        }

        return item.data;
    }

    setInCache(key, data) {
        this.analysisCache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    clearCache() {
        this.analysisCache.clear();
    }

    /**
     * Test API Connection
     */
    async testConnection() {
        try {
            const testPrompt = 'Say "OK" if you can read this.';
            const response = await this.callGeminiAPI(testPrompt);
            return response && response.length > 0;
        } catch (err) {
            return false;
        }
    }

    /**
     * DEFAULT RESPONSES (Fallback when API fails or not configured)
     */

    getDefaultAnalysis(prompt) {
        return `
            <p><strong>📊 Market Analysis Summary</strong></p>
            <p>This analysis is provided as a demonstration. To enable AI-powered analysis:</p>
            <ol>
                <li>Get a Gemini API key from <a href="https://makersuite.google.com/app/apikey" target="_blank">Google AI Studio</a></li>
                <li>Add it to your Profile settings (Page 5)</li>
                <li>The system will use real AI analysis for all market insights</li>
            </ol>
            <p><strong>Current Setup:</strong> Using mock data for demonstration purposes.</p>
        `;
    }

    getDefaultMarketStructure() {
        return `
            <div class="analysis-result">
                <h4>Market Structure Analysis</h4>
                <p><strong>🔼 Trend:</strong> Bullish on HTF, consolidating on LTF</p>
                <p><strong>🏢 Order Blocks:</strong></p>
                <ul>
                    <li>Buy-side OB at 2,048.50 (recent rejection zone)</li>
                    <li>Sell-side OB at 2,065.00 (previous swing high)</li>
                </ul>
                <p><strong>📍 Fair Value Gaps:</strong></p>
                <ul>
                    <li>Bullish FVG: 2,045-2,050 (gap to fill)</li>
                </ul>
                <p><strong>✅ Recommendation:</strong> Wait for retest of buy-side OB for entry confirmation</p>
            </div>
        `;
    }

    getDefaultICTAnalysis() {
        return `
            <div class="analysis-result">
                <h4>ICT Market Analysis</h4>
                <p><strong>📌 Order Template Entry (OTE):</strong> Pending at 2,048.00</p>
                <p><strong>🎯 Point of Interest (POI):</strong> 2,050.50 (OTE + 1:1 risk/reward)</p>
                <p><strong>💰 Premium Zone:</strong> Above 2,060.00</p>
                <p><strong>📉 Discount Zone:</strong> Below 2,040.00</p>
                <p><strong>⏰ Optimal Entry Time:</strong> Next 4-hour candle close</p>
                <p><strong>📊 Confidence Level:</strong> 78%</p>
            </div>
        `;
    }

    getDefaultRecommendation() {
        return `
            <div class="recommendation-box">
                <p><strong>✅ Setup Quality: 82/100</strong></p>
                <p><strong>R:R Ratio Assessment:</strong> Excellent (1:2.5 setup)</p>
                <p><strong>Recommended Action:</strong> GO - Enter on next confirmation signal</p>
                <p><strong>Lot Size:</strong> Use calculated lot from calculator</p>
                <p><strong>Risk Time Bias:</strong> Short-term (1-4 hours)</p>
            </div>
        `;
    }

    getDefaultEntryPoints() {
        return `
            <div class="entry-points">
                <h4>🎯 Recommended Entry Points</h4>
                <div style="margin: 1rem 0; padding: 1rem; background: rgba(0,204,136,0.1); border-left: 3px solid #00cc88;">
                    <p><strong>Entry 1: 2,048.00</strong> - Support + Confluence (Confidence: 85%)</p>
                    <p>SL: 2,040.00 | TP: 2,070.00</p>
                </div>
                <div style="margin: 1rem 0; padding: 1rem; background: rgba(0,102,204,0.1); border-left: 3px solid #0066cc;">
                    <p><strong>Entry 2: 2,050.50</strong> - Breakout Level (Confidence: 72%)</p>
                    <p>SL: 2,042.00 | TP: 2,075.00</p>
                </div>
                <div style="margin: 1rem 0; padding: 1rem; background: rgba(212,0,255,0.1); border-left: 3px solid #d400ff;">
                    <p><strong>Entry 3: 2,055.00</strong> - Resistance Break (Confidence: 65%)</p>
                    <p>SL: 2,048.00 | TP: 2,085.00</p>
                </div>
            </div>
        `;
    }

    getDefaultRiskManagement() {
        return `
            <div class="risk-mgmt">
                <h4>💼 Risk Management Strategy</h4>
                <p><strong>Optimal Risk per Trade:</strong> 1.5-2%</p>
                <p><strong>Daily Loss Limit:</strong> 3% (Stop trading after)</p>
                <p><strong>Daily Profit Target:</strong> 2-3%</p>
                <p><strong>Recommended Trades per Day:</strong> 3-5 max</p>
                <p><strong>Position Sizing:</strong> Use calculator with 2% risk per trade</p>
                <p><strong>Portfolio Allocation:</strong> 70% swing, 30% scalp trades</p>
            </div>
        `;
    }

    getDefaultVolatilityAnalysis() {
        return `
            <div class="volatility-analysis">
                <h4>📊 Volatility Assessment</h4>
                <p><strong>Current Level:</strong> MEDIUM (within 50-day average)</p>
                <p><strong>Recommended TP/SL Distance:</strong> 40-60 pips</p>
                <p><strong>Best Trade Type:</strong> Swing Trading (hold 1-4 hours)</p>
                <p><strong>Risk Adjustment:</strong> No adjustment needed</p>
                <p><strong>Scalping Viability:</strong> Not recommended (spreads too wide)</p>
            </div>
        `;
    }
}

/**
 * Initialize Gemini Analyzer
 */
const geminiAnalyzer = new GeminiAnalyzer();

// Export for use in other modules
window.Gemini = {
    analyzer: geminiAnalyzer,
    analyze: (type, data) => {
        switch(type) {
            case 'structure':
                return geminiAnalyzer.analyzeMarketStructure(data);
            case 'ict':
                return geminiAnalyzer.analyzeICT(data);
            case 'entry':
                return geminiAnalyzer.analyzeEntryPoints(data.symbol, data.priceAction);
            case 'recommendation':
                return geminiAnalyzer.generateTradingRecommendation(data);
            case 'risk':
                return geminiAnalyzer.analyzeRiskManagement(data);
            default:
                return geminiAnalyzer.generateAnalysis(data, 'general');
        }
    }
};