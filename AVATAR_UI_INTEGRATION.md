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

**現在のワークフロー**: `SessionBuddy_v2-002` ⭐️ **最新**
- **APIキー**: `app-xxxxxxxxxxxxxxxxxxxxxxxx` (環境変数で設定)
- **更新日**: 2025年9月17日
- **状態**: 本番稼働中 ✅

### 過去のワークフロー履歴
| ワークフロー名 | APIキー | 使用期間 | 状態 |
|---------------|---------|----------|------|
| `SessionBuddy_v2-002` | `app-xxxxxxxx (最新)` | 2025/09/17〜 | ✅ 現在使用中 |
| `Session Buddy_v007` | `app-xxxxxxxx (v007)` | 2025/09/17 | 🔄 データベース問題で切り替え |
| `Session Buddy_v005` | `app-xxxxxxxx (v005)` | 〜2025/09/17 | ❌ 廃止 |

**注意**: 他のワークフローを使用する場合は、別途ワークフロー用のDify APIキーを発行する必要があります

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

### 2025年9月17日解決済み問題（重要！）

#### **問題1: Dify 500エラー（MultipleResultsFound）**
- **症状**: Avatar UI → Dify連携時に500 Internal Server Error
- **原因**: Difyデータベース内の重複レコード（データ復旧作業の影響）
- **解決**: 
  1. `end_users`テーブルの重複`session_id`削除
  2. `tenant_account_joins`テーブルの複数owner削除（1つのテナントに6人のownerが存在）
  3. 古いワークフローとapp_model_config削除・再作成
- **結果**: HTTP 200正常応答、日本語応答確認済み

#### **問題2: APIキー変更時の動作確認**
- **症状**: 新しいAPIキー適用後の動作不明
- **解決**: 
  1. Dify API直接テスト（`curl`）でHTTP 200確認
  2. Cloud Run環境変数更新（`gcloud run services update`）
  3. Avatar UI経由テストで完全動作確認
- **教訓**: APIキー変更時は段階的テストが重要

### よくある問題（一般的）

1. **404エラー**: DifyのAPIエンドポイントが正しくない
   - 解決: `/v1/chat-messages`を使用

2. **JavaScriptエラー**: `text`が`undefined`
   - 解決: `animation.js`でエラーハンドリング追加済み

3. **AI初期化エラー**: 環境変数が設定されていない
   - 解決: `app.py`で自動初期化実装済み

4. **Dify 500エラー**: データベース整合性問題
   - 解決: VM内でPostgreSQLクエリによる重複レコード削除
   - 詳細: `PROJECT_SUMMARY.md`の「完全データ復旧作業」参照

### 診断コマンド集

#### Cloud Runログ確認
```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=avatar-ui-core-service"
```

#### Dify API直接テスト
```bash
curl -X POST "https://dify-session-buddy-475598051239.asia-northeast1.run.app/v1/chat-messages" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"inputs": {}, "query": "テスト", "response_mode": "blocking", "user": "test-user"}'
```

#### Difyデータベース確認（VM内）
```bash
gcloud compute ssh dify-production --zone=asia-northeast1-c
sudo docker-compose exec db psql -U postgres -d dify -c "SELECT COUNT(*) FROM tenant_account_joins WHERE role = 'owner';"
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

**最終更新**: 2025年9月17日
**バージョン**: 1.1.0
**ステータス**: 本番稼働中 ✅
**現在のワークフロー**: SessionBuddy_v2-002
**重要**: Dify 500エラー問題解決済み（データベース重複削除完了）
