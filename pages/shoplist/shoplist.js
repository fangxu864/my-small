var Common = require("../../utils/common.js");
var app = getApp();


/**
 * 店铺列表页
 */
Page({
    data:{
        locationText:"已自动定位",
        shopListArr: []
    },

    onLoad: function () {
        var _this = this;
        wx.getLocation({
            type: 'gcj02',
            success: function(res) {
                _this.latitude = res.latitude;
                _this.longitude = res.longitude;

                Common.request({
                    url: "/r/Mall_Mall/getNearbyShop/",
                    data: {
                        longitude: _this.longitude,
                        latitude:_this.latitude
                    },
                    loading: function () {
                        Common.showLoading()
                    },
                    complete: function () {
                        Common.hideLoading();
                    },
                    success: function (res) {
                        _this.setData({
                            shopListArr : res.data
                        })
                    }
                });
            }
        });

    },
    onPullDownRefresh: function () {
      setTimeout(function(){
        wx.stopPullDownRefresh()
      }, 500)
    },

    onTopTitleTap: function (e) {
        var _this = this;
        wx.chooseLocation({
            cancel: function () {
            },
            success: function (res) {
                _this.setData({
                    locationText: Common.ellipsis( res.name || res.address , 15 )
                });
                // Common.showError("sss",res.address)
            },
            fail: function () {
            }
        })
    },

    onShopItemTap: function (e) {
        console.log(e)
        app.globalData.curScenCode = e.currentTarget.dataset.scencode;
        wx.switchTab({
            url: '../index/index'
        });
    },

});