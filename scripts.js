let stockChart;

document.getElementById('get-analysis').addEventListener('click', async function () {
    const ticker = document.getElementById('stock-ticker').value.trim().toUpperCase();
    if (!ticker) return alert('Введите тикер акции!');

    // Показываем индикатор загрузки
    document.getElementById('results').style.display = 'none';
    document.getElementById('advice').style.display = 'none';
    document.getElementById('loading').style.display = 'block';

    try {
        const stockData = await getStockData(ticker);
        const stockNews = await getStockNews(ticker);

        // Показать результаты
        document.getElementById('results').style.display = 'block';
        document.getElementById('advice').style.display = 'block';

        document.getElementById('price').textContent = `Цена: $${stockData.price.toFixed(2)}`;
        document.getElementById('change').textContent = `Изменение: ${stockData.change}`;
        document.getElementById('news').textContent = `Новости: ${stockNews}`;

        updateChart(stockData.timeSeries);

        const adviceText = getAdvice(stockData, stockNews);
        document.getElementById('advice').querySelector('p').textContent = adviceText;

    } catch (error) {
        alert(`Ошибка: ${error.message}`);
    } finally {
        // Скрываем индикатор загрузки
        document.getElementById('loading').style.display = 'none';
    }
});

async function getStockData(ticker) {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?range=1d&interval=5m`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.chart.result) {
        throw new Error("Акция не найдена.");
    }

    const timeSeries = data.chart.result[0].timestamp;
    const prices = data.chart.result[0].indicators.quote[0].close;

    const latestPrice = prices[prices.length - 1];
    const previousPrice = prices[prices.length - 2];
    const change = ((latestPrice - previousPrice) / previousPrice * 100).toFixed(2) + '%';

    return {
        price: latestPrice,
        change,
        timeSeries: { time: timeSeries, prices }
    };
}

async function getStockNews(ticker) {
    const url = `https://newsapi.org/v2/everything?q=${ticker}&apiKey=68069bca283d4fb380e0a0a88e800e42`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.articles || data.articles.length === 0) {
        return "Нет свежих новостей.";
    }

    const articles = data.articles.slice(0, 3);
    return articles.map(article => article.title).join(', ');
}

function updateChart(stockData) {
    const times = stockData.time.map(time => new Date(time * 1000).toLocaleTimeString());
    const prices = stockData.prices;

    if (stockChart) stockChart.destroy();

    const ctx = document.getElementById('stock-chart').getContext('2d');
    stockChart = new Chart(ctx,
