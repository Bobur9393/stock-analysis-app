document.getElementById('get-analysis').addEventListener('click', async function () {
    const ticker = document.getElementById('stock-ticker').value.trim();
    if (!ticker) return alert('Введите тикер акции!');

    // Пример запроса к API для получения данных о стоимости акции
    const stockData = await getStockData(ticker);
    const stockNews = await getStockNews(ticker);

    // Отображение информации
    document.getElementById('price').textContent = `Цена: ${stockData.price}`;
    document.getElementById('change').textContent = `Изменение: ${stockData.change}`;
    document.getElementById('news').textContent = `Новости: ${stockNews}`;

    // Прогноз
    const advice = getAdvice(stockData, stockNews);
    document.getElementById('advice').querySelector('p').textContent = advice;
});

async function getStockData(ticker) {
    // Здесь ты можешь использовать API для получения актуальных данных о стоимости акции
    // Пример возвращаемых данных
    return {
        price: '$150.00',
        change: '+1.5%'
    };
}

async function getStockNews(ticker) {
    // Здесь ты можешь использовать API для получения новостей о компании
    // Пример возвращаемых данных
    return 'Новости о компании...';
}

function getAdvice(stockData, stockNews) {
    // Логика для рекомендаций на основе данных
    if (stockData.change > 0) {
        return 'Рекомендуем покупать!';
    } else {
        return 'Рекомендуем продавать!';
    }
}
// Функция для получения данных о стоимости акций
async function getStockData(ticker) {
    const apiKey = 'YOUR_API_KEY'; // B2OKB1P8E89ERAL9
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${ticker}&interval=5min&apikey=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data['Time Series (5min)']) {
            // Берем последние данные
            const latestData = data['Time Series (5min)'];
            const latestTime = Object.keys(latestData)[0];
            const price = latestData[latestTime]['4. close'];

            return {
                price: `$${price}`,
                change: calculateChange(price) // Функция для расчета изменения цены
            };
        } else {
            throw new Error('Ошибка получения данных о акции');
        }
    } catch (error) {
        console.error('Ошибка запроса:', error);
        return { price: 'Ошибка', change: 'Ошибка' };
    }
}

// Функция для расчета изменения цены
function calculateChange(price) {
    const firstPrice = 150; // Это пример стартовой цены (можно сделать динамичным)
    const change = ((price - firstPrice) / firstPrice) * 100;
    return `${change.toFixed(2)}%`;
}
