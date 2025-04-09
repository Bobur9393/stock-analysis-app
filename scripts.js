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

    // Получаем прогноз (совет по акции)
    const advice = getAdvice(stockData, stockNews);
    document.getElementById('advice').querySelector('p').textContent = advice;
});

// Функция для получения данных о стоимости акций
async function getStockData(ticker) {
    const apiKey = 'B2OKB1P8E89ERAL9'; // Ваш API-ключ от Alpha Vantage
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRAD
let stockChart;

async function updateChart(data) {
    const labels = data.map(item => item.time);
    const prices = data.map(item => item.price);

    if (stockChart) {
        stockChart.destroy(); // Удаляем старый график перед созданием нового
    }

    const ctx = document.getElementById('stock-chart').getContext('2d');
    stockChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Цена акции',
                data: prices,
                borderColor: '#4CAF50',
                fill: false,
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Время'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Цена'
                    },
                    beginAtZero: false
                }
            }
        }
    });
}
