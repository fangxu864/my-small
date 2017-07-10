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
    }

});