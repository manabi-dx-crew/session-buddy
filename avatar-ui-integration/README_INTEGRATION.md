# Avatar UI Integration with Dify

Session Buddyプロジェクト用のAvatar UI統合版です。DifyとGeminiの両方に対応しています。

## 🚀 クイックスタート

### 1. 依存関係のインストール

```bash
cd avatar-ui-integration
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. アプリケーション起動

```bash
python start_app.py
```

起動時にAIプロバイダー（Gemini または Dify）を選択できます。

## 🔧 設定

### Gemini使用時
- Google AI Studio APIキーが必要
- モデル: gemini-2.0-flash

### Dify使用時
- **現在のワークフロー**: SessionBuddy_v2-002 ⭐️
- **現在のAPIキー**: app-xxxxxxxxxxxxxxxxxxxxxxxx (環境変数で設定)
- **ベースURL**: https://dify-session-buddy-475598051239.asia-northeast1.run.app
- **最終更新**: 2025年9月17日

## 📁 ファイル構成

```
avatar-ui-integration/
├── app.py                    # メインアプリケーション
├── settings.py               # 設定管理
├── start_app.py             # 起動スクリプト
├── test_dify_connection.py  # Dify接続テスト
├── test_gemini.py           # Gemini接続テスト
├── requirements.txt         # 依存関係
├── static/                  # 静的ファイル
│   ├── css/
│   ├── js/
│   └── images/
└── templates/               # HTMLテンプレート
    └── index.html
```

## 🌟 新機能

### ストリーミング対応
- DifyのSSEストリーミングに対応
- リアルタイムでタイプライター効果とアバターアニメーション

### デュアルプロバイダー対応
- GeminiとDifyの両方に対応
- 起動時に選択可能

### エラーハンドリング
- ストリーミング失敗時のフォールバック
- 詳細なエラーメッセージ

## 🧪 テスト

### Gemini接続テスト
```bash
python test_gemini.py
```

### Dify接続テスト
```bash
python test_dify_connection.py
```

## 🔗 API エンドポイント

- `GET /` - メインページ
- `POST /api/chat` - 非ストリーミングチャット
- `POST /api/chat/stream` - ストリーミングチャット（Difyのみ）

## 🎨 UI機能

- ターミナル風UI
- アバターアニメーション
- タイプライター効果
- タイピング音
- リアルタイムストリーミング表示

## 🚀 デプロイ

Cloud Runへのデプロイは、既存のdify-deployディレクトリの手順を参考にしてください。

## 🚨 重要なトラブル履歴（2025年9月17日解決済み）

### **Dify 500エラー問題**
- **症状**: Avatar UI → Dify連携時に500 Internal Server Error
- **原因**: Difyデータベース内の重複レコード（`MultipleResultsFound`エラー）
- **解決**: データベース重複削除、テナント権限整理、サービス再起動
- **詳細**: `../PROJECT_SUMMARY.md`の「Avatar UI - Dify連携トラブル解決作業」参照

### **APIキー履歴**
| 期間 | ワークフロー | APIキー | 状態 |
|------|------------|---------|------|
| 2025/09/17〜 | SessionBuddy_v2-002 | app-xxxxxxxx (最新) | ✅ 現在使用中 |
| 2025/09/17 | Session Buddy_v007 | app-xxxxxxxx (v007) | 🔄 DB問題で切り替え |
| 〜2025/09/17 | Session Buddy_v005 | app-xxxxxxxx (v005) | ❌ 廃止 |

## 📝 注意事項

- APIキーは環境変数で管理
- ストリーミングはDifyプロバイダーのみサポート
- ローカルテスト時は`0.0.0.0`でバインドしてアクセス可能
- **重要**: Dify 500エラーが発生した場合は、データベース重複レコードを疑う
