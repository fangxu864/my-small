/**
 * Author: huangzhiyang
 * Date: 2017/1/6 10:26
 * Description: ""
 */
//获取应用实例
var Common = require("../../utils/common.js");
var QR = require("../../utils/qrcode.js");
var app = getApp();
Page({
    data : {
        code: ''
    },

    /**
     *  初始化页面
     */
    onLoad: function( opt ) {
        var _this = this;
        //凭证码
        var code = decodeURIComponent( opt.code );
        this.setData({
            code: code
        });
        QR.qrApi.draw( code ,"qrcodeCanvas","300","300");
    },


    /**
     * 点击二维码图片时
     */
    onQrImgTap: function () {
        wx.canvasToTempFilePath({
            canvasId: 'qrcodeCanvas',
            success: function(res) {
                wx.previewImage({
                    current: res.tempFilePath, // 当前显示图片的http链接
                    urls: [res.tempFilePath] // 需要预览的图片http链接列表
                })
            }
        })
    }

});