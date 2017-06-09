var Common = require("../../utils/common.js");
var app = getApp();


/**
 * 店铺列表页
 */
Page({
    data:{
        shopListShow: "block",
        locationText:"当前定位地址",
        shopListArr: [],
        //是否显示状态提示框
        pageStatusShow: "none",
        pageStatusText:"页面状态文本"
    },

    onLoad: function () {


    },

    /**
     * 下拉刷新更新经纬度
     */
    onPullDownRefresh: function () {
        var _this = this;
        this.refreshLocation();
    },

    onShow: function () {
        var _this = this;
        //如果不存在经纬度
        if( !app.globalData.curLatitude || !app.globalData.curLongitude ){
            this.refreshLocation();
        }else{
            this.getShopListData(app.globalData.curLongitude ,app.globalData.curLatitude);
        }
    },

    /**
     * 刷新位置
     */
    refreshLocation: function () {
        var _this = this;
        wx.getLocation({
            type: 'gcj02',
            success: function(res) {

                //缓存经纬度
                _this.setData({
                    locationText: "当前定位地址"
                });
                app.globalData.curLatitude = res.latitude;
                app.globalData.curLongitude = res.longitude;
                _this.getShopListData(res.longitude , res.latitude);
            },
            fail: function () {
                _this.setData({
                    locationText: "定位失败，请手动选择"
                });
            },
            complete: function () {
                wx.stopPullDownRefresh();
            }
        });
    },

    /**
     * 用户进行手动选择定位
     * @param e
     */
    onTopTitleTap: function (e) {
        var _this = this;
        wx.chooseLocation({
            cancel: function () {
            },
            success: function (res) {
                _this.setData({
                    locationText: Common.ellipsis( res.name || res.address , 15 )
                });
                _this.getShopListData(res.longitude , res.latitude);
            },
            fail: function () {
            }
        })
    },

    /**
     * 获取店铺列表
     * @param longitude
     * @param latitude
     */
    getShopListData: function ( longitude , latitude ) {
        var _this = this;
        var cacheKey = JSON.stringify({longitude: longitude ,latitude: latitude});
        //如果有缓存
        if( app.cacheHub.shopList[cacheKey] ){
            dealRes(app.cacheHub.shopList[cacheKey]);
            return false;
        }
        console.log("请求" ,longitude ,latitude);
        Common.request({
            url: "/r/Mall_Mall/getNearbyShop/",
            data: {
                longitude: longitude,
                latitude:latitude
            },
            loading: function () {
                _this.setData({
                    pageStatusShow : "block",
                    shopListShow:"none",
                    pageStatusText: "数据请求中..."
                });
                Common.showLoading()
            },
            complete: function () {
                Common.hideLoading();
            },
            success: function (res) {
                app.cacheHub.shopList[cacheKey] = res;
                dealRes(res);
            }
        });

        function dealRes(res) {
            var code = res.code;
            var data = res.data;
            var msg = res.msg;

            if( code == 200 ){
                if(Common.judgeTrue(data)){
                    _this.setData({
                        shopListShow:"block",
                        pageStatusShow : "none",
                        shopListArr : res.data
                    })
                }else{
                    _this.setData({
                        pageStatusShow : "block",
                        shopListShow:"none",
                        pageStatusText: "暂无数据，请重新选择位置"
                    })
                }
            }else{
                _this.setData({
                    pageStatusShow : "block",
                    shopListShow:"none",
                    pageStatusText: msg
                })
            }

        }
    },

    /**
     * 店铺列表项点击时
     * @param e
     */
    onShopItemTap: function (e) {
        app.globalData.curScenCode = e.currentTarget.dataset.scencode;
        wx.switchTab({
            url: '../index/index'
        });
    }

});