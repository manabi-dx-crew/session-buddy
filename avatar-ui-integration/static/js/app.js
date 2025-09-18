/**
 * メインアプリケーションエントリーポイント
 * 各モジュールを初期化し、アプリケーションを起動
 */
import { createSettings } from './settings.js';
import { SoundManager } from './sound.js';
import { AnimationManager } from './animation.js';
import { ChatManager } from './chat.js';
import { AvatarSwitcher } from './avatar-switcher.js';
import { WelcomeManager } from './welcome.js';
import { PopupManager } from './popup-manager.js';
import { URLParamsManager } from './url-params.js';
import { InitialPromptsManager } from './initial-prompts.js';

// DOMロード完了後にアプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
    // URLパラメータ管理を最初に初期化（他の機能に影響するため）
    window.urlParamsManager = new URLParamsManager();
    
    // URLパラメータでウェルカムスクリーンをスキップするかチェック
    const skipWelcome = WelcomeManager.checkSkipWelcome();
    
    // ポップアップ管理機能を初期化
    window.popupManager = new PopupManager();
    
    // ウェルカムスクリーンを表示する場合は初期化
    if (!skipWelcome) {
        window.welcomeManager = new WelcomeManager();
    }
    
    // グローバル変数appConfigはindex.htmlで定義される
    if (typeof appConfig !== 'undefined') {
        const settings = createSettings(appConfig);
        const soundManager = new SoundManager(settings);
        const animationManager = new AnimationManager(settings, soundManager);
        window.chatManager = new ChatManager(settings, animationManager);
        
        // アバター切り替え機能を初期化（ChatManagerを渡す）
        window.avatarSwitcher = new AvatarSwitcher(settings, animationManager, window.chatManager);
        
        // 初期プロンプト管理を初期化
        window.initialPromptsManager = new InitialPromptsManager();
        
        // ウェルカムスクリーンをスキップした場合は初期プロンプトを即座に表示
        if (skipWelcome) {
            // アバター設定を確実に実行
            setupAvatarDisplayForSkipWelcome();
            
            setTimeout(() => {
                window.initialPromptsManager.displayInitialPrompt();
            }, 500);
        }
        
        console.log('Session Buddy initialized with all features! 🐕✨🪟💬');
    } else {
        console.error('App config not found');
    }
});

/**
 * ウェルカムスクリーンスキップ時のアバター設定
 */
function setupAvatarDisplayForSkipWelcome() {
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
    
    console.log('Avatar display set to INU BUDDY for skip welcome mode');
}