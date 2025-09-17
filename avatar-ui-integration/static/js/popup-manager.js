/**
 * ポップアップウィンドウ管理モジュール
 * 勉強会・LT会での使いやすさを向上させるためのウィンドウ管理機能
 */

export class PopupManager {
    constructor() {
        this.isPopupMode = this.checkPopupMode();
        this.popupWindow = null;
        
        this.init();
    }
    
    init() {
        // ポップアップモードの場合の初期化
        if (this.isPopupMode) {
            this.initPopupMode();
        } else {
            // 通常モードの場合、ポップアップ開くボタンを追加
            this.addPopupButton();
        }
    }
    
    /**
     * URLパラメータでポップアップモードかチェック
     */
    checkPopupMode() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('popup') === 'true' || urlParams.get('popup') === '1';
    }
    
    /**
     * ポップアップモードの初期化
     */
    initPopupMode() {
        // ポップアップウィンドウ用のスタイル調整
        document.body.classList.add('popup-mode');
        
        // ウィンドウサイズを調整
        this.adjustPopupWindowSize();
        
        // 最前面表示の設定
        this.setAlwaysOnTop();
        
        // ウィンドウを閉じる際の処理
        window.addEventListener('beforeunload', () => {
            if (window.opener) {
                // 親ウィンドウに閉じることを通知
                try {
                    window.opener.postMessage({ type: 'popup_closed' }, '*');
                } catch (e) {
                    console.log('Could not notify parent window:', e);
                }
            }
        });
        
        console.log('Popup mode initialized 🪟');
    }
    
    /**
     * 通常モードでポップアップを開くボタンを追加
     */
    addPopupButton() {
        // ポップアップボタンを作成
        const popupBtn = document.createElement('button');
        popupBtn.id = 'popup-btn';
        popupBtn.className = 'popup-btn';
        popupBtn.innerHTML = '📱 ポップアップで開く';
        popupBtn.title = 'ポップアップウィンドウで開く（勉強会モード）';
        
        // ボタンのスタイル
        popupBtn.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: transparent;
            color: #0f0;
            border: 1px solid #0f0;
            padding: 8px 12px;
            font-family: 'Fira Code', monospace;
            font-size: 12px;
            cursor: pointer;
            z-index: 999;
            transition: all 0.3s ease;
            border-radius: 3px;
        `;
        
        // ホバー効果
        popupBtn.addEventListener('mouseenter', () => {
            popupBtn.style.background = 'rgba(0, 255, 0, 0.1)';
            popupBtn.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.3)';
        });
        
        popupBtn.addEventListener('mouseleave', () => {
            popupBtn.style.background = 'transparent';
            popupBtn.style.boxShadow = 'none';
        });
        
        // クリックイベント
        popupBtn.addEventListener('click', () => {
            this.openPopup();
        });
        
        document.body.appendChild(popupBtn);
    }
    
    /**
     * ポップアップウィンドウを開く
     */
    openPopup() {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('popup', 'true');
        currentUrl.searchParams.set('skip_welcome', 'true'); // ポップアップ時はウェルカムスクリーンをスキップ
        
        const popupFeatures = [
            'width=800',
            'height=600',
            'left=100',
            'top=100',
            'resizable=yes',
            'scrollbars=no',
            'toolbar=no',
            'menubar=no',
            'location=no',
            'status=no',
            'titlebar=yes'
        ].join(',');
        
        this.popupWindow = window.open(currentUrl.toString(), 'SessionBuddyPopup', popupFeatures);
        
        if (this.popupWindow) {
            // ポップアップが開けた場合の処理
            this.popupWindow.focus();
            
            // ポップアップからのメッセージを受信
            window.addEventListener('message', (event) => {
                if (event.data.type === 'popup_closed') {
                    this.popupWindow = null;
                }
            });
            
            console.log('Popup window opened successfully! 🚀');
        } else {
            // ポップアップブロックされた場合
            alert('ポップアップがブロックされました。ブラウザの設定でポップアップを許可してください。');
        }
    }
    
    /**
     * ポップアップウィンドウのサイズを調整
     */
    adjustPopupWindowSize() {
        // 理想的なサイズに調整
        const idealWidth = 800;
        const idealHeight = 600;
        
        if (window.resizeTo) {
            window.resizeTo(idealWidth, idealHeight);
        }
        
        // 画面中央に配置
        if (window.moveTo) {
            const screenX = window.screen.availWidth;
            const screenY = window.screen.availHeight;
            const x = (screenX - idealWidth) / 2;
            const y = (screenY - idealHeight) / 2;
            window.moveTo(x, y);
        }
    }
    
    /**
     * 最前面表示の設定（可能な範囲で）
     */
    setAlwaysOnTop() {
        // ブラウザの制限により、完全な最前面表示は不可能
        // フォーカス時に前面に来るように設定
        window.addEventListener('blur', () => {
            setTimeout(() => {
                if (window.focus) {
                    window.focus();
                }
            }, 100);
        });
        
        // 定期的にフォーカスを取得（ユーザーが望む場合のみ）
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('always_focus') === 'true') {
            setInterval(() => {
                if (window.focus && !document.hidden) {
                    window.focus();
                }
            }, 5000);
        }
    }
    
    /**
     * ポップアップモード用のキーボードショートカット
     */
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+W または Cmd+W でウィンドウを閉じる
            if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
                if (this.isPopupMode) {
                    e.preventDefault();
                    window.close();
                }
            }
            
            // Escape でウィンドウを最小化
            if (e.key === 'Escape' && this.isPopupMode) {
                if (window.minimize) {
                    window.minimize();
                }
            }
        });
    }
    
    /**
     * 勉強会モード用の特別な設定
     */
    static enableStudyMode() {
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set('study_mode', 'true');
        urlParams.set('popup', 'true');
        urlParams.set('skip_welcome', 'true');
        urlParams.set('compact_ui', 'true');
        
        const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
        
        const popupFeatures = [
            'width=600',
            'height=400',
            'resizable=yes',
            'scrollbars=no',
            'toolbar=no',
            'menubar=no',
            'location=no',
            'status=no'
        ].join(',');
        
        window.open(newUrl, 'SessionBuddyStudy', popupFeatures);
    }
}

// ポップアップモード用のCSS
const popupStyle = document.createElement('style');
popupStyle.textContent = `
.popup-mode {
    overflow: hidden;
}

.popup-mode .terminal {
    height: 100vh;
    max-width: none;
    padding: 10px;
}

.popup-mode .chat-area {
    height: calc(100vh - 40px);
}

.popup-mode .welcome-screen {
    padding: 10px;
}

.popup-mode .welcome-terminal {
    padding: 15px;
    width: 100%;
    max-width: none;
}

/* コンパクトUI用 */
body[data-compact="true"] .avatar-area {
    width: 100px;
}

body[data-compact="true"] #avatar-img {
    width: 80px;
    height: 80px;
}

body[data-compact="true"] .chat-area {
    height: 250px;
}
`;
document.head.appendChild(popupStyle);
