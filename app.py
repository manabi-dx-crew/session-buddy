"""
Session Buddy - Main Application
第3回 AI Agent Hackathon with Google Cloud
"""

from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os

# 環境変数の読み込み
load_dotenv()

# Flask アプリケーションの初期化
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
CORS(app)

@app.route('/')
def index():
    """メインページ"""
    return render_template('index.html')

@app.route('/api/health')
def health_check():
    """ヘルスチェックエンドポイント"""
    return jsonify({
        'status': 'healthy',
        'app': 'Session Buddy',
        'version': '0.1.0'
    })

@app.route('/api/chat', methods=['POST'])
def chat():
    """チャットエンドポイント"""
    data = request.get_json()
    message = data.get('message', '')
    
    # TODO: Gemini APIとの連携実装
    response = {
        'response': f'受信しました: {message}',
        'status': 'success'
    }
    
    return jsonify(response)

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'True').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)
