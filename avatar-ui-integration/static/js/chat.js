/**
 * チャット機能モジュール
 * メッセージの送受信とUI更新を管理
 */
// ResponseOptimizerを無効化（Dify APIのみ使用）
// import { ResponseOptimizer } from './response-optimizer.js';

export class ChatManager {
    constructor(settings, animationManager) {
        this.settings = settings;
        this.animationManager = animationManager;
        this.output = document.getElementById('output');
        this.input = document.getElementById('input');
        // ResponseOptimizerを無効化（Dify APIのみ使用）
        // this.responseOptimizer = new ResponseOptimizer();
        this.isFirstMessage = true; // 初回メッセージフラグ
        
        this.initEventListeners();
    }

    // アバター切り替え時の更新
    updateAvatar(avatarName) {
        this.settings.updateAvatarName(avatarName);
        console.log(`ChatManager: Avatar name updated to ${avatarName}`);
    }

    // イベントリスナー初期化
    initEventListeners() {
        this.input.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter' && this.input.value.trim()) {
                const message = this.input.value.trim();
                // 入力欄を即座にクリア
                this.input.value = '';
                // 入力欄を無効化
                this.input.disabled = true;
                this.input.placeholder = '応答中...';
                
                await this.sendMessage(message);
            }
        });
    }

    // メッセージ送信
    async sendMessage(message) {
        // ユーザーメッセージを表示
        this.addLine(message, 'user');
        
        // 「思考中...」表示を追加
        this.showThinkingIndicator();
        
        try {
            // ストリーミング対応のAIレスポンスを取得
            await this.sendMessageStreaming(message);
        } catch (error) {
            console.error('Chat error:', error);
            this.addLine('エラーが発生しました。再試行してください。', 'system');
        } finally {
            // 入力欄を再有効化
            this.input.disabled = false;
            this.input.placeholder = '';
            this.input.focus();
        }
    }

    // ストリーミング対応のメッセージ送信
    async sendMessageStreaming(message) {
        try {
            // ストリーミングエンドポイントに送信
            const response = await fetch('/api/chat/stream', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({message})
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // 「思考中...」表示を削除
            this.removeThinkingIndicator();
            
            // AIメッセージ行を準備（最初のテキストが来るまで表示しない）
            let aiLine = null;
            let aiTextElement = null;
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let fullResponse = ''; // 完全な応答を蓄積
            
            // ストリーミング完了フラグ
            let isStreamingComplete = false;
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    // ストリームが予期せず終了した場合のフォールバック
                    isStreamingComplete = true;
                    break;
                }
                
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop(); // 最後の不完全な行を保持
                
                let shouldBreakWhile = false;
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            
                            // テキストデータの処理
                            if (data.delta) {
                                // 最初のテキストが来たときにAI行を作成
                                if (!aiLine) {
                                    console.log('Creating AI line for first chunk:', data.delta);
                                    
                                    aiLine = document.createElement('div');
                                    aiLine.className = 'line ai';
                                    aiLine.innerHTML = `<span class="ai-prompt">${this.settings.avatarName}&gt;</span> <span class="ai-text"></span>`;
                                    this.output.appendChild(aiLine);
                                    
                                    // DOM要素を即座に取得
                                    aiTextElement = aiLine.querySelector('.ai-text');
                                    
                                    if (aiTextElement) {
                                        console.log('aiTextElement found, starting animation');
                                        
                                        // アニメーション開始（最初のテキスト受信時）
                                        this.animationManager.startTalking();
                                        
                                        // 最初のチャンクを即座に処理
                                        console.log('Processing first chunk:', data.delta);
                                        this.animationManager.appendText(aiTextElement, data.delta);
                                        this.scrollToBottom();
                                    } else {
                                        console.error('Failed to find aiTextElement immediately after creation');
                                    }
                                } else {
                                    // 2回目以降のチャンク
                                    if (aiTextElement) {
                                        console.log('Processing subsequent chunk:', data.delta);
                                        this.animationManager.appendText(aiTextElement, data.delta);
                                        this.scrollToBottom();
                                    } else {
                                        console.error('aiTextElement is null for subsequent chunk:', data.delta);
                                    }
                                }
                            }
                            
                            // ストリーミング完了イベントの処理
                            if (data.event === 'stream_end') {
                                console.log('Received stream_end event from Dify');
                                isStreamingComplete = true;
                                shouldBreakWhile = true;
                                break; // forループを抜ける
                            }
                        } catch (e) {
                            console.warn('Failed to parse SSE data:', e);
                        }
                    }
                }
                if (shouldBreakWhile) break;
            }
            
            // ストリーミング完了をAnimationManagerに通知
            if (isStreamingComplete) {
                console.log("ChatManager: Stream is complete. Signaling to AnimationManager.");
                this.animationManager.signalStreamEnd();
            }
            
        } catch (error) {
            console.error('Streaming error:', error);
            // フォールバック: 通常のAPIを試行
            await this.sendMessageFallback(message);
        }
    }

    // フォールバック用の通常API送信
    async sendMessageFallback(message) {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({message})
        });
        
        const data = await response.json();
        
        // Dify APIの応答をそのまま使用（最適化を無効化）
        console.log('Dify fallback response received and displayed without modification');
        
        // 「思考中...」表示を削除
        this.removeThinkingIndicator();
        
        // AIレスポンスをタイプライター効果で表示
        await this.addLine(data.response, 'ai');
        
        // アニメーション停止（短時間で終了）
        setTimeout(() => {
            this.animationManager.stopTalking();
        }, 100); // 100msに短縮
    }

    // メッセージを画面に追加
    async addLine(text, type) {
        const line = document.createElement('div');
        line.className = 'line ' + type;
        
        if (type === 'user') {
            line.innerHTML = `<span class="user-prompt">USER&gt;</span> ${text}`;
            this.output.appendChild(line);
            this.scrollToBottom();
        } else if (type === 'ai') {
            // AIメッセージはタイプライター演出（テキストがある場合のみ表示）
            if (text && text.trim()) {
                line.innerHTML = `<span class="ai-prompt">${this.settings.avatarName}&gt;</span> <span class="ai-text"></span>`;
                this.output.appendChild(line);
                
                const aiTextElement = line.querySelector('.ai-text');
                await this.animationManager.typeWriter(aiTextElement, text);
            }
        } else {
            // system メッセージなど
            line.textContent = text;
            this.output.appendChild(line);
            this.scrollToBottom();
        }
    }

    // チャットエリアを最下部にスクロール
    scrollToBottom() {
        this.output.scrollTop = this.output.scrollHeight;
    }
    
    // 「思考中...」表示を追加
    showThinkingIndicator() {
        const thinkingLine = document.createElement('div');
        thinkingLine.className = 'line thinking';
        thinkingLine.id = 'thinking-indicator';
        thinkingLine.innerHTML = `<span class="ai-prompt">${this.settings.avatarName}&gt;</span> <span class="thinking-text">思考中...</span>`;
        this.output.appendChild(thinkingLine);
        this.scrollToBottom();
    }
    
    // 「思考中...」表示を削除
    removeThinkingIndicator() {
        const thinkingLine = document.getElementById('thinking-indicator');
        if (thinkingLine) {
            thinkingLine.remove();
        }
    }
}