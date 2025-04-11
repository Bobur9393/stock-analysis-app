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

// Функция для получения данных о стоимости акций
async function getStockData(ticker) {
    const apiKey = 'YOUR_API_KEY';  // Замените на свой API-ключ от Alpha Vantage
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${ticker}&interval=5min&apikey=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    // Преобразуем данные для отображения
    const timeSeries = data['Time Series (5min)'];
    const latestTime = Object.keys(timeSeries)[0];
    const latestData = timeSeries[latestTime];

    const price = latestData['4. close'];
    const change = (parseFloat(latestData['4. close']) - parseFloat(timeSeries[Object.keys(timeSeries)[1]]['4. close'])).toFixed(2);

    return {
        price,
        change,
        timeSeries
    };
}

// Функция для получения новостей о компании
async function getStockNews(ticker) {
    const url = `https://newsapi.org/v2/everything?q=${ticker}&apiKey=YOUR_NEWSAPI_KEY`;  // Замените на свой API-ключ от NewsAPI
    const response = await fetch(url);
    const data = await response.json();

    // Получаем первые 3 новости
    const articles = data.articles.slice(0, 3);
    return articles.map(article => article.title).join(', ');
}

// Функция для обновления графика
function updateChart(timeSeries) {
    const times = Object.keys(timeSeries);
    const prices = times.map(time => timeSeries[time]['4. close']);

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
