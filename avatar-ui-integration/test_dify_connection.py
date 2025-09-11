#!/usr/bin/env python3
"""
Dify接続テストスクリプト
"""
import os
import requests
import json

# 環境変数から設定を読み込み
DIFY_BASE_URL = "https://dify-session-buddy-475598051239.asia-northeast1.run.app"
DIFY_API_KEY = input("DifyのAPIキーを入力してください: ").strip()

def test_dify_connection():
    """Difyとの接続をテスト"""
    print(f"🔍 Dify接続テスト開始...")
    print(f"📍 ベースURL: {DIFY_BASE_URL}")
    
    # 1. ヘルスチェック
    try:
        print("\n1️⃣ ヘルスチェック...")
        response = requests.get(f"{DIFY_BASE_URL}/health", timeout=10)
        print(f"   ステータス: {response.status_code}")
        if response.status_code == 200:
            print("   ✅ ヘルスチェック成功")
        else:
            print("   ⚠️ ヘルスチェック警告")
    except Exception as e:
        print(f"   ❌ ヘルスチェック失敗: {e}")
    
    # 2. API接続テスト
    try:
        print("\n2️⃣ API接続テスト...")
        payload = {
            "inputs": {},
            "query": "こんにちは、テストです",
            "response_mode": "blocking"
        }
        headers = {
            "Authorization": f"Bearer {DIFY_API_KEY}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(
            f"{DIFY_BASE_URL}/v1/chat-messages",
            headers=headers,
            json=payload,
            timeout=30
        )
        
        print(f"   ステータス: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("   ✅ API接続成功")
            print(f"   レスポンス: {data.get('answer', '')[:100]}...")
        else:
            print(f"   ❌ API接続失敗: {response.text}")
            
    except Exception as e:
        print(f"   ❌ API接続エラー: {e}")
    
    # 3. ストリーミングテスト
    try:
        print("\n3️⃣ ストリーミングテスト...")
        payload = {
            "inputs": {},
            "query": "短いテストメッセージをお願いします",
            "response_mode": "streaming"
        }
        headers = {
            "Authorization": f"Bearer {DIFY_API_KEY}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(
            f"{DIFY_BASE_URL}/v1/chat-messages",
            headers=headers,
            json=payload,
            stream=True,
            timeout=30
        )
        
        print(f"   ステータス: {response.status_code}")
        
        if response.status_code == 200:
            print("   ✅ ストリーミング接続成功")
            print("   ストリーミングデータ:")
            chunk_count = 0
            for line in response.iter_lines():
                if line and line.startswith(b'data: '):
                    data_str = line[6:].decode('utf-8')
                    if data_str.strip() == '[DONE]':
                        break
                    try:
                        data = json.loads(data_str)
                        answer = data.get('answer', '')
                        if answer:
                            print(f"     {answer}", end='', flush=True)
                            chunk_count += 1
                    except json.JSONDecodeError:
                        continue
            print(f"\n   📊 受信チャンク数: {chunk_count}")
        else:
            print(f"   ❌ ストリーミング接続失敗: {response.text}")
            
    except Exception as e:
        print(f"   ❌ ストリーミングエラー: {e}")

if __name__ == "__main__":
    test_dify_connection()
