var Common = require("../../utils/common.js");
var app = getApp();

/**
 * 店铺列表页
 */
Page({
    data:{},

    onLoad: function () {
       
    },
    onPullDownRefresh: function () {
      setTimeout(function(){
        wx.stopPullDownRefresh()
      }, 500)
    }
})