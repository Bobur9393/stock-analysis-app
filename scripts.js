<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Stock Analysis</title>
</head>
<body>
    <h1>Stock Price and Analysis</h1>
    <div>
        <label for="stock-ticker">Введите тикер акции:</label>
        <input type="text" id="stock-ticker" placeholder="AAPL">
        <button id="get-analysis">Получить анализ</button>
    </div>
    <div>
        <p id="price">Цена: </p>
        <p id="change">Изменение: </p>
        <p id="news">Новости: </p>
        <div id="advice">
            <p>Рекомендации: </p>
        </div>
    </div>

    <script>
        // Слушаем нажатие кнопки
        document.getElementById('get-analysis').addEventListener('click', async function () {
            const ticker = document.getElementById('stock-ticker').value.trim();
            if (!ticker) return alert('Введите тикер акции!');

            // Получаем данные акции и новости
            const stockData = await getStockData(ticker);
            const stockNews = await getStockNews(ticker);

            // Отображаем информацию
            document.getElementById('price').textContent = `Цена: ${stockData.price}`;
            document.getElementById('change').textContent = `Изменение: ${stockData.change}`;
            document.getElementById('news').textContent = `Новости: ${stockNews}`;

            // Получаем прогноз
            const advice = getAdvice(stockData, stockNews);
            document.getElementById('advice').querySelector('p').textContent = advice;
        });

        // Функция для получения данных о стоимости акций
        async function getStockData(ticker) {
            const apiKey = 'YOUR_API_KEY'; // Вставь свой API-ключ от Alpha Vantage
            const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${ticker}&interval=5min&apikey=${apiKey}`;

            try {
                const response = await fetch(url);
                const data = await response.json();

                if (data['Time Series (5min)']) {
                    const latestData = data['Time Series (5min)'];
                    const latestTime = Object.keys(latestData)[0];
                    const price = latestData[latestTime]['4. close'];

                    return {
                        price: `$${price}`,
                        change: calculateChange(price)
                    };
                } else {
                    throw new Error('Ошибка получения данных о акции');
                }
            } catch (error) {
                console.error('Ошибка запроса:', error);
                return { price: 'Ошибка', change: 'Ошибка' };
