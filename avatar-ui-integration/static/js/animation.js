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
        
        // タイプライター処理キュー
        this.typewriterQueue = [];
        this.isTyping = false;
        this.streamHasEnded = false;
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
        console.log('AnimationManager: stopMouthAnimation() called, talkingInterval:', this.talkingInterval);
        if (this.talkingInterval) {
            clearInterval(this.talkingInterval);
            this.talkingInterval = null;
            console.log('AnimationManager: Mouth animation interval cleared');
        }
        // アイドル状態に戻す
        const idlePath = this.settings.getAvatarImagePath(true);
        this.avatarImg.src = idlePath;
        console.log('AnimationManager: Avatar set to idle state:', idlePath);
    }

    // タイプライター効果（フォールバック用）
    typeWriter(element, text) {
        return new Promise((resolve) => {
            if (!text) text = '';
            let i = 0;
            this.startMouthAnimation();
            
            const type = () => {
                if (i < text.length) {
                    element.textContent += text.charAt(i++);
                    this.output.scrollTop = this.output.scrollHeight;
                    if (text.charAt(i-1) !== ' ') this.soundManager.playTypeSound();
                    setTimeout(type, this.settings.typewriterDelay);
                } else {
                    this.stopTalking();
                    resolve();
                }
            };
            type();
        });
    }

    // ストリーミングテキストをキューに追加
    appendText(element, text) {
        this.typewriterQueue.push(text);
        if (!this.isTyping) {
            this._processQueue(element);
        }
    }

    // キューを処理するメインのタイプライター関数
    _processQueue(element) {
        if (this.typewriterQueue.length === 0) {
            this.isTyping = false;
            console.log('AnimationManager: Typewriter queue is empty, isTyping set to false');
            
            // キューが空になったら短時間後にアニメーション停止をチェック
            setTimeout(() => {
                if (this.typewriterQueue.length === 0) {
                    console.log('AnimationManager: Queue still empty after delay, stopping animation');
                    this.stopTalking();
                }
            }, 500); // 500ms後に再チェック
            return;
        }

        this.isTyping = true;
        const text = this.typewriterQueue.shift();
        let i = 0;

        const type = () => {
            if (i < text.length) {
                element.textContent += text.charAt(i++);
                this.output.scrollTop = this.output.scrollHeight;
                if (text.charAt(i-1) !== ' ') this.soundManager.playTypeSound();
                setTimeout(type, this.settings.typewriterDelay);
            } else {
                // 現在のチャンクが完了したら、次のチャンクを処理
                this._processQueue(element);
            }
        };
        type();
    }
    
    // ChatManagerからストリーム終了を通知
    signalStreamEnd() {
        console.log("AnimationManager: Stream end signaled.");
        this.streamHasEnded = true;
        
        // ストリーム終了後、短時間でアニメーション停止をチェック
        setTimeout(() => {
            console.log(`AnimationManager: Stream end check - isTyping: ${this.isTyping}, queue length: ${this.typewriterQueue.length}`);
            if (!this.isTyping && this.typewriterQueue.length === 0) {
                console.log("AnimationManager: Stream ended and typing completed, stopping animation");
                this.stopTalking();
            }
        }, 200); // 200ms後にチェック
    }

    // 話し終わり（ストリーミング用）
    startTalking() {
        console.log('AnimationManager: startTalking() called');
        this.startMouthAnimation();
    }

    stopTalking() {
        console.log('AnimationManager: stopTalking() called');
        this.stopMouthAnimation();
        // 音響効果も停止
        this.soundManager.stopAllSounds();
    }
}