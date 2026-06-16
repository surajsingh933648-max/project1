class CurrencyConverter {
    constructor() {
        this.apiKey = 'YOUR_API_KEY'; // Get free key from exchangerate-api.com
        this.baseUrl = 'https://api.exchangerate-api.com/v4/latest/';
        this.exchangeRates = {};
        this.lastUpdate = null;
        
        this.init();
    }
    
    async init() {
        this.bindEvents();
        await this.loadExchangeRates('USD');
        this.updatePopularConversions();
        this.startAutoRefresh();
    }
    
    bindEvents() {
        const convertBtn = document.getElementById('convertBtn');
        const swapBtn = document.getElementById('swapBtn');
        const amountInput = document.getElementById('amount');
        const fromCurrency = document.getElementById('fromCurrency');
        const toCurrency = document.getElementById('toCurrency');
        
        convertBtn.addEventListener('click', () => this.convert());
        swapBtn.addEventListener('click', () => this.swapCurrencies());
        amountInput.addEventListener('input', () => this.convert());
        fromCurrency.addEventListener('change', () => {
            this.updateFlag('fromFlag', fromCurrency.value);
            this.loadExchangeRates(fromCurrency.value);
        });
        toCurrency.addEventListener('change', () => {
            this.updateFlag('toFlag', toCurrency.value);
            this.convert();
        });
        
        // Convert on Enter key
        amountInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.convert();
        });
    }
    
    async loadExchangeRates(baseCurrency) {
        this.showLoading();
        
        try {
            // Using free API (no key required for basic usage)
            const response = await fetch(`${this.baseUrl}${baseCurrency}`);
            
            if (!response.ok) throw new Error('Failed to fetch exchange rates');
            
            const data = await response.json();
            this.exchangeRates = data.rates;
            this.lastUpdate = new Date(data.time_last_updated * 1000);
            this.updateLastUpdated();
            
            this.convert();
            this.updatePopularConversions();
            
        } catch (error) {
            console.error('Error loading exchange rates:', error);
            this.showError('Failed to load exchange rates. Using fallback rates.');
            this.loadFallbackRates();
        }
    }
    
    loadFallbackRates() {
        // Fallback rates (approximate)
        this.exchangeRates = {
            'USD': 1,
            'EUR': 0.85,
            'GBP': 0.73,
            'JPY': 110.5,
            'AUD': 1.35,
            'CAD': 1.25,
            'CHF': 0.92,
            'CNY': 6.45,
            'INR': 74.5,
            'AED': 3.67,
            'SAR': 3.75,
            'TRY': 8.5,
            'RUB': 73.5,
            'BRL': 5.25,
            'ZAR': 14.5,
            'SGD': 1.35,
            'NZD': 1.42,
            'HKD': 7.78,
            'KRW': 1150,
            'MXN': 20.0
        };
        this.convert();
    }
    
    convert() {
        const amount = parseFloat(document.getElementById('amount').value);
        const fromCurrency = document.getElementById('fromCurrency').value;
        const toCurrency = document.getElementById('toCurrency').value;
        
        if (isNaN(amount) || amount <= 0) {
            this.displayResult('Please enter a valid amount', '');
            return;
        }
        
        if (!this.exchangeRates[toCurrency]) {
            this.displayResult('Exchange rate not available', '');
            return;
        }
        
        // Convert: amount * (rate_to / rate_from)
        let convertedAmount;
        if (fromCurrency === 'USD') {
            convertedAmount = amount * this.exchangeRates[toCurrency];
        } else if (toCurrency === 'USD') {
            convertedAmount = amount / this.exchangeRates[fromCurrency];
        } else {
            const amountInUSD = amount / this.exchangeRates[fromCurrency];
            convertedAmount = amountInUSD * this.exchangeRates[toCurrency];
        }
        
        const formattedAmount = convertedAmount.toFixed(2);
        const rate = (this.exchangeRates[toCurrency] / this.exchangeRates[fromCurrency]).toFixed(4);
        
        this.displayResult(
            `${this.formatNumber(formattedAmount)} ${toCurrency}`,
            `1 ${fromCurrency} = ${rate} ${toCurrency}`
        );
    }
    
    displayResult(amount, rate) {
        const resultElement = document.getElementById('resultAmount');
        const rateElement = document.getElementById('rateInfo');
        
        resultElement.innerHTML = amount;
        rateElement.innerHTML = rate;
        
        // Add animation
        resultElement.style.animation = 'none';
        resultElement.offsetHeight; // Trigger reflow
        resultElement.style.animation = 'fadeIn 0.5s ease';
    }
    
    swapCurrencies() {
        const fromSelect = document.getElementById('fromCurrency');
        const toSelect = document.getElementById('toCurrency');
        
        const fromValue = fromSelect.value;
        const toValue = toSelect.value;
        
        fromSelect.value = toValue;
        toSelect.value = fromValue;
        
        this.updateFlag('fromFlag', toValue);
        this.updateFlag('toFlag', fromValue);
        
        this.loadExchangeRates(fromSelect.value);
    }
    
    updateFlag(elementId, currencyCode) {
        const flagImg = document.getElementById(elementId);
        const countryCode = this.getCountryCode(currencyCode);
        flagImg.src = `https://flagcdn.com/w20/${countryCode}.png`;
        flagImg.alt = currencyCode;
    }
    
    getCountryCode(currencyCode) {
        const countryMap = {
            'USD': 'us', 'EUR': 'eu', 'GBP': 'gb', 'JPY': 'jp',
            'AUD': 'au', 'CAD': 'ca', 'CHF': 'ch', 'CNY': 'cn',
            'INR': 'in', 'AED': 'ae', 'SAR': 'sa', 'TRY': 'tr',
            'RUB': 'ru', 'BRL': 'br', 'ZAR': 'za', 'SGD': 'sg',
            'NZD': 'nz', 'HKD': 'hk', 'KRW': 'kr', 'MXN': 'mx'
        };
        return countryMap[currencyCode] || 'us';
    }
    
    updateLastUpdated() {
        const lastUpdatedElement = document.getElementById('lastUpdated');
        if (this.lastUpdate) {
            lastUpdatedElement.innerHTML = `Last updated: ${this.lastUpdate.toLocaleString()}`;
        }
    }
    
    updatePopularConversions() {
        const popularGrid = document.getElementById('popularGrid');
        const popularPairs = [
            { from: 'USD', to: 'EUR' },
            { from: 'USD', to: 'GBP' },
            { from: 'USD', to: 'JPY' },
            { from: 'EUR', to: 'USD' },
            { from: 'GBP', to: 'USD' },
            { from: 'USD', to: 'INR' }
        ];
        
        popularGrid.innerHTML = '';
        
        popularPairs.forEach(pair => {
            const rate = this.getExchangeRate(pair.from, pair.to);
            const item = document.createElement('div');
            item.className = 'popular-item';
            item.innerHTML = `
                <div class="pair">${pair.from}/${pair.to}</div>
                <div class="rate">${rate}</div>
            `;
            item.addEventListener('click', () => {
                document.getElementById('fromCurrency').value = pair.from;
                document.getElementById('toCurrency').value = pair.to;
                this.updateFlag('fromFlag', pair.from);
                this.updateFlag('toFlag', pair.to);
                this.loadExchangeRates(pair.from);
            });
            popularGrid.appendChild(item);
        });
    }
    
    getExchangeRate(from, to) {
        if (!this.exchangeRates[from] || !this.exchangeRates[to]) return 'N/A';
        const rate = (this.exchangeRates[to] / this.exchangeRates[from]).toFixed(4);
        return rate;
    }
    
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    
    showLoading() {
        const rateInfo = document.getElementById('rateInfo');
        rateInfo.innerHTML = '<span class="loading">Loading exchange rates</span>';
    }
    
    showError(message) {
        const rateInfo = document.getElementById('rateInfo');
        rateInfo.innerHTML = `<span class="error">${message}</span>`;
    }
    
    startAutoRefresh() {
        // Refresh exchange rates every 5 minutes
        setInterval(() => {
            const fromCurrency = document.getElementById('fromCurrency').value;
            this.loadExchangeRates(fromCurrency);
        }, 300000);
    }
}

// Initialize the converter when page loads
document.addEventListener('DOMContentLoaded', () => {
    new CurrencyConverter();
});