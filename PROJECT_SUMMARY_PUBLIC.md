# Session Buddy プロジェクト作業詳細まとめ
## 第3回 AI Agent Hackathon with Google Cloud

### 📋 プロジェクト基本情報

| 項目 | 詳細 |
|------|------|
| **プロジェクト名** | Session Buddy |
| **GCPプロジェクトID** | `session-buddy-hackathon3` |
| **リージョン** | `asia-northeast1` |
| **ゾーン** | `asia-northeast1-c` |
| **作業期間** | 2025年9月5日〜9月9日（継続中） |
| **提出期限** | 2025年9月24日 |

### 🔐 認証・アカウント情報

```bash
# 認証済みアカウント
gcloud auth list
# ACTIVE: [YOUR_EMAIL]

# 現在のプロジェクト設定
gcloud config get-value project
# session-buddy-hackathon3

# デフォルトリージョン/ゾーン
gcloud config get-value compute/region  # asia-northeast1
gcloud config get-value compute/zone    # asia-northeast1-c
```

### 📁 ローカル環境構成

```bash
# WSL2 Ubuntu環境のディレクトリ構造
~/projects/hackathon3/
├── session-buddy/        # メインアプリケーション
│   ├── app.py
│   ├── requirements.txt
│   ├── templates/
│   ├── static/
│   └── src/
├── dify/                 # Difyリポジトリ（hackathon-3ブランチ）
└── dify-deploy/          # Cloud Run用プロキシ設定
    ├── Dockerfile
    ├── default.conf
    └── deploy-cloudrun.sh
```

### 🌐 稼働中のリソース

#### **1. Compute Engine VM（Dify用）**

```bash
# VMの詳細
名前: dify-session-buddy
マシンタイプ: e2-standard-2
ディスクサイズ: 30GB（拡張済み）
外部IP: [YOUR_EXTERNAL_IP]
タイプ: Spot VM（PREEMPTIBLE=true）
状態: RUNNING

# VMへのSSH接続
gcloud compute ssh dify-session-buddy --zone=asia-northeast1-c

# VM管理コマンド
gcloud compute instances start dify-session-buddy --zone=asia-northeast1-c
gcloud compute instances stop dify-session-buddy --zone=asia-northeast1-c
gcloud compute instances list --filter="name=dify-session-buddy"
```

#### **2. Cloud Run サービス**

```bash
# サービス詳細
サービス名: dify-session-buddy
リビジョン: dify-session-buddy-00003-mwc
HTTPS URL（メイン）: https://dify-session-buddy-[PROJECT_NUMBER].asia-northeast1.run.app
HTTPS URL（エイリアス）: https://dify-session-buddy-[RANDOM_ID].a.run.app
状態: 正常稼働中

# Cloud Run管理コマンド
gcloud run services list --region=asia-northeast1
gcloud run services describe dify-session-buddy --region=asia-northeast1
```

#### **3. Artifact Registry**

```bash
# リポジトリ詳細
リポジトリ名: dify-repo
ロケーション: asia-northeast1
フォーマット: Docker
URI: asia-northeast1-docker.pkg.dev/session-buddy-hackathon3/dify-repo

# Docker認証設定
gcloud auth configure-docker asia-northeast1-docker.pkg.dev
```

#### **4. ファイアウォールルール**

```bash
# 作成済みルール
allow-dify-http: tcp:80許可（0.0.0.0/0）
allow-dify-https: tcp:443許可（0.0.0.0/0）

# ルール確認
gcloud compute firewall-rules list --filter="name:allow-dify"
```

### 🐳 Difyコンテナ構成

VM内で稼働中のDockerコンテナ：

```bash
# Docker Compose設定場所
/app/dify/docker/

# 稼働中のコンテナ
- langgenius/dify-api:1.4.1 (api, worker)
- langgenius/dify-web:1.4.1
- langgenius/dify-plugin-daemon:0.1.1-local
- nginx:latest
- postgres:15-alpine
- redis:6-alpine
- semitechnologies/weaviate:1.19.0
- ubuntu/squid:latest
- langgenius/dify-sandbox:0.2.12

# コンテナ管理
cd /app/dify/docker
sudo docker-compose ps
sudo docker-compose logs -f
sudo docker-compose restart
```

### 🔧 Cloud Runプロキシ設定

現在の`default.conf`（nginx設定）：

```nginx
server {
    listen 0.0.0.0:8080;
    server_name _;
    client_max_body_size 100M;
    
    location / {
        proxy_pass http://[YOUR_EXTERNAL_IP];
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-Host $host;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
}
```

### 📝 デプロイ手順（Cloud Run更新時）

```bash
# 1. ディレクトリ移動
cd ~/projects/hackathon3/dify-deploy

# 2. 環境変数設定
PROJECT_ID="session-buddy-hackathon3"
TAG=$(date +%Y%m%d-%H%M%S)
IMAGE_URI="asia-northeast1-docker.pkg.dev/${PROJECT_ID}/dify-repo/dify-proxy:${TAG}"

# 3. Dockerイメージビルド
docker build --platform linux/amd64 -t "${IMAGE_URI}" .

# 4. Artifact Registryへプッシュ
docker push "${IMAGE_URI}"

# 5. Cloud Runへデプロイ
gcloud run deploy dify-session-buddy \
  --image ${IMAGE_URI} \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --timeout=900s \
  --port 8080 \
  --cpu 1 \
  --memory 512Mi \
  --max-instances 10 \
  --project ${PROJECT_ID}

# 6. URL確認
gcloud run services describe dify-session-buddy \
  --region asia-northeast1 \
  --format="value(status.url)"
```

### ⚠️ 重要な注意事項

#### **1. Spot VMの制限**
- 最大24時間で自動終了
- 再起動が必要：`gcloud compute instances start dify-session-buddy --zone=asia-northeast1-c`

#### **2. ディスク容量管理**
```bash
# VM内で定期的に確認
df -h
# /dev/sda1は30GBに拡張済み、約20GB空き

# 容量不足時のクリーンアップ
sudo docker system prune -a -f
sudo rm -rf /var/cache/apt/archives/*
```

#### **3. VPCコネクタ問題**
- VPCコネクタ（dify-connector）は作成試行したがERROR状態
- 現在は外部IP経由でプロキシ（動作に問題なし）

### 🔄 GitHub リポジトリ

```bash
# メインリポジトリ
https://github.com/manabi-dx-crew/session-buddy

# Difyリポジトリ（hackathon-3ブランチ）
https://github.com/manabi-dx-crew/dify

# クローン方法
git clone git@github.com:manabi-dx-crew/session-buddy.git
git clone -b hackathon-3 https://github.com/manabi-dx-crew/dify.git
```

### 📊 現在のシステム構成図

```
[エンドユーザー]
    ↓ HTTPS
[Cloud Run: dify-session-buddy]
  - URL: https://dify-session-buddy-[PROJECT_NUMBER].asia-northeast1.run.app
  - nginx リバースプロキシ（port 8080）
    ↓ HTTP
[Compute Engine VM: dify-session-buddy]
  - 外部IP: [YOUR_EXTERNAL_IP]
  - Dify Dockerコンテナ群（port 80）
```

### 🚀 次の作業者向けチェックリスト

```bash
# 1. 認証確認
gcloud auth list
gcloud config get-value project

# 2. VMステータス確認
gcloud compute instances list --filter="name=dify-session-buddy"

# 3. Cloud Runステータス確認
gcloud run services list --region=asia-northeast1

# 4. アクセステスト
curl https://dify-session-buddy-[PROJECT_NUMBER].asia-northeast1.run.app

# 5. VMが停止している場合
gcloud compute instances start dify-session-buddy --zone=asia-northeast1-c

# 6. ログ確認（問題がある場合）
gcloud compute ssh dify-session-buddy --zone=asia-northeast1-c
sudo docker-compose logs -f
```

### 💡 トラブルシューティング用コマンド

```bash
# Cloud Runログ確認
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=dify-session-buddy" \
  --limit=20 --format=json

# VM内のDocker状態確認
gcloud compute ssh dify-session-buddy --zone=asia-northeast1-c --command="sudo docker ps -a"

# ディスク容量確認
gcloud compute ssh dify-session-buddy --zone=asia-northeast1-c --command="df -h"

# メモリ使用状況確認
gcloud compute ssh dify-session-buddy --zone=asia-northeast1-c --command="free -h"
```

### 🔒 セキュリティ注意事項

このドキュメントは公開用バージョンです。実際の運用時は以下の情報を適切に設定してください：

- `[YOUR_EMAIL]` → 実際のGmailアドレス
- `[YOUR_EXTERNAL_IP]` → 実際の外部IPアドレス
- `[PROJECT_NUMBER]` → 実際のGCPプロジェクト番号
- `[RANDOM_ID]` → 実際のCloud RunエイリアスID

**機密情報を含む完全版は `PROJECT_SUMMARY.md` をご確認ください。**
