// const baseUrl = 'http://60.205.2.186/XunJieCarApp/'
 //const baseUrl = "https://acc.dakakj.com/ACCCheJieHuiApp/";
//const baseUrl = "http://192.168.100.7:8080/ACCCheJieHuiApp/";
  //const baseUrl = "http://127.0.0.1:8080/ACCCheJieHuiApp/";
// const baseUrl = "http://127.0.0.1:8080/";
   	// const baseUrl = "https://acc.dakakj.com/";
	// const baseUrl = "http://acc.dakakj.com:8080/";
// const baseUrl = "http://192.168.0.101:8080/ACCCheJieHuiApp/";
// const baseUrl = 'http://60.205.207.233/XunJieCarApp/'


// config.js
let baseUrl = "http://127.0.0.1:8080/"; // 默认开发环境

// 判断运行环境
const accountInfo = wx.getAccountInfoSync();
const envVersion = accountInfo.miniProgram.envVersion;
// 可能的值: "develop"（开发版），"trial"（体验版），"release"（正式版）

if (envVersion === "release") {
  baseUrl = "https://acc.dakakj.com/";   // 正式环境
} else if (envVersion === "trial") {
  baseUrl = "https://acc.dakakj.com/"; // 体验环境
} else {
  baseUrl = "http://127.0.0.1:8080/";   // 开发环境
}

console.info(envVersion)

module.exports = {
  baseUrl,
};

