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
                await this.sendMessage(this.input.value);
                this.input.value = '';
            }
        });
    }

    // メッセージ送信
    async sendMessage(message) {
        // ユーザーメッセージを表示
        this.addLine(message, 'user');
        
        try {
            // ストリーミング対応のAIレスポンスを取得
            await this.sendMessageStreaming(message);
        } catch (error) {
            console.error('Chat error:', error);
            this.addLine('エラーが発生しました。再試行してください。', 'system');
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
            
            // AIメッセージ行を準備
            const line = document.createElement('div');
            line.className = 'line ai';
            line.innerHTML = `<span class="ai-prompt">${this.settings.avatarName}&gt;</span> <span class="ai-text"></span>`;
            this.output.appendChild(line);
            
            const aiTextElement = line.querySelector('.ai-text');
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let fullResponse = ''; // 完全な応答を蓄積
            
            // アニメーション開始
            this.animationManager.startTalking();
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop(); // 最後の不完全な行を保持
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.delta) {
                                fullResponse += data.delta; // 完全な応答を蓄積
                                // タイプライター効果で文字を追加
                                await this.animationManager.appendText(aiTextElement, data.delta);
                                this.scrollToBottom();
                            }
                        } catch (e) {
                            console.warn('Failed to parse SSE data:', e);
                        }
                    }
                }
            }
            
            // Dify APIの応答をそのまま使用（上書き処理を無効化）
            // ResponseOptimizerとInitialPromptsManagerによる上書きを無効化
            console.log('Dify response received and displayed without modification');
            
            // アニメーション停止
            this.animationManager.stopTalking();
            
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
        
        // AIレスポンスをタイプライター効果で表示
        await this.addLine(data.response, 'ai');
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
            // AIメッセージはタイプライター演出
            line.innerHTML = `<span class="ai-prompt">${this.settings.avatarName}&gt;</span> <span class="ai-text"></span>`;
            this.output.appendChild(line);
            
            const aiTextElement = line.querySelector('.ai-text');
            await this.animationManager.typeWriter(aiTextElement, text);
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
}