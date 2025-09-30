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
			wx.navigateBack();
		}
	}
});
