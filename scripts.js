let stockChart;

// Слушаем нажатие кнопки "Получить анализ"
document.getElementById('get-analysis').addEventListener('click', async function () {
    const ticker = document.getElementById('stock-ticker').value.trim();
    if (!ticker) return alert('Введите тикер акции!');

    // Получаем данные акции и новости
    const stockData = await getStockData(ticker);
    const stockNews = await getStockNews(ticker);

    // Отображаем информацию на странице
    document.getElementById('price').textContent = `Цена: ${stockData.price}`;
    document.getElementById('change').textContent = `Изменение: ${stockData.change}`;
    document.getElementById('news').textContent = `Новости: ${stockNews}`;

    // Обновляем график
    updateChart(stockData.timeSeries);

    // Получаем прогноз (совет по акции)
    const advice = getAdvice(stockData, stockNews);
    document.getElementById('advice').querySelector('p').textContent = advice;
});

// Функция для получения данных о стоимости акций с Yahoo Finance API
async function getStockData(ticker) {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?range=1d&interval=5m`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.chart.result === undefined) {
        throw new Error("Акция не найдена");
    }

    // Преобразуем данные для отображения
    const timeSeries = data.chart.result[0].timestamp;
    const prices = data.chart.result[0].indicators.quote[0].close;

    const latestPrice = prices[prices.length - 1];
    const previousPrice = prices[prices.length - 2];
    const change = (latestPrice - previousPrice).toFixed(2);

    return {
        price: latestPrice,
        change,
        timeSeries: { time: timeSeries, prices }
    };
}

// Функция для получения новостей о компании
async function getStockNews(ticker) {
    const url = `https://newsapi.org/v2/everything?q=${ticker}&apiKey=68069bca283d4fb380e0a0a88e800e42`;  // Используем твой API-ключ
    const response = await fetch(url);
    const data = await response.json();

    // Получаем первые 3 новости
    const articles = data.articles.slice(0, 3);
    return articles.map(article => article.title).join(', ');
}

// Функция для обновления графика
function updateChart(stockData) {
    const times = stockData.time.map(time => new Date(time * 1000).toLocaleTimeString());
    const prices = stockData.prices;

    if (stockChart) {
        stockChart.destroy();  // Удаляем старый график
    }

    const ctx = document.getElementById('stock-chart').getContext('2d');
    stockChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: times,
            datasets: [{
                label: 'Цена акций',
                data: prices,
                borderColor: '#4CAF50',
                borderWidth: 2,
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'category',
                    labels: times,
                    title: {
                        display: true,
                        text: 'Время'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Цена'
                    }
                }
            }
        }
    });
}

// Функция для получения совета по акции
function getAdvice(stockData, stockNews) {
    const change = parseFloat(stockData.change);
    let advice = 'Рекомендации: ';

    if (change > 0) {
        advice += 'Акция в росте, можно рассмотреть покупку!';
    } else if (change < 0) {
        advice += 'Акция падает, рекомендуется подождать!';
    } else {
        advice += 'Акция стабильно держится, продолжайте наблюдать!';
    }

    return advice;
}
