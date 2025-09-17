/**
 * URLパラメータ管理モジュール
 * 勉強会・LT会での柔軟な設定切り替えを実現
 */

export class URLParamsManager {
    constructor() {
        this.params = new URLSearchParams(window.location.search);
        this.config = this.parseParams();
        
        this.applyConfig();
    }
    
    /**
     * URLパラメータを解析して設定オブジェクトを作成
     */
    parseParams() {
        const config = {
            // アバター設定
            modelno: this.params.get('modelno') || this.params.get('avatar') || '1',
            avatar_name: this.params.get('avatar_name'),
            
            // UI設定
            skip_welcome: this.params.get('skip_welcome') === 'true' || this.params.get('skip_welcome') === '1',
            popup: this.params.get('popup') === 'true' || this.params.get('popup') === '1',
            compact_ui: this.params.get('compact_ui') === 'true' || this.params.get('compact') === 'true',
            
            // 勉強会モード設定
            study_mode: this.params.get('study_mode') === 'true' || this.params.get('study') === 'true',
            session_name: this.params.get('session_name') || this.params.get('session'),
            
            // 表示設定
            theme: this.params.get('theme') || 'default',
            font_size: this.params.get('font_size') || this.params.get('fontsize'),
            
            // 動作設定
            auto_focus: this.params.get('auto_focus') === 'true',
            sound_enabled: this.params.get('sound') !== 'false', // デフォルトは有効
            
            // デバッグ設定
            debug: this.params.get('debug') === 'true',
            verbose: this.params.get('verbose') === 'true'
        };
        
        return config;
    }
    
    /**
     * 設定をUIに適用
     */
    applyConfig() {
        // アバター設定の適用
        this.applyAvatarConfig();
        
        // UI設定の適用
        this.applyUIConfig();
        
        // 勉強会モード設定の適用
        this.applyStudyModeConfig();
        
        // テーマ設定の適用
        this.applyThemeConfig();
        
        // デバッグ設定の適用
        if (this.config.debug) {
            this.enableDebugMode();
        }
    }
    
    /**
     * アバター設定を適用
     */
    applyAvatarConfig() {
        const modelno = this.config.modelno;
        
        // アバター番号に基づく設定
        const avatarConfigs = {
            '1': {
                name: 'SPECTRA',
                full_name: 'Spectra Communicator',
                image_idle: 'idle.png',
                image_talk: 'talk.png'
            },
            '2': {
                name: 'INU BUDDY',
                full_name: 'Inu Buddy Communicator',
                image_idle: 'idle_inu.png',
                image_talk: 'talk_inu.png'
            }
        };
        
        const avatarConfig = avatarConfigs[modelno] || avatarConfigs['1'];
        
        // カスタム名がある場合は上書き
        if (this.config.avatar_name) {
            avatarConfig.name = this.config.avatar_name.toUpperCase();
            avatarConfig.full_name = `${this.config.avatar_name} Communicator`;
        }
        
        // グローバル設定を更新
        if (window.appConfig) {
            Object.assign(window.appConfig, {
                avatarName: avatarConfig.name,
                avatarImageIdle: avatarConfig.image_idle,
                avatarImageTalk: avatarConfig.image_talk
            });
        }
        
        // DOM要素を更新（ページロード後）
        document.addEventListener('DOMContentLoaded', () => {
            this.updateAvatarDOM(avatarConfig);
        });
        
        console.log(`Avatar config applied: ${avatarConfig.name} (model ${modelno})`);
    }
    
    /**
     * UI設定を適用
     */
    applyUIConfig() {
        const body = document.body;
        
        // コンパクトUI
        if (this.config.compact_ui) {
            body.setAttribute('data-compact', 'true');
        }
        
        // フォントサイズ
        if (this.config.font_size) {
            body.style.fontSize = `${this.config.font_size}px`;
        }
        
        // 自動フォーカス
        if (this.config.auto_focus) {
            document.addEventListener('DOMContentLoaded', () => {
                const input = document.getElementById('input');
                if (input) {
                    input.focus();
                }
            });
        }
    }
    
    /**
     * 勉強会モード設定を適用
     */
    applyStudyModeConfig() {
        if (this.config.study_mode) {
            document.body.classList.add('study-mode');
            
            // セッション名を表示
            if (this.config.session_name) {
                document.addEventListener('DOMContentLoaded', () => {
                    this.addSessionHeader(this.config.session_name);
                });
            }
            
            // 勉強会向けの最適化
            this.optimizeForStudySession();
        }
    }
    
    /**
     * テーマ設定を適用
     */
    applyThemeConfig() {
        const theme = this.config.theme;
        
        if (theme !== 'default') {
            document.body.setAttribute('data-theme', theme);
            
            // テーマ別のCSS
            const themeStyles = {
                'dark': {
                    '--bg-color': '#000',
                    '--text-color': '#0f0',
                    '--accent-color': '#0ff'
                },
                'light': {
                    '--bg-color': '#f0f0f0',
                    '--text-color': '#333',
                    '--accent-color': '#007acc'
                },
                'retro': {
                    '--bg-color': '#001100',
                    '--text-color': '#00ff00',
                    '--accent-color': '#ffff00'
                }
            };
            
            if (themeStyles[theme]) {
                const root = document.documentElement;
                Object.entries(themeStyles[theme]).forEach(([prop, value]) => {
                    root.style.setProperty(prop, value);
                });
            }
        }
    }
    
    /**
     * デバッグモードを有効化
     */
    enableDebugMode() {
        console.log('Debug mode enabled');
        console.log('URL Parameters:', this.config);
        
        // デバッグ情報を画面に表示
        const debugInfo = document.createElement('div');
        debugInfo.id = 'debug-info';
        debugInfo.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            background: rgba(0, 0, 0, 0.8);
            color: #0f0;
            padding: 10px;
            font-family: monospace;
            font-size: 10px;
            z-index: 9999;
            max-width: 300px;
            overflow: auto;
        `;
        
        debugInfo.innerHTML = `
            <strong>DEBUG INFO</strong><br>
            Model: ${this.config.modelno}<br>
            Popup: ${this.config.popup}<br>
            Study Mode: ${this.config.study_mode}<br>
            Theme: ${this.config.theme}<br>
            Session: ${this.config.session_name || 'None'}<br>
            <button onclick="this.parentElement.style.display='none'" style="margin-top:5px;font-size:10px;">Close</button>
        `;
        
        document.body.appendChild(debugInfo);
        
        // 詳細ログ
        if (this.config.verbose) {
            this.enableVerboseLogging();
        }
    }
    
    /**
     * 詳細ログを有効化
     */
    enableVerboseLogging() {
        const originalConsoleLog = console.log;
        console.log = function(...args) {
            const timestamp = new Date().toISOString();
            originalConsoleLog.apply(console, [`[${timestamp}]`, ...args]);
        };
        
        console.log('Verbose logging enabled');
    }
    
    /**
     * アバターDOMを更新
     */
    updateAvatarDOM(avatarConfig) {
        // アバター画像を更新
        const avatarImg = document.getElementById('avatar-img');
        if (avatarImg) {
            avatarImg.src = `/static/images/${avatarConfig.image_idle}`;
            avatarImg.alt = avatarConfig.name;
        }
        
        // アバター名を更新
        const avatarLabels = document.querySelectorAll('.avatar-label, .avatar-name');
        avatarLabels.forEach(label => {
            label.textContent = avatarConfig.name;
        });
        
        // システムメッセージを更新
        const systemMessages = document.querySelectorAll('.line.system');
        systemMessages.forEach(msg => {
            if (msg.textContent.includes('Online')) {
                msg.textContent = `> SYSTEM: ${avatarConfig.full_name} Online`;
            }
        });
    }
    
    /**
     * セッションヘッダーを追加
     */
    addSessionHeader(sessionName) {
        const header = document.createElement('div');
        header.className = 'session-header';
        header.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            background: rgba(0, 255, 0, 0.1);
            color: #0f0;
            text-align: center;
            padding: 5px;
            font-family: 'Fira Code', monospace;
            font-size: 12px;
            border-bottom: 1px solid #0f0;
            z-index: 999;
        `;
        header.textContent = `📚 ${sessionName} - Session Buddy Active`;
        
        document.body.appendChild(header);
        
        // メインコンテンツを下にずらす
        document.body.style.paddingTop = '30px';
    }
    
    /**
     * 勉強会向けの最適化
     */
    optimizeForStudySession() {
        // レスポンスの短縮化
        if (window.chatManager) {
            // チャットマネージャーに短縮モードを設定
            window.chatManager.shortResponseMode = true;
        }
        
        // 自動スクロール無効化（複数ウィンドウでの使用を想定）
        document.body.classList.add('no-auto-scroll');
    }
    
    /**
     * 現在の設定でURLを生成
     */
    generateURL(overrides = {}) {
        const config = { ...this.config, ...overrides };
        const params = new URLSearchParams();
        
        Object.entries(config).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== false && value !== '') {
                params.set(key, value);
            }
        });
        
        return `${window.location.pathname}?${params.toString()}`;
    }
    
    /**
     * 設定をローカルストレージに保存
     */
    saveToLocalStorage() {
        localStorage.setItem('session-buddy-config', JSON.stringify(this.config));
    }
    
    /**
     * ローカルストレージから設定を読み込み
     */
    loadFromLocalStorage() {
        const saved = localStorage.getItem('session-buddy-config');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Failed to parse saved config:', e);
            }
        }
        return {};
    }
}

// 使用例のヘルパー関数
export const URLHelper = {
    // 勉強会モード用URL生成
    generateStudyURL: (sessionName, modelno = '1') => {
        const params = new URLSearchParams({
            study_mode: 'true',
            popup: 'true',
            skip_welcome: 'true',
            compact_ui: 'true',
            session_name: sessionName,
            modelno: modelno
        });
        return `${window.location.pathname}?${params.toString()}`;
    },
    
    // ポップアップ用URL生成
    generatePopupURL: (modelno = '1', compact = false) => {
        const params = new URLSearchParams({
            popup: 'true',
            skip_welcome: 'true',
            modelno: modelno
        });
        if (compact) params.set('compact_ui', 'true');
        return `${window.location.pathname}?${params.toString()}`;
    }
};
