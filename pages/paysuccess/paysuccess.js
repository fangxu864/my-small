/**
 * @author [fangxu]
 * @email [864109504@qq.com]
 * @create date 2017-08-15 05:13:56
 * @modify date 2017-08-15 05:13:56
 * @desc [description]
*/

//获取应用实例
var Common = require("../../utils/common.js");
var QR = require("../../utils/qrcode.js");
var app = getApp();
Page({
	data: {
		whitchTemplate: "scenic",
		infoData: {}
	},


	/**
	 *  初始化页面
	 */
	onLoad: function (opt) {
		var _this = this;
		var ordernum = opt.ordernum;
		if (!ordernum) {
			ordernum = 3317797;
		}
		Common.request({
			url: "/r/Mall_Order/paySuccess/",
			data: {
				ordernum: ordernum
			},
			loading: function () {
				Common.showLoading()
			},
			complete: function () {
				Common.hideLoading();
			},
			success: function (res) {
				if (res.code == 200) {
					QR.qrApi.draw(res.data.qrcode, "qrcodeCanvas", "200", "200");
					var ptype = res.data.ptype;
					switch (ptype) {
						case "A":    //景区
							_this.setData({
								whitchTemplate: "scenic",
								infoData: res.data
							});
							break;
						case "B":    //线路
							_this.setData({
								whitchTemplate: "route",
								infoData: res.data
							});
							break;
						case "C":     //酒店
							_this.setData({
								whitchTemplate: "hotel",
								infoData: res.data
							});
							break;
						case "F":     //套票
							_this.setData({
								whitchTemplate: "scenic",
								infoData: res.data
							});
							break;
						case "H":     //演出
							_this.setData({
								whitchTemplate: "show",
								infoData: res.data
							});
							break;
						case "I":     //年卡
							_this.setData({
								whitchTemplate: "scenic",
								infoData: res.data
							});
							break;
						case "G":     //餐饮
							_this.setData({
								whitchTemplate: "scenic",
								infoData: res.data
							});
							break;
						default:      //默认景区
							_this.setData({
								whitchTemplate: "scenic",
								infoData: res.data
							});
					}
				}
			}
		})
	},


	/**
	 * goToIndex
	 */
	goToIndex: function () {
		wx.switchTab({
			url: '../ordercenter/ordercenter'
		});
	},

	/**
     * 点击二维码图片时
     */
	onQrImgTap: function () {
		wx.canvasToTempFilePath({
			canvasId: 'qrcodeCanvas',
			success: function (res) {
				wx.previewImage({
					current: res.tempFilePath, // 当前显示图片的http链接
					urls: [res.tempFilePath] // 需要预览的图片http链接列表
				})
			}
		})
	}
})