# Session Buddy 🎓

## 第3回 AI Agent Hackathon with Google Cloud 提出作品

勉強会・セミナー・LT会を「心理的安全性の高い学びの場」に変革するAIエージェントシステム

### 🎯 コンセプト
日本の勉強会特有の「質問しづらい雰囲気」を打破し、参加者の本音を引き出すAIエージェント


### 📚 関連リポジトリ
- [第2回提出作品 - Growth Buddy (アーカイブ済み)](https://github.com/manabi-dx-crew/growth-buddy)
- [共通Difyインフラ](https://github.com/manabi-dx-crew/dify/tree/hackathon-3)
- [UIコンポーネント](https://github.com/manabi-dx-crew/session-buddy-ui)

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
詳細なドキュメントは[docs/](./docs)フォルダを参照してください。

### 📄 ライセンス
MIT License

