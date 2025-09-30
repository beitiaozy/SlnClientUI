const jm = require("./aes.js");
 
//  硬件方提供的key,开发文档会说明的
// var key = "3a60432a5c01211f291e0f4e0c132825";
var key = '58494e4a5955455a4e2e434f4d303531'
// 加密
function encryptionData(data) {
  var byteKey = jm.CryptoJS.enc.Hex.parse(key);
  var byteData = jm.CryptoJS.enc.Hex.parse(data);
  var encrypt = jm.CryptoJS.AES.encrypt(byteData, byteKey, { mode: jm.CryptoJS.mode.ECB, padding: jm.CryptoJS.pad.NoPadding });
  var encryptedStr = encrypt.ciphertext.toString();
  return encryptedStr;
}
//解密
function decryptData(data) {
  var byteKey = jm.CryptoJS.enc.Hex.parse(key);
  var byteData = jm.CryptoJS.enc.Hex.parse(data);
  byteData = jm.CryptoJS.enc.Base64.stringify(byteData);
  var decrypt = jm.CryptoJS.AES.decrypt(byteData, byteKey, { mode: jm.CryptoJS.mode.ECB, padding: jm.CryptoJS.pad.NoPadding });
  var decryptedStr = decrypt.toString(jm.CryptoJS.enc.Hex);
  return decryptedStr.toString();
}
 
module.exports = {
  decryptData, //  解密
  encryptionData, //  加密
}
