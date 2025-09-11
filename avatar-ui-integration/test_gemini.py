#!/usr/bin/env python3
"""
Gemini接続テストスクリプト
"""
import os
import google.generativeai as genai

def test_gemini_connection():
    """Geminiとの接続をテスト"""
    print("🔍 Gemini接続テスト開始...")
    
    # APIキーを入力
    api_key = input("GeminiのAPIキーを入力してください: ").strip()
    
    if not api_key:
        print("❌ APIキーが入力されていません")
        return
    
    try:
        # Gemini API接続
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(
            model_name="gemini-2.0-flash",
            system_instruction="あなたはSpectraというAIアシスタントです。技術的で直接的なスタイルで簡潔に応答してください。"
        )
        
        print("✅ Gemini API接続成功")
        
        # テストメッセージ
        response = model.generate_content("こんにちは、テストです。短く答えてください。")
        print(f"📝 レスポンス: {response.text}")
        
        print("🎉 Gemini接続テスト完了！")
        
    except Exception as e:
        print(f"❌ Gemini接続エラー: {e}")

if __name__ == "__main__":
    test_gemini_connection()
