# チャットアプリ API

チャットアプリケーションはセッションの持続性をサポートしており、以前のチャット履歴を応答のコンテキストとして使用できます。これは、チャットボットやカスタマーサービスAIなどに適用できます。

### ベース URL

```
http://localhost/v1
```

### 認証

サービスAPIは `API-Key` 認証を使用します。

***APIキーの漏洩を防ぐため、APIキーはクライアント側で共有または保存せず、サーバー側で保存することを強くお勧めします。***

すべてのAPIリクエストにおいて、以下のように `Authorization` HTTPヘッダーにAPIキーを含めてください：

```
Authorization: Bearer {API_KEY}
```

-----

## POST `/chat-messages`

**チャットメッセージを送信**

チャットアプリケーションにリクエストを送信します。

### リクエストボディ

| パラメータ | 型 | 説明 |
| :--- | :--- | :--- |
| `query` | string | **必須** ユーザー入力/質問内容 |
| `inputs` | object | アプリで定義されたさまざまな変数値の入力を許可します。`inputs`パラメータには複数のキー/値ペアが含まれ、各キーは特定の変数に対応し、各値はその変数の特定の値です。デフォルトは`{}` |
| `response_mode` | string | **必須** 応答の返却モードを指定します。サポートされているモード：\<br\>  - `streaming`: ストリーミングモード（推奨）、SSE（Server-Sent Events）を通じてタイプライターのような出力を実装します。\<br\>  - `blocking`: ブロッキングモード、実行完了後に結果を返します。（プロセスが長い場合、リクエストが中断される可能性があります）\<br\>  *注：エージェントアシスタントモードではブロッキングモードはサポートされていません* |
| `user` | string | **必須** ユーザー識別子、エンドユーザーのアイデンティティを定義するために使用されます。アプリケーション内で開発者によって一意に定義される必要があります。 |
| `conversation_id` | string | 会話ID、以前のチャット記録に基づいて会話を続けるには、前のメッセージの`conversation_id`を渡す必要があります。 |
| `files` | array[object] | ファイルリスト、モデルが Vision/Video 機能をサポートしている場合に限り、ファイルをテキスト理解および質問応答に組み合わせて入力するのに適しています。\<br\>  - `type` (string): サポートされるタイプ：`document`, `image`, `audio`, `video`, `custom`\<br\>  - `transfer_method` (string): 転送方法: `remote_url`, `local_file`\<br\>  - `url` (string): ファイルのURL。（転送方法が `remote_url` の場合のみ）。\<br\>  - `upload_file_id` (string): アップロードされたファイルID。（転送方法が `local_file` の場合のみ）。 |
| `auto_generate_name`| bool | タイトルを自動生成します。デフォルトは`true`です。\<br\>`false`に設定すると、会話のリネームAPIを呼び出し、`auto_generate`を`true`に設定することで非同期タイトル生成を実現できます。 |
| `workflow_id` | string | （オプション）ワークフローID、特定のバージョンを指定するために使用、提供されない場合はデフォルトの公開バージョンを使用。 |
| `trace_id` | string | （オプション）トレースID。既存の業務システムのトレースコンポーネントと連携し、エンドツーエンドの分散トレーシングを実現するために使用します。 |

### 応答

  - **`blocking` モードの場合**: `ChatCompletionResponse` オブジェクトを返します (`Content-Type: application/json`)。
  - **`streaming` モードの場合**: `ChunkChatCompletionResponse` ストリームを返します (`Content-Type: text/event-stream`)。

#### `ChatCompletionResponse`

| フィールド | 型 | 説明 |
| :--- | :--- | :--- |
| `event` | string | イベントタイプ、固定で `message` |
| `task_id` | string | タスクID |
| `id` | string | ユニークID |
| `message_id` | string | 一意のメッセージID |
| `conversation_id` | string | 会話ID |
| `mode` | string | アプリモード、`chat`として固定 |
| `answer` | string | 完全な応答内容 |
| `metadata` | object | メタデータ（`usage`, `retriever_resources`を含む） |
| `created_at` | int | メッセージ作成タイムスタンプ |

#### `ChunkChatCompletionResponse` (ストリーミング)

ストリーミングチャンクは `data:` で始まり、`\n\n` で区切られます。

**イベントの種類:**

  - `message`: テキストチャンク
  - `agent_message`: エージェントモードでのテキストチャンク
  - `tts_message`: TTSオーディオストリーム（base64）
  - `tts_message_end`: TTSオーディオストリーム終了
  - `agent_thought`: エージェントの思考プロセス
  - `message_file`: ツールによって作成された新しいファイル
  - `message_end`: ストリーミング終了
  - `message_replace`: モデレーションによるメッセージ置換
  - `error`: エラーイベント
  - `ping`: 接続維持のためのイベント

### エラーコード

  - `400`: `invalid_param`, `app_unavailable`, `provider_not_initialize`, `provider_quota_exceeded`, `model_currently_not_support`, etc.
  - `404`: 会話が存在しません
  - `500`: 内部サーバーエラー

### リクエスト例

```bash
curl -X POST 'http://localhost/v1/chat-messages' \
--header 'Authorization: Bearer {api_key}' \
--header 'Content-Type: application/json' \
--data-raw '{
  "inputs": {},
  "query": "What are the specs of the iPhone 13 Pro Max?",
  "response_mode": "streaming",
  "conversation_id": "",
  "user": "abc-123",
  "files": [
    {
      "type": "image",
      "transfer_method": "remote_url",
      "url": "https://cloud.dify.ai/logo/logo-site.png"
    }
  ]
}'
```

-----

## POST `/files/upload`

**ファイルアップロード**

メッセージ送信時に使用するファイルをアップロードします。

### リクエストボディ (`multipart/form-data`)

| パラメータ | 型 | 説明 |
| :--- | :--- | :--- |
| `file` | File | **必須** アップロードするファイル。 |
| `user` | string | **必須** ユーザー識別子。 |

### 応答

| フィールド | 型 | 説明 |
| :--- | :--- | :--- |
| `id` | uuid | ファイルID |
| `name` | string | ファイル名 |
| `size` | int | ファイルサイズ（バイト） |
| `extension` | string | ファイル拡張子 |
| `mime_type` | string | ファイルのMIMEタイプ |
| `created_by` | uuid | エンドユーザーID |
| `created_at` | timestamp | 作成タイムスタンプ |

### リクエスト例

```bash
curl -X POST 'http://localhost/v1/files/upload' \
--header 'Authorization: Bearer {api_key}' \
--form 'file=@localfile;type=image/[png|jpeg|jpg|webp|gif]' \
--form 'user=abc-123'
```

-----

## GET `/files/:file_id/preview`

**ファイルプレビュー**

アップロードされたファイルをプレビューまたはダウンロードします。

### パスパラメータ

  - `file_id` (string): **必須** プレビューするファイルのID。

### クエリパラメータ

  - `as_attachment` (boolean): `true`の場合、ファイルを添付ファイルとしてダウンロードします。デフォルトは`false`。

### リクエスト例

```bash
curl -X GET 'http://localhost/v1/files/{file_id}/preview' \
--header 'Authorization: Bearer {api_key}'
```

-----

## POST `/chat-messages/:task_id/stop`

**生成停止**

ストリーミングモードのメッセージ生成を停止します。

### パスパラメータ

  - `task_id` (string): **必須** 停止するタスクのID。

### リクエストボディ

| パラメータ | 型 | 説明 |
| :--- | :--- | :--- |
| `user` | string | **必須** ユーザー識別子。 |

### 応答

```json
{
  "result": "success"
}
```

-----

*その他、`メッセージフィードバック`、`会話履歴の取得`、`会話の削除`、`アプリケーション情報の取得`など、多数のAPIエンドポイントが同様の形式で続きます。*
