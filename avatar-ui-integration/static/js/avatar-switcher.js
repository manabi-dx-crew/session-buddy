/**
 * アバター切り替え管理モジュール
 * 複数のアバタープロファイルを管理し、動的に切り替える
 */
export class AvatarSwitcher {
    constructor(settings, animationManager, chatManager = null) {
        this.settings = settings;
        this.animationManager = animationManager;
        this.chatManager = chatManager;
        this.currentAvatar = null;
        this.avatarProfiles = this.initializeAvatarProfiles();
        this.init();
    }

    // アバタープロファイルの初期化
    initializeAvatarProfiles() {
        return [
            {
                id: 'inu-buddy',
                name: 'いぬバディ',
                displayName: 'INU BUDDY',
                images: {
                    idle: 'idle_inu.png',
                    talk: 'talk_inu.png'
                },
                personality: 'friendly',
                tone: 'casual',
                description: 'フレンドリーで親しみやすいいぬのアシスタント'
            },
            {
                id: 'default-spectra',
                name: 'デフォルト',
                displayName: 'SPECTRA',
                images: {
                    idle: 'idle.png',
                    talk: 'talk.png'
                },
                personality: 'professional',
                tone: 'formal',
                description: 'デフォルトのSpectraアシスタント'
            }
        ];
    }

    // 初期化
    init() {
        this.loadUserPreference();
        this.createAvatarSelectorUI();
        this.updateAvatarDisplay();
    }

    // ユーザー設定の読み込み
    loadUserPreference() {
        const saved = localStorage.getItem('avatarSettings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                this.currentAvatar = settings.selectedAvatar || 'inu-buddy';
            } catch (e) {
                console.warn('Failed to load avatar settings:', e);
                this.currentAvatar = 'inu-buddy';
            }
        } else {
            this.currentAvatar = 'inu-buddy';
        }
    }

    // ユーザー設定の保存
    saveUserPreference() {
        const settings = {
            selectedAvatar: this.currentAvatar,
            timestamp: Date.now()
        };
        localStorage.setItem('avatarSettings', JSON.stringify(settings));
    }

    // アバター切り替えUIの作成
    createAvatarSelectorUI() {
        // 設定ボタンの作成
        const settingsButton = document.createElement('button');
        settingsButton.id = 'avatar-settings-btn';
        settingsButton.innerHTML = '⚙️';
        settingsButton.title = 'アバター設定';
        settingsButton.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 40px;
            height: 40px;
            background: rgba(0, 20, 0, 0.8);
            border: 1px solid #0f0;
            color: #0f0;
            font-size: 16px;
            cursor: pointer;
            z-index: 1000;
            border-radius: 4px;
        `;

        // 設定パネルの作成
        const settingsPanel = document.createElement('div');
        settingsPanel.id = 'avatar-settings-panel';
        settingsPanel.style.cssText = `
            position: fixed;
            top: 70px;
            right: 20px;
            width: 300px;
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid #0f0;
            padding: 20px;
            z-index: 1001;
            display: none;
            border-radius: 8px;
            box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
        `;

        // パネル内容の作成
        settingsPanel.innerHTML = `
            <h3 style="color: #0f0; margin-bottom: 15px; text-align: center;">アシスタント選択</h3>
            <div id="avatar-options" style="display: flex; flex-direction: column; gap: 10px;">
                ${this.avatarProfiles.map(profile => `
                    <div class="avatar-option" data-avatar-id="${profile.id}" 
                         style="display: flex; align-items: center; padding: 10px; border: 1px solid #0f0; cursor: pointer; background: rgba(0, 20, 0, 0.3);">
                        <img src="/static/images/${profile.images.idle}" 
                             style="width: 50px; height: 50px; margin-right: 10px; image-rendering: pixelated;">
                        <div>
                            <div style="color: #0f0; font-weight: bold; font-size: 14px;">${profile.displayName}</div>
                            <div style="color: #0a0; font-size: 12px; margin-top: 2px;">${profile.description}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div style="margin-top: 15px; text-align: center;">
                <button id="close-settings" style="background: transparent; border: 1px solid #0f0; color: #0f0; padding: 8px 16px; cursor: pointer; border-radius: 4px;">
                    閉じる
                </button>
            </div>
        `;

        // DOMに追加
        document.body.appendChild(settingsButton);
        document.body.appendChild(settingsPanel);

        // イベントリスナーの設定
        settingsButton.addEventListener('click', () => {
            const panel = document.getElementById('avatar-settings-panel');
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        });

        document.getElementById('close-settings').addEventListener('click', () => {
            document.getElementById('avatar-settings-panel').style.display = 'none';
        });

        // アバター選択イベント
        document.querySelectorAll('.avatar-option').forEach(option => {
            option.addEventListener('click', () => {
                const avatarId = option.dataset.avatarId;
                this.switchAvatar(avatarId);
                document.getElementById('avatar-settings-panel').style.display = 'none';
            });
        });

        // パネル外クリックで閉じる
        document.addEventListener('click', (e) => {
            const panel = document.getElementById('avatar-settings-panel');
            const button = document.getElementById('avatar-settings-btn');
            if (!panel.contains(e.target) && !button.contains(e.target)) {
                panel.style.display = 'none';
            }
        });
    }

    // アバター切り替え
    switchAvatar(avatarId) {
        const profile = this.avatarProfiles.find(p => p.id === avatarId);
        if (!profile) {
            console.error('Avatar profile not found:', avatarId);
            return;
        }

        console.log(`Switching to avatar: ${profile.name} (${profile.images.idle})`);
        
        this.currentAvatar = avatarId;
        
        // 設定を更新（1回だけ）
        this.settings.updateAvatarImages(profile.images.idle, profile.images.talk);
        this.settings.updateAvatarName(profile.displayName);
        
        // アバター表示を更新（直接画像を更新）
        this.updateAvatarDisplay();
        
        // アニメーションマネージャーに新しいアバター情報を通知
        this.updateAnimationManager();
        
        // チャットマネージャーに新しいアバター情報を通知
        this.updateChatManager();
        
        // ユーザー設定を保存
        this.saveUserPreference();
        
        console.log(`Successfully switched to avatar: ${profile.name}`);
    }

    // アバター表示の更新
    updateAvatarDisplay() {
        const profile = this.avatarProfiles.find(p => p.id === this.currentAvatar);
        if (!profile) return;

        const avatarImg = document.getElementById('avatar-img');
        const avatarLabel = document.querySelector('.avatar-label');
        
        if (avatarImg) {
            // 画像のキャッシュを回避するためにタイムスタンプを追加
            const timestamp = new Date().getTime();
            avatarImg.src = `/static/images/${profile.images.idle}?t=${timestamp}`;
            avatarImg.alt = profile.displayName;
            
            // デバッグ用ログ
            console.log(`Avatar image updated to: ${profile.images.idle}`);
        }
        
        if (avatarLabel) {
            avatarLabel.textContent = profile.displayName;
            console.log(`Avatar name updated to: ${profile.displayName}`);
        }

        // 選択中のアバターをハイライト
        document.querySelectorAll('.avatar-option').forEach(option => {
            if (option.dataset.avatarId === this.currentAvatar) {
                option.style.background = 'rgba(0, 255, 0, 0.2)';
                option.style.borderColor = '#0f0';
            } else {
                option.style.background = 'rgba(0, 20, 0, 0.3)';
                option.style.borderColor = '#0f0';
            }
        });
    }

    // アニメーションマネージャーの更新
    updateAnimationManager() {
        const profile = this.avatarProfiles.find(p => p.id === this.currentAvatar);
        if (!profile) return;

        // アニメーションマネージャーに新しい画像を通知
        if (this.animationManager && this.animationManager.updateAvatarImages) {
            this.animationManager.updateAvatarImages(profile.images.idle, profile.images.talk);
            console.log(`AvatarSwitcher: Notified AnimationManager of image change to ${profile.images.idle}`);
        } else {
            console.warn('AnimationManager not available or updateAvatarImages method not found');
        }
    }

    // チャットマネージャーの更新
    updateChatManager() {
        const profile = this.avatarProfiles.find(p => p.id === this.currentAvatar);
        if (!profile) return;

        // チャットマネージャーに新しいアバター名を通知
        if (this.chatManager && this.chatManager.updateAvatar) {
            this.chatManager.updateAvatar(profile.displayName);
            console.log(`AvatarSwitcher: Notified ChatManager of avatar name change to ${profile.displayName}`);
        } else {
            console.warn('ChatManager not available or updateAvatar method not found');
        }
    }

    // 現在のアバタープロファイルを取得
    getCurrentProfile() {
        return this.avatarProfiles.find(p => p.id === this.currentAvatar);
    }

    // 利用可能なアバタープロファイル一覧を取得
    getAvailableProfiles() {
        return this.avatarProfiles;
    }
}
