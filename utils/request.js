import {baseUrl} from '../config'

function promptReLogin() {
    try {
        const pages = getCurrentPages();
        if (!pages || !pages.length) return;

        const currentPage = pages[pages.length - 1];
        if (currentPage && currentPage.setData && currentPage.data) {
            if (currentPage.data.iShidden !== undefined) {
                currentPage.setData({ iShidden: false });
            }
            if (typeof currentPage.showLoginPopup === 'function') {
                currentPage.showLoginPopup();
            }
        }
    } catch (error) {
        console.warn('promptReLogin failed', error);
    }
}

export default function request(api, method, data = {},) {
    // 配置请求根路径
    let reqData = prepareRequestData({key: "value"});
    let contentType = reqData.isJSON ? 'application/json' : 'application/x-www-form-urlencoded'

    let params = {}
    if (wx.getStorageSync('agent-id')) {
        params = {...params, ...{
            'content-type': contentType,
                'agent-id': wx.getStorageSync('agent-id'),
                'agent-token': wx.getStorageSync('agent-token'),
                'address_id': wx.getStorageSync('address_id')
        }}
    }
    if (wx.getStorageSync('lt-id')) {
      params = {...params, ...{
              'content-type': contentType,
              'lt-id': wx.getStorageSync('lt-id'),
              'lt-token': wx.getStorageSync('lt-token'),
              'address_id': wx.getStorageSync('address_id')
          }}
    }

    return new Promise((reslove, reject) => {
        wx.request({
            url: baseUrl + api,
            method: method || 'GET',
            header: params,
            data: data || {},
            success: (res) => {
                if (res.data.code == "000") {
                    reslove(res.data, res);
                } else if (res.data.code == "999") {
                    const message = res && res.data ? res.data.data : undefined;
                    if (typeof message === 'string' && (message.includes('需要登录') || message === '需要登陆')) {
                        if (!wx.getStorageSync('toLogin')) {
                            wx.removeStorageSync('lt-id')
                            wx.removeStorageSync('lt-token')
                            wx.removeStorageSync('avatarUrl')
                            wx.removeStorageSync('nickName')
                            wx.removeStorageSync('openid')
                            wx.removeStorageSync('userInfo')
                            // wx.clearStorageSync()
                        }
                        wx.showToast({
                            title: '登录已过期，请重新登录',
                            icon: 'none'
                        });
                        wx.setStorageSync('toLogin', true);
                        promptReLogin();
                    }
                    if (message == '代理商需要登录！' || message == '账号异常！') {
                        wx.removeStorageSync('agent-id')
                        wx.removeStorageSync('agent-token')
                        wx.removeStorageSync('agent_info')
                        wx.showModal({
                            title: '提示',
                            content: message,
                            showCancel: false,
                            success: res2 => {
                                if (res2.confirm) {
                                    wx.switchTab({
                                        url: '/pages/user/user',
                                    })
                                    // wx.reLaunch({
                                    //   url: '/paginate/shezhi/shezhi',
                                    // })
                                }
                            }
                        })
                        // wx.redirectTo({
                        //   url: '/paginate/shezhi/login?identity=代理',
                        // })
                    }
                    if (message == '商家需要登录！') {
                        wx.removeStorageSync('shoper-id')
                        wx.removeStorageSync('shoper-token')
                        wx.removeStorageSync('shoper_info')
                        wx.showModal({
                            title: '提示',
                            content: message,
                            showCancel: false,
                            success: res2 => {
                                if (res2.confirm) {
                                    wx.reLaunch({
                                        url: '/paginate/user/user',
                                    })
                                }
                            }
                        })
                    }
                    reject(res.data.data)
                } else {
                    reslove(res, res);
                }
            },
            fail: (msg) => {
                reject('请求失败');
            }
        })
    });
}


function prepareRequestData(data) {
    if (typeof data === 'object' && data !== null) {
        return {
            data: JSON.stringify(data),
            isJSON: true
        };
    }

    try {
        JSON.parse(data);
        return {
            data: data,
            isJSON: true
        };
    } catch (e) {
        return {
            data: data,
            isJSON: false
        };
    }
}

['options', 'get', 'post', 'put', 'head', 'delete', 'trace', 'connect'].forEach((method) => {
    request[method] = (api, data) => request(api, method, data)
});

