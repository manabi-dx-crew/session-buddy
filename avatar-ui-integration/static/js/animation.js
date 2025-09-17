/**
 * アニメーション管理モジュール
 * タイプライター効果と口パクアニメーションを管理
 */
export class AnimationManager {
    constructor(settings, soundManager) {
        this.settings = settings;
        this.soundManager = soundManager;
        this.talkingInterval = null;
        this.avatarImg = document.getElementById('avatar-img');
        this.output = document.getElementById('output');
    }

    // 口パクアニメーション開始
    startMouthAnimation() {
        if (this.talkingInterval) {
            this.stopMouthAnimation();
        }

        let mouthOpen = false;
        this.talkingInterval = setInterval(() => {
            const imagePath = this.settings.getAvatarImagePath(!mouthOpen);
            this.avatarImg.src = imagePath;
            console.log(`AnimationManager: Mouth animation - mouthOpen: ${!mouthOpen}, imagePath: ${imagePath}`);
            mouthOpen = !mouthOpen;
        }, this.settings.mouthAnimationInterval);
    }

    // アバター画像の動的更新（アバター切り替え時）
    updateAvatarImages(idleImage, talkImage) {
        // 設定を更新
        this.settings.updateAvatarImages(idleImage, talkImage);
        
        // 現在話していない場合は、新しいアイドル画像に切り替え
        if (!this.talkingInterval) {
            const timestamp = new Date().getTime();
            // 設定から正しい画像パスを取得
            this.avatarImg.src = `${this.settings.getAvatarImagePath(true)}?t=${timestamp}`;
            console.log(`AnimationManager: Updated avatar image to ${idleImage} (idle state)`);
        } else {
            // 話している場合は、口パクアニメーションを再開して新しい画像を使う
            console.log(`AnimationManager: Restarting mouth animation with new images - idle: ${idleImage}, talk: ${talkImage}`);
            this.startMouthAnimation();
        }
    }

    // 口パクアニメーション停止
    stopMouthAnimation() {
        if (this.talkingInterval) {
            clearInterval(this.talkingInterval);
            this.talkingInterval = null;
        }
        // アイドル状態に戻す
        this.avatarImg.src = this.settings.getAvatarImagePath(true);
    }

    // タイプライター効果
    typeWriter(element, text) {
        return new Promise((resolve) => {
            // textがundefinedやnullの場合は空文字列にフォールバック
            if (!text) {
                text = '';
            }
            
            let i = 0;
            
            // 口パクアニメーション開始
            this.startMouthAnimation();
            
            const type = () => {
                if (i < text.length) {
                    element.textContent += text.charAt(i++);
                    this.output.scrollTop = this.output.scrollHeight;
                    
                    // スペース以外で音を鳴らす
                    if (text.charAt(i-1) !== ' ') {
                        this.soundManager.playTypeSound();
                    }
                    
                    setTimeout(type, this.settings.typewriterDelay);
                } else {
                    // 完了時：口を閉じる
                    this.stopMouthAnimation();
                    resolve();
                }
            };
            
            type();
        });
    }

    // ストリーミング用のテキスト追加
    async appendText(element, text) {
        return new Promise((resolve) => {
            let i = 0;
            
            const type = () => {
                if (i < text.length) {
                    element.textContent += text.charAt(i++);
                    this.output.scrollTop = this.output.scrollHeight;
                    
                    // スペース以外で音を鳴らす
                    if (text.charAt(i-1) !== ' ') {
                        this.soundManager.playTypeSound();
                    }
                    
                    setTimeout(type, this.settings.typewriterDelay);
                } else {
                    resolve();
                }
            };
            
            type();
        });
    }

    // 話し始め（ストリーミング用）
    startTalking() {
        this.startMouthAnimation();
    }

    // 話し終わり（ストリーミング用）
    stopTalking() {
        this.stopMouthAnimation();
    }
}