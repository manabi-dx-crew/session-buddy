/**
 * ウェルカムスクリーン管理モジュール
 * 初回アクセス時の説明画面とメインシステムへの遷移を管理
 */

export class WelcomeManager {
    constructor() {
        this.welcomeScreen = document.getElementById('welcome-screen');
        this.mainTerminal = document.getElementById('main-terminal');
        this.enterBtn = document.getElementById('enter-btn');
        
        this.init();
    }
    
    init() {
        // ENTERボタンのクリックイベント
        this.enterBtn.addEventListener('click', () => {
            this.enterSystem();
        });
        
        // Enterキーでもシステムに入れるように
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && this.welcomeScreen.style.display !== 'none') {
                this.enterSystem();
            }
        });
        
        // ウェルカムスクリーンのタイプライター効果
        this.startWelcomeAnimation();
    }
    
    /**
     * システムに入る処理
     */
    enterSystem() {
        // フェードアウトアニメーション
        this.welcomeScreen.style.animation = 'fadeOut 0.5s ease-out forwards';
        
        setTimeout(() => {
            // ウェルカムスクリーンを非表示
            this.welcomeScreen.style.display = 'none';
            
            // メインターミナルを表示
            this.mainTerminal.style.display = 'flex';
            this.mainTerminal.style.animation = 'fadeIn 0.5s ease-out';
            
            // アバターを正しく設定（INU BUDDYに統一）
            this.setupAvatarDisplay();
            
            // 入力フィールドにフォーカス
            const inputField = document.getElementById('input');
            if (inputField) {
                inputField.focus();
            }
            
            // 初期プロンプトを表示
            if (window.initialPromptsManager) {
                setTimeout(() => {
                    window.initialPromptsManager.displayInitialPrompt();
                }, 300);
            }
            
            // システム開始音を再生（もしあれば）
            this.playSystemStartSound();
            
            console.log('System entered successfully! Welcome to Session Buddy! 🚀');
        }, 500);
    }
    
    /**
     * アバター表示を正しく設定
     */
    setupAvatarDisplay() {
        // アバター画像をINU BUDDYに設定
        const avatarImg = document.getElementById('avatar-img');
        const avatarLabel = document.querySelector('.avatar-label');
        
        if (avatarImg) {
            avatarImg.src = '/static/images/idle_inu.png';
            avatarImg.alt = 'INU BUDDY';
        }
        
        if (avatarLabel) {
            avatarLabel.textContent = 'INU BUDDY';
        }
        
        console.log('Avatar display set to INU BUDDY');
    }
    
    /**
     * ウェルカムスクリーンのタイプライター効果
     */
    startWelcomeAnimation() {
        const systemLines = this.welcomeScreen.querySelectorAll('.welcome-header .line.system');
        let delay = 500;
        
        systemLines.forEach((line, index) => {
            setTimeout(() => {
                line.style.opacity = '0';
                line.style.animation = 'typeIn 1s ease-out forwards';
                line.style.animationDelay = `${index * 0.3}s`;
            }, delay + (index * 300));
        });
        
        // ENTERボタンを少し遅らせて表示
        setTimeout(() => {
            this.enterBtn.style.opacity = '0';
            this.enterBtn.style.animation = 'fadeIn 1s ease-out forwards';
        }, delay + (systemLines.length * 300) + 500);
    }
    
    /**
     * システム開始音を再生（オプション）
     */
    playSystemStartSound() {
        try {
            // ビープ音を生成して再生
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            console.log('Audio not available or blocked:', error);
        }
    }
    
    /**
     * URLパラメータでウェルカムスクリーンをスキップする機能
     */
    static checkSkipWelcome() {
        const urlParams = new URLSearchParams(window.location.search);
        const skipWelcome = urlParams.get('skip_welcome');
        
        if (skipWelcome === 'true' || skipWelcome === '1') {
            const welcomeScreen = document.getElementById('welcome-screen');
            const mainTerminal = document.getElementById('main-terminal');
            
            if (welcomeScreen && mainTerminal) {
                welcomeScreen.style.display = 'none';
                mainTerminal.style.display = 'flex';
                
                // 入力フィールドにフォーカス
                const inputField = document.getElementById('input');
                if (inputField) {
                    inputField.focus();
                }
                
                console.log('Welcome screen skipped via URL parameter');
                return true;
            }
        }
        return false;
    }
}

// フェードアウト用のCSS追加
const style = document.createElement('style');
style.textContent = `
@keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
}

@keyframes typeIn {
    from { 
        opacity: 0;
        transform: translateX(-10px);
    }
    to { 
        opacity: 1;
        transform: translateX(0);
    }
}
`;
document.head.appendChild(style);
