/**
 * 初期プロンプト管理モジュール
 * 世界観に合った魅力的なきっかけ作りと初見ユーザーへの配慮
 */

export class InitialPromptsManager {
    constructor() {
        this.prompts = this.getInitialPrompts();
        this.currentPromptIndex = 0;
    }
    
    /**
     * 初期プロンプト集を取得
     */
    getInitialPrompts() {
        return {
            // コードネーム系（世界観重視）
            codename: [
                "君のコードネームを教えてくれ！",
                "ハッカー、君の呼び名は何だ？",
                "システムに登録する。君の識別子は？",
                "ターミナルに接続中...君のハンドルネームは？"
            ],
            
            // 勉強会・学習系
            study: [
                "今日は何を学びに来た？",
                "どんなスキルをハックしたい？",
                "君の学習目標をインプットしてくれ",
                "今日のミッション：何を習得する？"
            ],
            
            // 技術系（プログラマー向け）
            tech: [
                "どの言語をデバッグ中？",
                "今日のコーディングテーマは？",
                "実装したい機能について教えて",
                "君のプロジェクトのステータスは？"
            ],
            
            // カジュアル系（初心者向け）
            casual: [
                "何か困ってることある？",
                "今日は何について話そうか？",
                "質問があれば何でも聞いて！",
                "どんなことに興味がある？"
            ],
            
            // 世界観重視（ターミナル風）
            terminal: [
                "> AWAITING_INPUT: ユーザークエリを入力してください",
                "> SYSTEM_READY: 何をアシストしましょう？",
                "> CONNECTION_ESTABLISHED: 最初のコマンドは？",
                "> READY_FOR_INSTRUCTION: 君の指示を待っている"
            ]
        };
    }
    
    /**
     * URLパラメータやコンテキストに基づいて適切なプロンプトを選択
     */
    selectPrompt() {
        const urlParams = new URLSearchParams(window.location.search);
        const promptType = urlParams.get('prompt_type') || this.detectContextualPromptType();
        
        let selectedPrompts = this.prompts.codename; // デフォルト
        
        // プロンプトタイプに応じて選択
        if (this.prompts[promptType]) {
            selectedPrompts = this.prompts[promptType];
        }
        
        // ランダム選択または順次選択
        const useRandom = urlParams.get('random_prompt') !== 'false';
        if (useRandom) {
            return selectedPrompts[Math.floor(Math.random() * selectedPrompts.length)];
        } else {
            const prompt = selectedPrompts[this.currentPromptIndex % selectedPrompts.length];
            this.currentPromptIndex++;
            return prompt;
        }
    }
    
    /**
     * コンテキストからプロンプトタイプを推測
     */
    detectContextualPromptType() {
        const urlParams = new URLSearchParams(window.location.search);
        
        // 勉強会モードの場合
        if (urlParams.get('study_mode') === 'true') {
            return 'study';
        }
        
        // セッション名から推測
        const sessionName = urlParams.get('session_name');
        if (sessionName) {
            if (sessionName.includes('プログラミング') || sessionName.includes('コーディング')) {
                return 'tech';
            }
            if (sessionName.includes('初心者') || sessionName.includes('入門')) {
                return 'casual';
            }
        }
        
        // 時間帯から推測
        const hour = new Date().getHours();
        if (hour >= 9 && hour <= 17) {
            return 'tech'; // 仕事時間
        } else if (hour >= 19 && hour <= 22) {
            return 'study'; // 勉強時間
        }
        
        return 'codename'; // デフォルト
    }
    
    /**
     * 初期プロンプトをシステムメッセージとして表示
     * Dify APIのみを使用するため完全に無効化
     */
    displayInitialPrompt() {
        // 初期プロンプトは表示しない（Dify APIのみ使用）
        console.log('Initial prompt display disabled - using Dify API only');
        return null;
    }
    
    /**
     * 応答例を提供（ユーザーが迷った場合のヒント）
     */
    getResponseExamples(promptType = 'codename') {
        const examples = {
            codename: [
                "ミカりん",
                "CodeMaster",
                "DevNinja",
                "TechSamurai"
            ],
            study: [
                "JavaScriptを学んでいます",
                "機械学習について知りたい",
                "Reactの使い方を覚えたい",
                "アルゴリズムを理解したい"
            ],
            tech: [
                "Pythonでデータ分析",
                "Webアプリ開発",
                "APIの作り方",
                "バグの修正方法"
            ],
            casual: [
                "プログラミング始めたばかり",
                "転職について相談",
                "勉強方法を教えて",
                "おすすめの本は？"
            ]
        };
        
        return examples[promptType] || examples.codename;
    }
    
    /**
     * プロンプトに対する期待される応答パターンを分析
     */
    analyzeExpectedResponse(prompt) {
        const patterns = {
            name: /コードネーム|呼び名|ハンドルネーム|識別子/,
            learning: /学び|習得|スキル|目標/,
            tech: /言語|コーディング|実装|プロジェクト/,
            general: /困って|話そう|質問|興味/
        };
        
        for (const [type, pattern] of Object.entries(patterns)) {
            if (pattern.test(prompt)) {
                return type;
            }
        }
        
        return 'general';
    }
    
    /**
     * ユーザーの最初の応答に基づいて適切なフォローアップを生成
     */
    generateFollowUp(userResponse, promptType) {
        const responseType = this.analyzeUserResponse(userResponse);
        
        const followUps = {
            name: [
                `${userResponse}、かっこいい名前だね！よろしく✨`,
                `${userResponse}さん、システムに登録完了！何を手伝おうか？`,
                `${userResponse}、いい響きだ！今日は何をハックする？`
            ],
            learning: [
                "素晴らしい目標だね！どこから始めようか？",
                "その分野、あーしも得意だよ〜💪 具体的に何を知りたい？",
                "いいチョイス！まずは基礎から？それとも実践的なことから？"
            ],
            tech: [
                "おお〜、その技術面白いよね！どんなところで詰まってる？",
                "それ、あーしも最近やってた！具体的にどの部分？",
                "技術的な話、大好き〜🔥 詳しく教えて！"
            ],
            general: [
                "なるほど〜！もう少し詳しく聞かせて？",
                "面白そう！どんなことか教えて〜✨",
                "それについて、あーしも一緒に考えてみよう！"
            ]
        };
        
        const responses = followUps[responseType] || followUps.general;
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    /**
     * ユーザーの応答を分析
     */
    analyzeUserResponse(response) {
        const lowerResponse = response.toLowerCase();
        
        // 名前っぽい応答
        if (response.length < 20 && !lowerResponse.includes('です') && !lowerResponse.includes('ます')) {
            return 'name';
        }
        
        // 学習系キーワード
        if (/学習|勉強|覚え|習得|学び/.test(response)) {
            return 'learning';
        }
        
        // 技術系キーワード
        if (/プログラム|コード|開発|技術|言語|フレームワーク/.test(response)) {
            return 'tech';
        }
        
        return 'general';
    }
    
    /**
     * 勉強会向けの特別なプロンプトセット
     */
    getStudySessionPrompts(sessionName) {
        const basePrompts = [
            `${sessionName}へようこそ！今日の目標は？`,
            `${sessionName}で何を学びたい？`,
            `今日の${sessionName}、楽しみにしてたよ〜！質問ある？`,
            `${sessionName}参加者の皆さん、お疲れ様！何か困ってる？`
        ];
        
        return basePrompts;
    }
}

// 便利な定数とヘルパー
export const PROMPT_TYPES = {
    CODENAME: 'codename',
    STUDY: 'study',
    TECH: 'tech',
    CASUAL: 'casual',
    TERMINAL: 'terminal'
};

export const PromptHelper = {
    // クイックセットアップ用
    setupForStudySession: (sessionName) => {
        const manager = new InitialPromptsManager();
        const prompts = manager.getStudySessionPrompts(sessionName);
        return prompts[Math.floor(Math.random() * prompts.length)];
    },
    
    // URLに応じたプロンプト生成
    generateContextualPrompt: () => {
        const manager = new InitialPromptsManager();
        return manager.selectPrompt();
    }
};
