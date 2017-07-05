var Common = require("../../utils/common.js");
var app = getApp();


/**
 * 二维码页
 */
Page({
    
    data: {
        qrImgSrc: ''
    },

    /**
     * 页面加载时
     * @param opt
     */
    onLoad: function ( opt ) {
        var _this = this;
        Common.request({
            url: "/r/Mall_Mall/getPageAppCode",
            data: {
                account: opt.account,
                scenCode: opt.scenCode
            },
            loading: function () {
                Common.showLoading("二维码加载中");
            },
            complete: function () {

            },
            success: function ( res ) {
                _this.setData({
                    qrImgSrc: res.data.url
                })
            }
        })

    },

    /**
     * 点击保存按钮
     */
    onPreviewImage: function () {
        let urls = [];
        urls.push( this.data.qrImgSrc );
        wx.previewImage({
            urls: urls // 需要预览的图片http链接列表
        })
    },

    /**
     * 图片加载完成
     */
    onQrImgLoadEnd: function () {
        Common.hideLoading();
    }
    
    
    
});