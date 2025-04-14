document.getElementById('analyzeBtn').addEventListener('click', () => {
  const ticker = document.getElementById('tickerInput').value;
  document.getElementById('stockResult').innerText = `Данные по ${ticker} будут здесь.`;
});

document.getElementById('sendBtn').addEventListener('click', () => {
  const msg = document.getElementById('userMessage').value;
  document.getElementById('chatWindow').innerHTML += `<p><strong>Вы:</strong> ${msg}</p>`;
});

document.getElementById('halalBtn').addEventListener('click', () => {
  const ticker = document.getElementById('halalInput').value;
  document.getElementById('halalResult').innerText = `Халяльность ${ticker} будет проверена здесь.`;
});
