/**
 * 応答最適化モジュール
 * Difyからの冗長な応答を勉強会・LT会に適した形に最適化
 */

export class ResponseOptimizer {
    constructor() {
        this.config = this.loadConfig();
        this.responsePatterns = this.initializePatterns();
    }
    
    /**
     * 設定を読み込み
     */
    loadConfig() {
        const urlParams = new URLSearchParams(window.location.search);
        
        return {
            // 勉強会モード：短縮応答
            studyMode: urlParams.get('study_mode') === 'true',
            
            // 最大文字数制限
            maxLength: parseInt(urlParams.get('max_response_length')) || (urlParams.get('study_mode') === 'true' ? 200 : 500),
            
            // 箇条書き優先
            preferBullets: urlParams.get('prefer_bullets') !== 'false',
            
            // 敬語レベル（casual, polite, formal）
            politenessLevel: urlParams.get('politeness') || 'casual',
            
            // 絵文字使用
            useEmojis: urlParams.get('emojis') !== 'false',
            
            // コード例の簡略化
            simplifyCode: urlParams.get('simplify_code') === 'true',
            
            // 勉強会向け最適化
            optimizeForSession: urlParams.get('study_mode') === 'true' || urlParams.get('session_mode') === 'true'
        };
    }
    
    /**
     * 応答パターンを初期化
     */
    initializePatterns() {
        return {
            // 冗長な表現を短縮
            verbosePatterns: [
                { from: /それは素晴らしい質問ですね。?/g, to: '' },
                { from: /詳しく説明させていただきます。?/g, to: '' },
                { from: /以下に詳細を記載いたします。?/g, to: '' },
                { from: /ご参考になれば幸いです。?/g, to: '' },
                { from: /いかがでしょうか。?/g, to: '' },
                { from: /〜と思われます/g, to: '〜だよ' },
                { from: /〜することが可能です/g, to: '〜できるよ' },
                { from: /〜していただければと思います/g, to: '〜してみて' }
            ],
            
            // ギャル口調への変換（ミカりんキャラ）
            galPatterns: [
                { from: /です。/g, to: 'だよ〜' },
                { from: /ます。/g, to: 'るよ！' },
                { from: /でしょう。/g, to: 'っしょ！' },
                { from: /ですね。/g, to: 'だよね✨' },
                { from: /思います/g, to: '思うんだ' },
                { from: /おすすめします/g, to: 'おすすめ〜💪' },
                { from: /重要です/g, to: '超大事！' },
                { from: /難しい/g, to: 'ちょっと難しめ' },
                { from: /簡単/g, to: '楽勝' }
            ],
            
            // 技術用語の親しみやすい表現
            techFriendlyPatterns: [
                { from: /プログラミング言語/g, to: 'プログラミング' },
                { from: /アルゴリズム/g, to: 'アルゴ' },
                { from: /データベース/g, to: 'DB' },
                { from: /フレームワーク/g, to: 'フレームワーク' },
                { from: /ライブラリ/g, to: 'ライブラリ' },
                { from: /リファクタリング/g, to: 'リファクタ' }
            ]
        };
    }
    
    /**
     * メイン最適化関数
     */
    optimize(response) {
        let optimized = response;
        
        // 1. 基本的な冗長性除去
        optimized = this.removeVerbosity(optimized);
        
        // 2. 長さ制限
        optimized = this.limitLength(optimized);
        
        // 3. 口調調整
        optimized = this.adjustTone(optimized);
        
        // 4. 構造化（箇条書き等）
        optimized = this.structurize(optimized);
        
        // 5. 勉強会向け最適化
        if (this.config.optimizeForSession) {
            optimized = this.optimizeForStudySession(optimized);
        }
        
        // 6. 絵文字追加
        if (this.config.useEmojis) {
            optimized = this.addEmojis(optimized);
        }
        
        return optimized;
    }
    
    /**
     * 冗長性を除去
     */
    removeVerbosity(text) {
        let result = text;
        
        // 冗長なパターンを削除
        this.responsePatterns.verbosePatterns.forEach(pattern => {
            result = result.replace(pattern.from, pattern.to);
        });
        
        // 重複する改行を整理
        result = result.replace(/\n\s*\n\s*\n/g, '\n\n');
        
        // 不要な空白を除去
        result = result.replace(/\s+/g, ' ').trim();
        
        return result;
    }
    
    /**
     * 長さ制限
     */
    limitLength(text) {
        if (text.length <= this.config.maxLength) {
            return text;
        }
        
        // 文単位で切り詰め
        const sentences = text.split(/[。！？]/);
        let result = '';
        
        for (const sentence of sentences) {
            if ((result + sentence + '。').length > this.config.maxLength) {
                break;
            }
            result += sentence + '。';
        }
        
        // 最後に省略を示す
        if (result.length < text.length) {
            result = result.trim() + '...続きは詳しく聞いてね〜✨';
        }
        
        return result;
    }
    
    /**
     * 口調調整
     */
    adjustTone(text) {
        let result = text;
        
        switch (this.config.politenessLevel) {
            case 'casual':
                // ギャル口調に変換
                this.responsePatterns.galPatterns.forEach(pattern => {
                    result = result.replace(pattern.from, pattern.to);
                });
                break;
                
            case 'polite':
                // 丁寧語を保持
                break;
                
            case 'formal':
                // より正式な表現に
                result = result.replace(/だよ/g, 'です');
                result = result.replace(/だね/g, 'ですね');
                break;
        }
        
        return result;
    }
    
    /**
     * 構造化（箇条書き等）
     */
    structurize(text) {
        if (!this.config.preferBullets) {
            return text;
        }
        
        // 長い説明を箇条書きに変換
        if (text.length > 150 && text.includes('、')) {
            const parts = text.split('、');
            if (parts.length >= 3) {
                return '要点をまとめると〜✨\n' + 
                       parts.slice(0, -1).map(part => `・ ${part.trim()}`).join('\n') + 
                       '\n' + parts[parts.length - 1];
            }
        }
        
        return text;
    }
    
    /**
     * 勉強会向け最適化
     */
    optimizeForStudySession(text) {
        let result = text;
        
        // 勉強会でよく使われる表現に変換
        const sessionPatterns = [
            { from: /学習/g, to: '勉強' },
            { from: /習得/g, to: 'マスター' },
            { from: /理解/g, to: '理解' },
            { from: /実装/g, to: '作成' },
            { from: /エラー/g, to: 'バグ' }
        ];
        
        sessionPatterns.forEach(pattern => {
            result = result.replace(pattern.from, pattern.to);
        });
        
        // 勉強会参加者向けの励まし
        const encouragements = [
            'がんばって〜💪',
            '一緒に学ぼう✨',
            'きっとできるよ〜🔥',
            '質問あればいつでも！'
        ];
        
        if (Math.random() < 0.3) { // 30%の確率で励ましを追加
            const encouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
            result += '\n' + encouragement;
        }
        
        return result;
    }
    
    /**
     * 絵文字追加
     */
    addEmojis(text) {
        const emojiMap = {
            'プログラミング': '💻',
            'コード': '📝',
            '学習': '📚',
            '成功': '✅',
            '完了': '🎉',
            'エラー': '❌',
            'バグ': '🐛',
            '重要': '⚠️',
            'おすすめ': '👍',
            '注意': '⚠️',
            'ポイント': '💡',
            'コツ': '💡',
            'テクニック': '🔧'
        };
        
        let result = text;
        
        Object.entries(emojiMap).forEach(([word, emoji]) => {
            // 最初の出現のみに絵文字を追加
            result = result.replace(new RegExp(`(${word})(?!.*${emoji})`, 'g'), `$1${emoji}`);
        });
        
        return result;
    }
    
    /**
     * コード例の簡略化
     */
    simplifyCode(text) {
        if (!this.config.simplifyCode) {
            return text;
        }
        
        // コードブロックを簡略化
        return text.replace(/```[\s\S]*?```/g, (match) => {
            const lines = match.split('\n');
            if (lines.length > 10) {
                return lines.slice(0, 8).join('\n') + '\n// ... 省略\n```';
            }
            return match;
        });
    }
    
    /**
     * 応答の品質を分析
     */
    analyzeQuality(originalResponse, optimizedResponse) {
        return {
            originalLength: originalResponse.length,
            optimizedLength: optimizedResponse.length,
            compressionRatio: (1 - optimizedResponse.length / originalResponse.length) * 100,
            hasEmojis: /[^\x00-\x7F]/.test(optimizedResponse),
            isCasualTone: /だよ|だね|〜/.test(optimizedResponse),
            isStructured: optimizedResponse.includes('・') || optimizedResponse.includes('\n')
        };
    }
    
    /**
     * 設定をリアルタイムで更新
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        console.log('Response optimizer config updated:', this.config);
    }
}

// 便利なヘルパー関数
export const ResponseHelper = {
    // クイック最適化
    quickOptimize: (response) => {
        const optimizer = new ResponseOptimizer();
        return optimizer.optimize(response);
    },
    
    // 勉強会向け最適化
    optimizeForStudy: (response) => {
        const optimizer = new ResponseOptimizer();
        optimizer.updateConfig({
            studyMode: true,
            maxLength: 150,
            preferBullets: true,
            politenessLevel: 'casual',
            optimizeForSession: true
        });
        return optimizer.optimize(response);
    }
};
