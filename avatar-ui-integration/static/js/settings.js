/**
 * アプリケーション設定モジュール
 * サーバーサイドから渡される設定値を管理
 */
export const createSettings = (config) => ({
    ...config,
    // アバター画像のパスを生成（動的に現在の設定を参照）
    getAvatarImagePath: function(isIdle = true) {
        const imageName = isIdle ? this.avatarImageIdle : this.avatarImageTalk;
        console.log(`Settings: getAvatarImagePath called with isIdle=${isIdle}, imageName=${imageName}`);
        return `/static/images/${imageName}`;
    },
    
    // アバター切り替え用の設定更新メソッド
    updateAvatarImages: function(idleImage, talkImage) {
        this.avatarImageIdle = idleImage;
        this.avatarImageTalk = talkImage;
        console.log(`Settings: Updated images - idle: ${idleImage}, talk: ${talkImage}`);
    },
    
    // アバター名の更新メソッド
    updateAvatarName: function(name) {
        this.avatarName = name;
        console.log(`Settings: Updated avatar name to ${name}`);
    }
});