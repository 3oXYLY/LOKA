from flask import Flask, request, jsonify
from flask_cors import CORS # للسماح للمتصفح بالتواصل مع بايثون

app = Flask(__name__)
CORS(app)

@app.route('/get_size', methods=['POST'])
def calculate_size():
    data = request.get_json()
    height = float(data.get('height'))
    weight = float(data.get('weight'))

    # خوارزمية تحديد المقاس (Size Engine)
    if height < 160 and weight < 55:
        suggested_size = "S"
    elif height <= 175 and weight <= 75:
        suggested_size = "M"
    elif height <= 185 and weight <= 90:
        suggested_size = "L"
    else:
        suggested_size = "XL"

    return jsonify({
        "status": "success",
        "size": suggested_size,
        "bmi": round(weight / ((height/100)**2), 2) # حساب مؤشر كتلة الجسم كإضافة ذكية
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)