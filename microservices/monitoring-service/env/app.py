from flask import Flask
from prometheus_flask_exporter import PrometheusMetrics
from flask import request
from datetime import datetime


app = Flask(__name__)
metrics = PrometheusMetrics(app)

@app.route('/')
def main_route():
    return 'Monitoring Service is Up and Running!'

@app.route('/log', methods=['POST'])
def log():
    data = request.get_json()
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")
    duration_ms = data['duration']
    error_message = data.get('error')
    print(f'Time: {current_time[:-3]}')
    print(f'Duration: {duration_ms} ms')
    if error_message:
        print(f'Error: {error_message}')
    else:
        print(f'Error: {data}')
    return '', 204

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
