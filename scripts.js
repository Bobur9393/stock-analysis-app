const stockSymbol = 'AAPL';
const chart = document.getElementById('stockChart').getContext('2d');
let stockChart;
let firstPrice = null;

async function getStockData() {
    try {
        // Получаем данные с Yahoo Finance через наш сервер
        const response = await fetch(`http://localhost:3000/yahoo/${stockSymbol}`);
        const data = await response.json();

        if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
            throw new Error('Нет данных от Yahoo Finance.');
        }

        const timeSeries = data.chart.result[0].timestamp;
        const prices = data.chart.result[0].indicators.quote[0].close;

        if (!prices || prices.length === 0) throw new Error('Нет данных для отображения.');

        const times = timeSeries.map(timestamp => new Date(timestamp * 1000).toLocaleTimeString());
        const latestPrice = prices[prices.length - 1];
        if (!firstPrice) firstPrice = prices[0];

        const change = latestPrice - firstPrice;
        const changePercent = ((change / firstPrice) * 100).toFixed(2);

        document.getElementById('stockPrice').textContent = `Цена: $${latestPrice.toFixed(2)}`;
        document.getElementById('stockChange').textContent = `Изменение: ${change >= 0 ? '+' : ''}${change.toFixed(2)} (${changePercent}%)`;
        document.getElementById('stockChange').style.color = change >= 0 ? 'green' : 'red';

        updateChart(times, prices);
        generateAdvice(changePercent);
        fetchNews();
        checkHalalStatus(stockSymbol);

    } catch (error) {
        console.error('Ошибка при получении данных:', error.message);
        document.getElementById('stockPrice').textContent = 'Ошибка загрузки данных';
        document.getElementById('stockChange').textContent = '';
        document.getElementById('advice').textContent = '';
        document.getElementById('news').innerHTML = '';
        document.getElementById('halal').textContent = '';
    }
}

function updateChart(times, prices) {
    if (stockChart) stockChart.destroy();
    stockChart = new Chart(chart, {
        type: 'line',
        data: {
            labels: times,
            datasets: [{
                label: `${stockSymbol} Цена`,
                data: prices,
                borderColor: '#28a745',
                backgroundColor: 'rgba(40,167,69,0.1)',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: { display: false },
                y: { beginAtZero: false }
            }
        }
    });
}

function generateAdvice(changePercent) {
    const num = parseFloat(changePercent);
    let advice;
    if (num > 2) advice = 'Акция растёт — рассмотрите фиксацию прибыли.';
    else if (num < -2) advice = 'Акция падает — возможен сигнал к покупке.';
    else advice = 'Изменения незначительны — наблюдайте за рынком.';
    document.getElementById('advice').textContent = `Совет: ${advice}`;
}

async function fetchNews() {
    try {
        const response = await fetch(`https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${stockSymbol}&apikey=demo`);
        const data = await response.json();

        if (!data.feed || !Array.isArray(data.feed)) throw new Error('Нет новостей');

        const newsHTML = data.feed.slice(0, 3).map(article => `
            <p><a href="${article.url}" target="_blank">${article.title}</a></p>
        `).join('');
        document.getElementById('news').innerHTML = newsHTML;
    } catch (error) {
        document.getElementById('news').innerHTML = '<p>Не удалось загрузить новости.</p>';
        console.error('Ошибка загрузки новостей:', error.message);
    }
}

function checkHalalStatus(symbol) {
    // Простейшая заглушка для халяльных акций
    const haramList = ['BAC', 'KO', 'PEP', 'LVS'];
    const halal = !haramList.includes(symbol.toUpperCase());
    document.getElementById('halal').textContent = halal ? 'Халяльная акция ✅' : 'Харамная акция ❌';
    document.getElementById('halal').style.color = halal ? 'green' : 'red';
}

getStockData();
setInterval(getStockData, 60 * 1000);
