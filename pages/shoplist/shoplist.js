/**
 * @author [fangxu]
 * @email [864109504@qq.com]
 * @create date 2017-08-22 02:07:07
 * @modify date 2017-08-22 02:07:07
 * @desc [description]
*/

var Common = require("../../utils/common.js");
var app = getApp();

/**
 * 店铺列表页
 */
Page({

    isUseCache: true,

    data: {
        shopListShow: "block",
        locationText: "当前定位地址",
        shopListArr: [],
        //是否显示状态提示框
        pageStatusShow: "none",
        pageStatusText: "页面状态文本",

        historyShoplist: [
            // {
            //     img:"http://images.12301.cc/shops/123624/14609470368965.jpg",
            //     name:"慢慢的二级店铺",
            //     scenCode:"wxApp#Bp3odO"
            // }
        ]
    },

    onLoad: function () {
        console.log("list-onload");
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
        if (!app.globalData.curLatitude || !app.globalData.curLongitude) {
            this.refreshLocation();
        } else {
            this.getShopListData(app.globalData.curLongitude, app.globalData.curLatitude);
        }

        wx.getStorageInfo({
            success: function (res) {
                console.log(res);
                console.log(res.keys);
                console.log(res.currentSize);
                console.log(res.limitSize)
            }
        })

        //历史访问的店铺
        this.setData({
            historyShoplist: app.historyShop.getShopData()
        })
    },

    /**
     * 刷新位置
     */
    refreshLocation: function () {
        var _this = this;
        wx.getLocation({
            type: 'gcj02',
            success: function (res) {
                //缓存经纬度
                _this.setData({
                    locationText: "当前定位地址"
                });
                app.globalData.curLatitude = res.latitude;
                app.globalData.curLongitude = res.longitude;
                _this.getShopListData(res.longitude, res.latitude);
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
                console.log("cancel")
            },
            success: function (res) {
                app.globalData.curLatitude = res.latitude;
                app.globalData.curLongitude = res.longitude;

                _this.setData({
                    locationText: Common.ellipsis(res.name || res.address, 15)
                });
                _this.getShopListData(res.longitude, res.latitude);
            },
            fail: function (e) {
                console.log(e.errMsg);
                //如果用户拒绝了授权地理位置 'chooseLocation:fail auth deny'
                if (/deny/g.test(e.errMsg)) {
                    console.log("ddd")
                }

            }
        })
    },

    /**
     * 获取店铺列表
     * @param longitude
     * @param latitude
     */
    getShopListData: function (longitude, latitude) {
        var _this = this;
        var cacheKey = JSON.stringify({ longitude: longitude, latitude: latitude });
        //如果有缓存
        if (app.cacheHub.shopList[cacheKey] && this.isUseCache) {
            dealRes(app.cacheHub.shopList[cacheKey]);
            return false;
        }
        Common.request({
            url: "/r/Mall_Mall/getNearbyShop/",
            data: {
                longitude: longitude,
                latitude: latitude
            },
            loading: function () {
                _this.setData({
                    pageStatusShow: "block",
                    shopListShow: "none",
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

            if (code == 200) {
                if (Common.judgeTrue(data)) {
                    res.data.forEach(function (item) {
                        item.aboutus = Common.ellipsis(item.aboutus, 30);
                        item.dist = Number(item.dist).toFixed(2)
                    });
                    _this.setData({
                        shopListShow: "block",
                        pageStatusShow: "none",
                        shopListArr: res.data
                    })
                } else {
                    _this.setData({
                        pageStatusShow: "block",
                        shopListShow: "none",
                        pageStatusText: "暂无数据，请重新选择位置"
                    })
                }
            } else {
                _this.setData({
                    pageStatusShow: "block",
                    shopListShow: "none",
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