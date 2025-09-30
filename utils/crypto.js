/**
 * 数据解密工具
 */

// AES解密示例（根据实际加密方式调整）
const decryptData = (encryptedData) => {
    if (!encryptedData) return '';

    try {
        // 这里使用微信官方解密方法作为示例
        // 实际应根据您的加密方式实现
        const result = wx.getSystemInfoSync();
        const key = result.platform === 'android' ? 'android-key' : 'ios-key';

        // 伪代码，替换为您的实际解密逻辑
        // const decrypted = AES.decrypt(encryptedData, key);
        // return decrypted.toString(CryptoJS.enc.Utf8);

        // 临时模拟解密
        return encryptedData.split('').reverse().join('');
    } catch (e) {
        console.error('解密失败:', e);
        return encryptedData; // 解密失败返回原数据
    }
};

// Base64解码示例
const base64Decode = (str) => {
    if (!str) return '';
    return decodeURIComponent(escape(atob(str)));
};

module.exports = {
    decryptData,
    base64Decode
};