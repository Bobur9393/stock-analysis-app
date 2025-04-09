let stockChart;

// Слушаем нажатие кнопки "Получить анализ"
document.getElementById('get-analysis').addEventListener('click', async function () {
    const ticker = document.getElementById('stock-ticker').value.trim();
    if (!ticker) return alert('Введите тикер акции!');

    // Получаем данные акции и новости
    const stockData = await getStockData(ticker);
    const stockNews = await getStockNews(ticker);

    // Если возникла ошибка, выводим сообщение
    if (stockData.price === 'Ошибка') {
        alert('Не удалось получить данные по тикеру');
        return;
    }

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
    const apiKey = 'B2OKB1P8E89ERAL9'; // Ваш API-ключ от Alpha Vantage
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${ticker}&interval=5min&apikey=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data['Time Series (5min)']) {
            const latestData = data['Time Series (5min)'];
            const timeSeries = Object.keys(latestData).map(time => ({
                time: time,
                price: parseFloat(latestData[time]['4. close'])
            }));

            return {
                price: `$${timeSeries[timeSeries.length - 1].price}`,
                change: calculateChange(timeSeries[timeSeries.length - 1].price),
                timeSeries: timeSeries
            };
        } else {
            throw new Error('Ошибка получения данных о акции');
        }
    } catch (error) {
        console.error('Ошибка запроса:', error);
        return { price: 'Ошибка', change: 'Ошибка', timeSeries: [] };
    }
}

// Функция для расчета изменения цены
function calculateChange(price) {
    const firstPrice = 150; // Пример стартовой цены (можно сделать динамичной)
    const change = ((price - firstPrice) / firstPrice) * 100;
    return `${change.toFixed(2)}%`;
}

// Функция для получения новостей о компании
async function getStockNews(ticker) {
    return `Новости о компании ${ticker}...`;
}

// Функция для рекомендаций на основе данных о стоимости акции
function getAdvice(stockData, stockNews) {
    if (parseFloat(stockData.change) > 0) {
        return 'Рекомендуем покупать!';
    } else {
