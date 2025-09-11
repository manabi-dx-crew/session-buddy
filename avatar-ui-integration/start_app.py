#!/usr/bin/env python3
"""
Avatar UI Integration アプリケーション起動スクリプト
"""
import os
import sys

def setup_environment():
    """環境変数を設定"""
    print("🔧 環境設定中...")
    
    # デフォルト設定
    os.environ.setdefault('SERVER_PORT', '5000')
    os.environ.setdefault('DEBUG_MODE', 'True')
    os.environ.setdefault('AVATAR_NAME', 'Spectra')
    os.environ.setdefault('AVATAR_FULL_NAME', 'Spectra Communicator')
    os.environ.setdefault('AVATAR_IMAGE_IDLE', 'idle.png')
    os.environ.setdefault('AVATAR_IMAGE_TALK', 'talk.png')
    os.environ.setdefault('SYSTEM_INSTRUCTION', 'あなたはSpectraというAIアシスタントです。技術的で直接的なスタイルで簡潔に応答してください。')
    os.environ.setdefault('TYPEWRITER_DELAY_MS', '30')
    os.environ.setdefault('MOUTH_ANIMATION_INTERVAL_MS', '100')
    os.environ.setdefault('BEEP_FREQUENCY_HZ', '600')
    os.environ.setdefault('BEEP_DURATION_MS', '30')
    os.environ.setdefault('BEEP_VOLUME', '0.1')
    os.environ.setdefault('BEEP_VOLUME_END', '0.01')
    
    # AIプロバイダー選択
    print("\n🤖 AIプロバイダーを選択してください:")
    print("1. Gemini (Google AI)")
    print("2. Dify")
    
    choice = input("選択 (1 or 2): ").strip()
    
    if choice == "1":
        # Gemini設定
        os.environ['AI_PROVIDER'] = 'gemini'
        api_key = input("GeminiのAPIキーを入力してください: ").strip()
        if not api_key:
            print("❌ APIキーが入力されていません")
            sys.exit(1)
        os.environ['GEMINI_API_KEY'] = api_key
        os.environ['MODEL_NAME'] = 'gemini-2.0-flash'
        print("✅ Gemini設定完了")
        
    elif choice == "2":
        # Dify設定
        os.environ['AI_PROVIDER'] = 'dify'
        # Cloud Run経由でDifyにアクセス
        os.environ['DIFY_BASE_URL'] = 'https://dify-session-buddy-475598051239.asia-northeast1.run.app'
        api_key = input("DifyのAPIキーを入力してください: ").strip()
        if not api_key:
            print("❌ APIキーが入力されていません")
            sys.exit(1)
        os.environ['DIFY_API_KEY'] = api_key
        print("✅ Dify設定完了")
        
    else:
        print("❌ 無効な選択です")
        sys.exit(1)

def main():
    """メイン関数"""
    print("🚀 Avatar UI Integration 起動中...")
    
    try:
        setup_environment()
        
        print(f"\n🌐 サーバー起動中...")
        print(f"📍 URL: http://localhost:{os.environ.get('SERVER_PORT', '5000')}")
        print(f"🤖 AIプロバイダー: {os.environ.get('AI_PROVIDER', 'gemini')}")
        print("\n✨ ブラウザでアクセスしてください！")
        print("🛑 停止するには Ctrl+C を押してください\n")
        
        # 環境変数を再読み込みしてからアプリケーション起動
        import importlib
        import settings
        importlib.reload(settings)
        
        from app import app, initialize_ai
        initialize_ai()  # AI初期化
        
        app.run(
            debug=os.environ.get('DEBUG_MODE', 'True').lower() == 'true',
            port=int(os.environ.get('SERVER_PORT', '5000')),
            host='0.0.0.0'
        )
        
    except KeyboardInterrupt:
        print("\n👋 アプリケーションを停止しました")
    except Exception as e:
        print(f"❌ エラーが発生しました: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
