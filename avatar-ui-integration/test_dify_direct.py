#!/usr/bin/env python3
"""
Avatar UIと同じ設定でDify APIを直接テスト
"""
import requests
import os

# Cloud Runと同じ環境変数を設定
DIFY_BASE_URL = os.getenv("DIFY_BASE_URL", "https://dify-session-buddy-475598051239.asia-northeast1.run.app")
DIFY_API_KEY = os.getenv("DIFY_API_KEY", "your-dify-api-key-here")

def test_dify_direct():
    """Dify APIを直接テスト"""
    try:
        payload = {
            "inputs": {},
            "query": "こんにちは、直接テストです",
            "response_mode": "blocking",
            "user": "avatar-ui-user"
        }
        headers = {
            "Authorization": f"Bearer {DIFY_API_KEY}",
            "Content-Type": "application/json"
        }
        
        print(f"🔗 リクエスト先: {DIFY_BASE_URL}/v1/chat-messages")
        print(f"🔑 APIキー: {DIFY_API_KEY[:15]}...")
        print(f"📨 ペイロード: {payload}")
        
        response = requests.post(
            f"{DIFY_BASE_URL.rstrip('/')}/v1/chat-messages",
            headers=headers,
            json=payload,
            timeout=30
        )
        
        print(f"📊 HTTPステータス: {response.status_code}")
        print(f"📋 レスポンスヘッダー: {dict(response.headers)}")
        print(f"📄 レスポンス内容: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ 成功: {data.get('answer', 'No answer field')}")
        else:
            print(f"❌ エラー: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"💥 例外発生: {str(e)}")

if __name__ == "__main__":
    test_dify_direct()
