"""Webアプリケーション"""
from flask import Flask, render_template, request, jsonify, Response
import google.generativeai as genai
import requests
import json
import os
import settings

# グローバル変数を初期化
model = None
chat = None

def initialize_ai():
    """AIプロバイダーを初期化"""
    global model, chat
    
    if settings.AI_PROVIDER == 'gemini' and settings.GEMINI_API_KEY:
        # Gemini API接続
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel(
            model_name=settings.MODEL_NAME,
            system_instruction=settings.SYSTEM_INSTRUCTION
        )
        chat = model.start_chat()  # チャットセッション開始
        print("✅ Gemini初期化完了")
    elif settings.AI_PROVIDER == 'dify' and settings.DIFY_API_KEY and settings.DIFY_BASE_URL:
        # Dify連携の準備
        print("✅ Dify初期化完了")
    else:
        raise ValueError("AI_PROVIDERが正しく設定されていません。geminiまたはdifyを指定し、必要なAPIキーを設定してください。")

app = Flask(__name__)

@app.route('/')
def index():
    """メインページ表示"""
    config = {
        'typewriter_delay': settings.TYPEWRITER_DELAY_MS,
        'avatar_name': settings.AVATAR_NAME,
        'avatar_full_name': settings.AVATAR_FULL_NAME,
        'mouth_animation_interval': settings.MOUTH_ANIMATION_INTERVAL_MS,
        'beep_frequency': settings.BEEP_FREQUENCY_HZ,
        'beep_duration': settings.BEEP_DURATION_MS,
        'beep_volume': settings.BEEP_VOLUME,
        'beep_volume_end': settings.BEEP_VOLUME_END,
        'avatar_image_idle': settings.AVATAR_IMAGE_IDLE,
        'avatar_image_talk': settings.AVATAR_IMAGE_TALK
    }
    return render_template('index.html', config=config)

@app.route('/api/chat', methods=['POST'])
def api_chat():
    """ユーザー入力を受信しAI応答を返す（非ストリーミング）"""
    message = request.json['message']
    
    if settings.AI_PROVIDER == 'gemini':
        response = chat.send_message(message)
        return jsonify({'response': response.text})
    elif settings.AI_PROVIDER == 'dify':
        return _dify_chat_non_streaming(message)
    else:
        return jsonify({'error': 'AI_PROVIDERが正しく設定されていません'}), 400

@app.route('/api/chat/stream', methods=['POST'])
def api_chat_stream():
    """ユーザー入力を受信しAI応答をストリーミングで返す"""
    message = request.json['message']
    
    if settings.AI_PROVIDER == 'dify':
        return _dify_chat_streaming(message)
    else:
        return jsonify({'error': 'ストリーミングはDifyプロバイダーのみサポートしています'}), 400

def _dify_chat_non_streaming(message):
    """Difyとの非ストリーミングチャット"""
    try:
        payload = {
            "inputs": {},
            "query": message,
            "response_mode": "blocking",
            "user": "avatar-ui-user"  # 必須パラメータ
        }
        headers = {
            "Authorization": f"Bearer {settings.DIFY_API_KEY}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(
            f"{settings.DIFY_BASE_URL.rstrip('/')}/v1/chat-messages",
            headers=headers,
            json=payload,
            timeout=30
        )
        response.raise_for_status()
        
        data = response.json()
        return jsonify({'response': data.get('answer', '')})
        
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Dify API接続エラー: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'予期しないエラー: {str(e)}'}), 500

def _dify_chat_streaming(message):
    """Difyとのストリーミングチャット"""
    try:
        payload = {
            "inputs": {},
            "query": message,
            "response_mode": "streaming",
            "user": "avatar-ui-user"  # 必須パラメータ
        }
        headers = {
            "Authorization": f"Bearer {settings.DIFY_API_KEY}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(
            f"{settings.DIFY_BASE_URL.rstrip('/')}/v1/chat-messages",
            headers=headers,
            json=payload,
            stream=True,
            timeout=30
        )
        response.raise_for_status()
        
        def event_stream():
            for line in response.iter_lines():
                if not line:
                    continue
                
                # SSE形式のデータをパース
                if line.startswith(b'data: '):
                    data_str = line[6:].decode('utf-8')
                    if data_str.strip() == '[DONE]':
                        break
                    
                    try:
                        data = json.loads(data_str)
                        # Difyのストリーミングレスポンスからanswerを取得
                        answer = data.get('answer', '')
                        if answer:
                            yield f"data: {json.dumps({'delta': answer})}\n\n"
                    except json.JSONDecodeError:
                        continue
        
        return Response(
            event_stream(),
            mimetype='text/event-stream',
            headers={
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        )
        
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Dify API接続エラー: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'予期しないエラー: {str(e)}'}), 500

if __name__ == '__main__':
    # AI初期化を実行
    try:
        initialize_ai()
    except Exception as e:
        print(f"❌ AI初期化エラー: {e}")
        print("⚠️ 環境変数を確認してください")
    
    # Cloud Run対応: 環境変数からポートを取得
    port = int(os.environ.get('PORT', settings.SERVER_PORT))
    app.run(debug=settings.DEBUG_MODE, port=port, host='0.0.0.0')