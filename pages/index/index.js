//index.js
//获取应用实例
var app = getApp(),
    common = require('../../utils/common.js');
var QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js');
var qqmapsdk;
Page({

    isUseCache: true, //是否启用缓存

    onShareAppMessage: function () {
        var _this = this;
        return {
            title: _this.curShopName,
            path: 'pages/index/index?scene=' + app.globalData.curScenCode,
            success: function (res) { },
            fail: function (res) {
                // 转发失败
            }
        }
    },
   

    data: {
        plist: [],
        hasMore: true,
        isHasMoreHidden: false,
        isLoading: false,
        pageSize: 10,
        lastPos: 0,
        searchInpFocus: false,
        searchVal: '',
        isClearShow: false,
        noData: false,
        hasKeyword: false,
        lastSearch: '',
        //当前店铺名称
        curShopName: ''
    },

    /**
     * 页面加载时
     * 
     * @param {any} opt 
     */
    onLoad: function (opt) {
        //如果用户是扫码进来的话,会有scenCode,则将scenCode缓存至app.globalData.curScenCode
        if (opt.scene) {
            app.globalData.curScenCode = decodeURIComponent(opt.scene);
        }
    },

    getData: function (opt) {
        var that = this,
            keyword = opt.keyword || '';

        if (!this.data.hasMore) return;

        if (!this.data.isLoading) {

            var data = {
                keyword: keyword,
                topic: '',
                type: 'all',
                city: '',
                pageSize: this.data.pageSize,
                lastPos: this.data.lastPos,
                scenCode: app.globalData.curScenCode
            };

            var paramsKey = JSON.stringify(data);

            var cacheHub = app.cacheHub.index;
            //判断缓存，有的话就不发请求了
            if (cacheHub[paramsKey] && that.isUseCache) {
                dealRes(cacheHub[paramsKey]);
                return;
            }
            common.request({
                url: '/r/Mall_Product/productList/',
                data: data,
                debug: false,
                loading: function () {
                    if (opt.loading) {

                        opt.loading();

                    } else {

                        that.setData({
                            isLoading: true
                        })

                    }
                },
                complete: function (res) {
                    opt.complete && opt.complete(res);
                },
                success: function (res) {
                    cacheHub[paramsKey] = res;
                    dealRes(res)
                }
            })
            function dealRes(res) {
                if (!opt.loading) {
                    that.setData({
                        isLoading: false
                    });
                }
                opt.success && opt.success(res);
            }
        } else {
            console.log('正在请求  请稍后');
        }
    },

    //事件处理函数
    navigateToDetail: function (e) {
        var currentTarget = e.currentTarget,
            dataset = currentTarget.dataset,
            lid = dataset.lid,
            ptype = dataset.ptype,
            topic = dataset.topic;

        wx.navigateTo({
            url: '../pdetail/pdetail?lid=' + e.currentTarget.dataset.lid
        });
    },

    //滚动到底部时
    scrollToLower: function (e) {
        var that = this;

        this.getData({
            keyword: this.data.searchVal,

            complete: function (res) { },

            success: function (res) {
                that.setData({
                    plist: that.data.plist.concat(res.data.list),
                    lastPos: res.data.lastPos
                });

                if (res.data.lastPos == that.data.lastPos) {
                    that.setData({
                        hasMore: false
                    });
                }
            }
        })
    },

    searchIconTap: function () {
        this.setData({
            searchInpFocus: true
        })
    },

    searchInput: function (e) {
        this.setData({
            searchVal: e.detail.value
        });

        if (this.trim(e.detail.value) != '') {
            this.setData({
                hasKeyword: true,
                isClearShow: true
            })
        } else {
            this.setData({
                hasKeyword: false,
                isClearShow: false
            })

            //当inp啥内容也没有时，调用下搜索
            this.search();
        }
        
    },

    clearSearch: function () {
        this.setData({
            searchVal: '',
            hasKeyword: false,
            isClearShow: false
        })
    },

    //搜索时
    search: function () {
        var that = this;

        that.setData({
            hasMore: true,
            lastPos: 0,
            lastSearch: this.data.searchVal
        });

        that.getData({
            keyword: this.data.searchVal,
            loading: function () {
                that.setData({
                    noData: false
                });

                common.showLoading();
            },

            complete: function (res) { },

            success: function (res) {
                common.hideLoading();

                that.setData({
                    plist: res.data.list,
                    lastPos: res.data.lastPos
                });

                if (res.data.list.length) { } else {
                    that.setData({
                        noData: true
                    })
                }
            }
        })
    },

    //去除前后空格
    trim: function (str) {
        return str.replace(/(^\s*)|(\s*$)/g, '');
    },

    //当页面显示时
    onShow: function () {
        var that = this;
        //重置下数据
        that.setData({
            plist: [],
            hasMore: true,
            isHasMoreHidden: false,
            isLoading: false,
            pageSize: 10,
            lastPos: 0,
            searchInpFocus: false,
            searchVal: '',
            isClearShow: false,
            noData: false,
            hasKeyword: false,
            lastSearch: ''
        });

        //如果有scenCode,获取数据；没有，跳到附近的店铺列表
        if (app.globalData.curScenCode) {
            this.getData({
                keyword: '',
                loading: function () {
                    common.showLoading();
                },

                complete: function (res) { },

                success: function (res) {
                    common.hideLoading();

                    that.setData({
                        plist: res.data.list,
                        lastPos: res.data.lastPos,
                        shopInfo: res.data.shopInfo,
                        curShopName: res.data.shopInfo.name
                    });
                    wx.setNavigationBarTitle({
                        title: res.data.shopInfo.name
                    });


                    if (res.data.list.length) {

                    } else {
                        that.setData({
                            noData: true
                        })
                    }
                }
            });
        } else {
            wx.navigateTo({
                url: '../shoplist/shoplist'
            })
        }
    },

    //当切换店铺时
    onSwitchShop: function () {
        wx.navigateTo({
            url: '../shoplist/shoplist'
        })
    },

    //当二维码点击时
    onQrCodeTap: function () {
        var data = {
            account: common.getAccount(),
            scenCode: app.globalData.curScenCode
        };

        wx.navigateTo({
            url: '../qrcode/qrcode?' + common.urlStringify(data)
        });
    }

});

/**
 * 下面是干嘛用的，先备注起来
 */
// qqmapsdk = new QQMapWX({
//    key: '55VBZ-XBTR4-KA3UD-XYWNM-IJJHE-KIFIY'
// });
// qqmapsdk.search({
//   keyword: '酒店',
//   success: function (res) {
//     console.log(res);
//   },
//   fail: function (res) {
//     console.log(res);
//   },
//   complete: function (res) {
//     console.log(res);
//   }
// })