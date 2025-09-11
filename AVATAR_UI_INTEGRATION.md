# Avatar UI Integration - AIチャットシステム

## 🎯 概要

`avatar-ui-core`（ターミナル風UI）と`Dify`（AIプラットフォーム）を統合した、Cloud Run上で動作するAIチャットシステムです。

## 🚀 クイックスタート

### アクセスURL
- **メイン**: https://avatar-ui-core-service-475598051239.asia-northeast1.run.app
- **エイリアス**: https://avatar-ui-core-service-v7qdibm4ra-an.a.run.app

### 使用方法
1. ブラウザで上記URLにアクセス
2. ターミナル風UIでメッセージを入力
3. AIが日本語で応答（タイプライター効果付き）

## 🏗️ アーキテクチャ

```
[ブラウザ] → [Cloud Run: avatar-ui-core-service] → [Cloud Run: dify-session-buddy] → [VM: Dify]
```

## 📁 プロジェクト構成

```
avatar-ui-integration/
├── app.py                    # Flaskアプリケーション（メイン）
├── settings.py               # 設定管理
├── start_app.py             # アプリケーション起動スクリプト
├── test_dify_direct.py      # Dify接続テスト
├── requirements.txt         # Python依存関係
├── Dockerfile              # Docker化設定
├── deploy-avatar-ui.sh     # Cloud Runデプロイスクリプト
├── static/                 # フロントエンドリソース
│   ├── css/style.css       # スタイルシート
│   ├── js/
│   │   ├── app.js          # メインアプリケーション
│   │   ├── chat.js         # チャット機能
│   │   ├── animation.js    # アニメーション
│   │   ├── sound.js        # 音響効果
│   │   └── settings.js     # 設定管理
│   └── images/             # アバター画像
└── templates/
    └── index.html          # メインページ
```

## 🔧 主要機能

### バックエンド（Flask）
- **Dual AI Provider**: GeminiとDifyの両方に対応
- **SSEストリーミング**: リアルタイム応答表示
- **API エンドポイント**:
  - `POST /api/chat`: 非ストリーミングチャット
  - `POST /api/chat/stream`: ストリーミングチャット

### フロントエンド（JavaScript）
- **ターミナル風UI**: コマンドライン風のインターフェース
- **タイプライター効果**: 文字が順次表示されるアニメーション
- **アバターアニメーション**: 話している時の口パクアニメーション
- **音響効果**: タイピング音の再生

## 🔑 Difyワークフロー設定

**使用ワークフロー**: `Session Buddy_v005`
- **APIキー**: `{DIFY_API_KEY}` (環境変数で設定)
- **注意**: 他のワークフローを使用する場合は、別途ワークフロー用のDify APIキーを発行する必要があります

## 🚀 デプロイ手順

### 1. ローカル開発環境
```bash
cd avatar-ui-integration
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 環境変数ファイルを作成
cp env.example .env
# .envファイルを編集してAPIキーを設定

python start_app.py
```

### 2. Cloud Runデプロイ
```bash
# 環境変数を設定
export DIFY_BASE_URL="https://dify-session-buddy-475598051239.asia-northeast1.run.app"
export DIFY_API_KEY="your-dify-api-key-here"

# デプロイ実行
./deploy-avatar-ui.sh
```

## ⚙️ 環境変数

| 変数名 | 説明 | デフォルト値 |
|--------|------|-------------|
| `AI_PROVIDER` | AIプロバイダー | `gemini` |
| `DIFY_BASE_URL` | DifyのベースURL | - |
| `DIFY_API_KEY` | DifyのAPIキー | - |
| `GEMINI_API_KEY` | GeminiのAPIキー | - |
| `MODEL_NAME` | 使用するGeminiモデル | `gemini-2.0-flash` |

## 🐛 トラブルシューティング

### よくある問題

1. **404エラー**: DifyのAPIエンドポイントが正しくない
   - 解決: `/v1/chat-messages`を使用

2. **JavaScriptエラー**: `text`が`undefined`
   - 解決: `animation.js`でエラーハンドリング追加済み

3. **AI初期化エラー**: 環境変数が設定されていない
   - 解決: `app.py`で自動初期化実装済み

### ログ確認
```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=avatar-ui-core-service"
```

## 📊 技術スタック

- **バックエンド**: Flask (Python 3.9)
- **フロントエンド**: Vanilla JavaScript, CSS3
- **AI統合**: Dify API (Session Buddy_v005ワークフロー)
- **デプロイ**: Google Cloud Run
- **コンテナ**: Docker
- **ストリーミング**: Server-Sent Events (SSE)

## 🔄 今後の拡張予定

1. **複数ワークフロー対応**: 異なるDifyワークフローの切り替え機能
2. **ユーザー認証**: ログイン機能の追加
3. **会話履歴**: チャット履歴の保存・表示
4. **ファイルアップロード**: 画像やドキュメントの処理
5. **音声入力**: 音声認識機能の追加

## 📝 メンテナンス

- **デプロイ更新**: `deploy-avatar-ui.sh`スクリプトを使用
- **設定変更**: 環境変数で`--set-env-vars`を使用
- **スケーリング**: Cloud Runの自動スケーリング設定済み

## 📞 サポート

問題が発生した場合は、以下の情報を含めて報告してください：
- エラーメッセージ
- ブラウザのコンソールログ
- Cloud Runのログ
- 使用したワークフロー名

---

**最終更新**: 2025年9月11日
**バージョン**: 1.0.0
**ステータス**: 本番稼働中 ✅
