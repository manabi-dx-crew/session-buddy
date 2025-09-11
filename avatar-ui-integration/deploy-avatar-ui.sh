#!/bin/bash
PROJECT_ID="session-buddy-hackathon3"
TAG=$(date +%Y%m%d-%H%M%S)
REGISTRY="asia-northeast1-docker.pkg.dev"
IMAGE_URI="${REGISTRY}/${PROJECT_ID}/dify-repo/avatar-ui-core:${TAG}"

# Dockerイメージをビルド
echo "Dockerイメージをビルド中..."
docker build --platform linux/amd64 -t "${IMAGE_URI}" .

# イメージをプッシュ
echo "イメージをプッシュ中..."
docker push "${IMAGE_URI}"

# Cloud Runにデプロイ
echo "Cloud Runにデプロイ中..."
gcloud run deploy avatar-ui-core-service \
  --image ${IMAGE_URI} \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --timeout=900s \
  --port 5000 \
  --cpu 1 \
  --memory 512Mi \
  --max-instances 10 \
  --set-env-vars="DIFY_BASE_URL=${DIFY_BASE_URL},DIFY_API_KEY=${DIFY_API_KEY},AI_PROVIDER=dify" \
  --project ${PROJECT_ID}

# URLを取得
echo "==================================="
echo "Avatar UI Core アクセス URL:"
gcloud run services describe avatar-ui-core-service \
  --platform managed \
  --region asia-northeast1 \
  --format 'value(status.url)'
echo "==================================="
