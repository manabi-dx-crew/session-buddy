# Session Buddy 🎓

## 第3回 AI Agent Hackathon with Google Cloud 提出作品

勉強会・セミナー・LT会を「心理的安全性の高い学びの場」に変革するAIエージェントシステム

### 🎯 コンセプト
日本の勉強会特有の「質問しづらい雰囲気」を打破し、参加者の本音を引き出すAIエージェント

### 📁 プロジェクト構成
```
session-buddy/
├── avatar-ui-integration/          # メインアプリケーション（カスタマイズ版）
│   ├── app.py                     # Flaskアプリケーション
│   ├── static/                    # フロントエンドリソース
│   └── templates/                 # HTMLテンプレート
├── vendor/avatar-ui-core/         # 元のavatar-ui-core（参照用）
├── docs/                          # ドキュメント
└── PROJECT_SUMMARY_PUBLIC.md      # プロジェクト概要
```


### 📚 関連リポジトリ
- [第2回提出作品 - Growth Buddy (アーカイブ済み)](https://github.com/manabi-dx-crew/growth-buddy)
- [共通Difyインフラ](https://github.com/manabi-dx-crew/dify/tree/hackathon-3)
- [UIコンポーネント](https://github.com/manabi-dx-crew/session-buddy-ui)
- [avatar-ui-core (元のリポジトリ)](https://github.com/sito-sikino/avatar-ui-core)

### 🔧 技術スタック
- **Backend**: Python 3.9+, Flask
- **AI**: Google Gemini API, Dify
- **Infrastructure**: Google Cloud (Vertex AI, Cloud Run)
- **UI**: avatar-ui-core (カスタマイズ版)
- **Database**: Google Sheets API

### 🚀 セットアップ方法

1. リポジトリをクローン
```bash
git clone https://github.com/manabi-dx-crew/session-buddy.git
cd session-buddy
```

2. Python仮想環境を作成
```py
python -m venv venv
source venv/bin/activate # Linux/Mac

または
venv\Scripts\activate # Windows
```


3. 依存パッケージをインストール
```bash
pip install -r requirements.txt
```

4. 環境変数を設定
```bash
cp .env.example .env
```

.envファイルを編集してAPIキーを設定


5. アプリケーションを起動

```py
python app.py
```


### 📖 ドキュメント
- [プロジェクト概要](./PROJECT_SUMMARY_PUBLIC.md) - プロジェクトの詳細情報
- [Avatar UI統合](./AVATAR_UI_INTEGRATION.md) - avatar-ui-core統合の詳細
- [Dify API ガイド](./docs/dify_api_guide.md) - Dify API使用方法
- [詳細ドキュメント](./docs/) - その他のドキュメント

### 📄 ライセンス
MIT License

