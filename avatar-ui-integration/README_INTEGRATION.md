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

## 🚨 重要なトラブル履歴

### **Dify 401エラー問題（2025年9月18日解決済み）**
- **症状**: Avatar UI → Dify連携時に401 Unauthorizedエラー
- **原因**: Cloud Run環境変数で`DIFY_BASE_URL`が設定されていない
- **解決**: 環境変数の完全設定（`DIFY_BASE_URL`と`DIFY_API_KEY`の両方）
- **詳細**: `../PROJECT_SUMMARY.md`の「Avatar UI APIキー問題解決作業」参照

### **Dify 500エラー問題（2025年9月17日解決済み）**
- **症状**: Avatar UI → Dify連携時に500 Internal Server Error
- **原因**: Difyデータベース内の重複レコード（`MultipleResultsFound`エラー）
- **解決**: データベース重複削除、テナント権限整理、サービス再起動
- **詳細**: `../PROJECT_SUMMARY.md`の「Avatar UI - Dify連携トラブル解決作業」参照

### **APIキー履歴**
| 期間 | ワークフロー | APIキー | 状態 |
|------|------------|---------|------|
| 2025/09/18〜 | Session Buddy_v009 | app-xxxxxxxx (最新) | ✅ 現在使用中 |
| 2025/09/17〜 | SessionBuddy_v2-002 | app-xxxxxxxx (v2-002) | ❌ 401エラーで切り替え |
| 2025/09/17 | Session Buddy_v007 | app-xxxxxxxx (v007) | 🔄 DB問題で切り替え |
| 〜2025/09/17 | Session Buddy_v005 | app-xxxxxxxx (v005) | ❌ 廃止 |

## 🔧 トラブルシューティング

### よくある問題と解決方法

#### 1. 401 Unauthorizedエラー
**症状**: チャット時に「エラーが発生しました。再試行してください。」が表示される

**原因**: 
- Cloud Run環境変数で`DIFY_BASE_URL`が設定されていない
- APIキーが無効または権限不足

**解決方法**:
```bash
# 環境変数の完全設定
gcloud run services update avatar-ui-core-service \
  --region asia-northeast1 \
  --update-env-vars="DIFY_BASE_URL=https://dify-session-buddy-475598051239.asia-northeast1.run.app,DIFY_API_KEY=your-api-key,AI_PROVIDER=dify"

# Dify API直接テスト
python test_dify_direct.py
```

#### 2. 500 Internal Server Error
**症状**: Dify APIから500エラーが返される

**原因**: Difyデータベース内の重複レコード

**解決方法**: 
- Dify VM内でデータベース重複レコードを削除
- サービス再起動
- 詳細は`../PROJECT_SUMMARY.md`の「Avatar UI - Dify連携トラブル解決作業」参照

#### 3. ストリーミングが動作しない
**症状**: タイプライター効果が表示されない

**解決方法**:
- `AI_PROVIDER=dify`が設定されているか確認
- ストリーミングはDifyプロバイダーのみサポート

### 診断コマンド

#### Cloud Run環境変数確認
```bash
gcloud run services describe avatar-ui-core-service \
  --region asia-northeast1 \
  --format="yaml" | grep -A5 -B5 DIFY
```

#### Dify API直接テスト
```bash
cd avatar-ui-integration
python test_dify_direct.py
```

#### Cloud Runログ確認
```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=avatar-ui-core-service" \
  --limit=20 --format=json
```

## 🚨 重要なトラブル履歴

### **チャット応答上書き問題（2025年9月18日解決済み）**
- **症状**: Dify APIの応答が表示された後、すぐに別の応答に上書きされる
- **原因**: UI内部システムの2つの処理がDifyの応答を上書き
  1. **ResponseOptimizer**: 応答を「最適化」して上書き
  2. **InitialPromptsManager**: 初回メッセージでフォローアップ上書き
- **解決**: 上書き処理を完全無効化、Dify API専用化
- **詳細**: `../PROJECT_SUMMARY.md`の「Avatar UI チャット応答上書き問題解決作業」参照

### **UI表示不整合問題（2025年9月18日解決済み）**
- **症状**: チャット画面で`SPECTRA`が表示されるが、画像は`idle_inu.png`
- **原因**: アバター切り替えの初期化タイミングの問題
- **解決**: ウェルカムスクリーン遷移時にアバター設定を実行
- **詳細**: `../PROJECT_SUMMARY.md`の「Avatar UI チャット応答上書き問題解決作業」参照

### **Dify 401エラー問題（2025年9月18日解決済み）**
- **症状**: Avatar UI → Dify連携時に401 Unauthorizedエラー
- **原因**: Cloud Run環境変数で`DIFY_BASE_URL`が設定されていない
- **解決**: 環境変数の完全設定（`DIFY_BASE_URL`と`DIFY_API_KEY`の両方）
- **詳細**: `../PROJECT_SUMMARY.md`の「Avatar UI APIキー問題解決作業」参照

### **Dify 500エラー問題（2025年9月17日解決済み）**
- **症状**: Avatar UI → Dify連携時に500 Internal Server Error
- **原因**: Difyデータベース内の重複レコード（`MultipleResultsFound`エラー）
- **解決**: データベース重複削除、テナント権限整理、サービス再起動
- **詳細**: `../PROJECT_SUMMARY.md`の「Avatar UI - Dify連携トラブル解決作業」参照

### **APIキー履歴**
| 期間 | ワークフロー | APIキー | 状態 |
|------|------------|---------|------|
| 2025/09/18〜 | Session Buddy_v009 | app-xxxxxxxx (最新) | ✅ 現在使用中 |
| 2025/09/17〜 | SessionBuddy_v2-002 | app-xxxxxxxx (v2-002) | ❌ 401エラーで切り替え |
| 2025/09/17 | Session Buddy_v007 | app-xxxxxxxx (v007) | 🔄 DB問題で切り替え |
| 〜2025/09/17 | Session Buddy_v005 | app-xxxxxxxx (v005) | ❌ 廃止 |

## 🔧 トラブルシューティング

### よくある問題と解決方法

#### 1. チャット応答が上書きされる
**症状**: Dify APIの応答が表示された後、すぐに別の応答に上書きされる

**原因**: 
- ResponseOptimizerによる応答最適化
- InitialPromptsManagerによるフォローアップ上書き

**解決方法**:
```javascript
// chat.js - 上書き処理を無効化
// ストリーミング完了後
// Dify APIの応答をそのまま使用（上書き処理を無効化）
console.log('Dify response received and displayed without modification');

// フォールバック処理
// Dify APIの応答をそのまま使用（最適化を無効化）
console.log('Dify fallback response received and displayed without modification');
```

#### 2. UI表示が不整合（SPECTRA + idle_inu.png）
**症状**: アバター名と画像が一致しない

**原因**: アバター切り替えの初期化タイミングの問題

**解決方法**:
```javascript
// welcome.js - アバター表示を正しく設定
setupAvatarDisplay() {
    const avatarImg = document.getElementById('avatar-img');
    const avatarLabel = document.querySelector('.avatar-label');
    
    if (avatarImg) {
        avatarImg.src = '/static/images/idle_inu.png';
        avatarImg.alt = 'INU BUDDY';
    }
    
    if (avatarLabel) {
        avatarLabel.textContent = 'INU BUDDY';
    }
}
```

#### 3. 401 Unauthorizedエラー
**症状**: チャット時に「エラーが発生しました。再試行してください。」が表示される

**原因**: 
- Cloud Run環境変数で`DIFY_BASE_URL`が設定されていない
- APIキーが無効または権限不足

**解決方法**:
```bash
# 環境変数の完全設定
gcloud run services update avatar-ui-core-service \
  --region asia-northeast1 \
  --update-env-vars="DIFY_BASE_URL=https://dify-session-buddy-475598051239.asia-northeast1.run.app,DIFY_API_KEY=your-api-key,AI_PROVIDER=dify"

# Dify API直接テスト
python test_dify_direct.py
```

#### 4. 500 Internal Server Error
**症状**: Dify APIから500エラーが返される

**原因**: Difyデータベース内の重複レコード

**解決方法**: 
- Dify VM内でデータベース重複レコードを削除
- サービス再起動
- 詳細は`../PROJECT_SUMMARY.md`の「Avatar UI - Dify連携トラブル解決作業」参照

#### 5. ストリーミングが動作しない
**症状**: タイプライター効果が表示されない

**解決方法**:
- `AI_PROVIDER=dify`が設定されているか確認
- ストリーミングはDifyプロバイダーのみサポート

### 診断コマンド

#### Cloud Run環境変数確認
```bash
gcloud run services describe avatar-ui-core-service \
  --region asia-northeast1 \
  --format="yaml" | grep -A5 -B5 DIFY
```

#### Dify API直接テスト
```bash
cd avatar-ui-integration
python test_dify_direct.py
```

#### Cloud Runログ確認
```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=avatar-ui-core-service" \
  --limit=20 --format=json
```

## 📝 注意事項

- APIキーは環境変数で管理
- ストリーミングはDifyプロバイダーのみサポート
- ローカルテスト時は`0.0.0.0`でバインドしてアクセス可能
- **重要**: 401エラーが発生した場合は、環境変数の設定を確認
- **重要**: 500エラーが発生した場合は、データベース重複レコードを疑う
- **重要**: チャット応答が上書きされる場合は、上書き処理の無効化を確認
