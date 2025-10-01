/** @format */

var app = getApp();
Component({
	options: {
		addGlobalClass: true
	},
	properties: {
		parameter: {
			type: Object,
			value: {
				class: "app_bg_title"
			}
		}
	},
	data: {
		navH: ""
	},
	ready: function () {
		var pages = getCurrentPages();
		if (pages.length <= 1) this.setData({ "parameter.return": 0 });
	},
	attached: function () {
		this.setData({
			navH: app.globalData.navHeight
		});
	},
        methods: {
                return: function () {
                        const parameter = this.data.parameter || {};
                        const {backTo, backType} = parameter;

                        if (backTo) {
                                const type = backType || 'navigateTo';

                                if (type === 'switchTab') {
                                        wx.switchTab({url: backTo});
                                } else if (type === 'redirect') {
                                        wx.redirectTo({url: backTo});
                                } else if (type === 'reLaunch') {
                                        wx.reLaunch({url: backTo});
                                } else if (type === 'navigateTo') {
                                        wx.navigateTo({url: backTo});
                                } else {
                                        wx.navigateBack();
                                }
                                return;
                        }

                        wx.navigateBack();
                }
        }
});
