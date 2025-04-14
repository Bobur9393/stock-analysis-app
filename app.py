from flask import Flask, request, jsonify
import yfinance as yf
import openai
import os

app = Flask(__name__)

openai.api_key = os.environ.get("OPENAI_API_KEY")  # Задай переменную окружения или вставь вручную

@app.route("/analyze", methods=["POST"])
def analyze():
    ticker = request.json.get("ticker", "").upper()
    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(period="5d")
        if hist.empty:
            return jsonify({"error": "Нет данных для этого тикера."}), 404

        hist.reset_index(inplace=True)
        hist_data = hist[["Date", "Open", "High", "Low", "Close", "Volume"]]
        hist_data["Date"] = hist_data["Date"].dt.strftime("%Y-%m-%d")
        rows = hist_data.to_dict(orient="records")

        info = stock.info
        sector = info.get("sector", "unknown").lower()
        haram_keywords = ["bank", "casino", "alcohol", "gambling", "weapon", "tobacco"]
        halal = not any(haram in sector for haram in haram_keywords)

        news = stock.news[:5] if hasattr(stock, "news") else []
        news_list = [{"title": n.get("title"), "link": n.get("link"), "publisher": n.get("publisher")} for n in news]

        return jsonify({
            "data": rows,
            "halal": halal,
            "reason": f"Сектор '{sector}' {'не содержит харам' if halal else 'может быть харам'}.",
            "news": news_list
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/chat", methods=["POST"])
def chat():
    msg = request.json.get("message")
    if not msg:
        return jsonify({"error": "Сообщение не передано"}), 400

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": msg}]
        )
        reply = response.choices[0].message.content
        return jsonify({"reply": reply})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/")
def home():
    return "🚀 Сервер работает! Используй /analyze или /chat"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
