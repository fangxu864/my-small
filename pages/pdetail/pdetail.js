//index.js 获取应用实例
var Common = require("../../utils/common.js");
var app = getApp();



Page({

    isUseCache: true, //是否启用缓存

    data: {
        scroll_into_view: "",
        isfixed: "",
        floor_1_active: "active",
        title: "产品详情页",
        land: {},
        ticketList: [],
        taoPiaoTicketList: [],
        isRenderTaoPiaoList: true,
        imgSrcArr: [],
        storage: false,
        canIUseRichText: wx.canIUse('rich-text'),  //兼容富文本组件
        // canIUseRichText: false  //兼容富文本组件
        swiperImgUrls: []
    },

    /**
     * @method 当点击tab时
     * @param e
     */
    onTabTitleTap: function (e) {
        this.setData({ scroll_into_view: e.target.dataset.type, isfixed: "fixed" });
        switch (e.target.dataset.type) {
            case "floor_1":
                this.setData({ floor_1_active: "active", floor_2_active: "", floor_3_active: "" });
                break;
            case "floor_2":
                this.setData({ floor_1_active: "", floor_2_active: "active", floor_3_active: "" });
                break;
            case "floor_3":
                this.setData({ floor_1_active: "", floor_2_active: "", floor_3_active: "active" });
                break;
        }
    },

    /**
     * @method 页面滚动时
     * @param e
     */
    onScroll: function (e) {
        var _this = this;
        function scrollFun(event) {
            var _this = this;

            if (event.detail.scrollTop >= 214) {
                _this.setData({ isfixed: "fixed" })
            } else {
                _this.setData({ isfixed: "" })
            }
        }
        if (!this.scrollCallback) {
            this.scrollCallback = this.selfThrottle(scrollFun, 30);
        }
        this.scrollCallback(e);
    },

    selfThrottle: function (func, wait) {
        var last = 0, now;
        return function () {
            now = Date.now();
            if (now - last > Number(wait)) {
                func.apply(this, arguments);
                last = now;
            }
        }
    },

    /**
     *  初始化页面
     */
    onLoad: function (opt) {
        //转发进来的会有scenCode参数
        if (opt.scenCode) {
            app.globalData.curScenCode = decodeURIComponent(opt.scenCode);
        }

        var lid = this.landId = opt.lid;

        var _this = this;

        //获取景区信息
        this.getScenicInfo(lid);

        //票列表请求
        this.getTicketList(lid);

        // 套票数据
        this.getPackageTicketList(lid);
    },

    /**
     * 获取景区信息
     *
     * @param {any} lid 景区id
     */
    getScenicInfo: function (lid) {
        var cacheHub = app.cacheHub.productDetail;

        var data = {
            lid: lid,
            scenCode: app.globalData.curScenCode
        },
            _this = this;

        var paramKey = "scenicInfo" + JSON.stringify(data);

        if (cacheHub[paramKey] && this.isUseCache) {
            dealRes(cacheHub[paramKey]);
            return;
        }

        Common.request({
            url: "/r/Mall_Product/getLandInfo/",
            data: data,
            loading: function () {
                Common.showLoading()
            },
            complete: function () {
                Common.hideLoading();
            },
            success: function (res) {
                dealRes(res);

            }
        });

        function dealRes(res) {
            if (res.code == 200) {
                cacheHub[paramKey] = res;

                //如果可以使用富文本
                if (_this.data.canIUseRichText) {
                    _this.setData({
                        jqtsRichText: res.data.jqts,
                        bhjqRichText: res.data.bhjq.replace(/\<img/g, '<img class="rich-img"'),
                        jtznRichText: res.data.jtzn,
                        land: res.data,
                    })
                } else {
                    //<br/>替换成“\n”,删除其他标签,多个\n替换成一个\n
                    res.data.jqts = res
                        .data
                        .jqts
                        .replace(/\<br[^\<\>]+\>/g, "\n");
                    res.data.jqts = res
                        .data
                        .jqts
                        .replace(/\<[^\<\>]+\>/g, "");
                    res.data.jqts = res
                        .data
                        .jqts
                        .replace(/\n[\s\n]+/g, "\n");

                    //<br/>替换成“\n”,删除其他标签,多个\n替换成一个\n
                    res.data.jtzn = res
                        .data
                        .jtzn
                        .replace(/\<br[^\<\>]+\>/g, "\n");
                    res.data.jtzn = res
                        .data
                        .jtzn
                        .replace(/\<[^\<\>]+\>/g, "");
                    res.data.jtzn = res
                        .data
                        .jtzn
                        .replace(/\n[\s\n]+/g, "\n");

                    //抽出图片
                    var imgSrcArr = res
                        .data
                        .bhjq
                        .match(/src\=\"[^\"]+\"/g);
                    var srcarr = [];
                    if (imgSrcArr) {
                        for (var i = 0; i < imgSrcArr.length; i++) {
                            var str = imgSrcArr[i].replace(/src\=\"/g, "")
                            srcarr.push(str.replace(/\"/g, ""))
                        }
                        _this.setData({ imgSrcArr: srcarr })
                    }
                    //<br/>替换成“\n”,删除其他标签,多个\n替换成一个\n
                    res.data.bhjq = res
                        .data
                        .bhjq
                        .replace(/\<br[^\<\>]+\>/g, "\n");
                    res.data.bhjq = res
                        .data
                        .bhjq
                        .replace(/\<[^\<\>]+\>/g, "");
                    res.data.bhjq = res
                        .data
                        .bhjq
                        .replace(/\n[\s\n]+/g, "\n");
                    //替换空格
                    res.data.bhjq = res
                        .data
                        .bhjq
                        .replace(/\&nbsp;+/g, " ");
                    _this.setData({ land: res.data});

                }

                if (Common.judgeTrue(res.data.imgpathGrp)) {
                    _this.setData({
                        swiperImgUrls: res.data.imgpathGrp
                    })
                } else {
                    var arr = [];
                    if (res.data.imgpath) {
                        arr.push(res.data.imgpath);
                    } else {
                        arr.push("./images/defaultThum.jpg");
                    }
                    _this.setData({
                        swiperImgUrls: arr
                    })
                }

                //设置title
                wx.setNavigationBarTitle({
                    title: _this.data.land.title || "产品详情"
                });

            } else {
                wx.showModal({
                    title: '提示', content: res.msg,
                })
            }
        }
    },

    /**
     * 票列表请求
     *
     * @param {any} lid 景区id
     */
    getTicketList: function (lid) {
        var cacheHub = app.cacheHub.productDetail;

        var data = {
            lid: lid,
            scenCode: app.globalData.curScenCode
        },
            _this = this;

        var paramKey = "ticketList" + JSON.stringify(data);

        if (cacheHub[paramKey] && this.isUseCache) {
            dealRes(cacheHub[paramKey]);
            return;
        }

        Common.request({
            url: "/r/Mall_Product/getTicketList/",
            data: data,
            loading: function () {
                Common.showLoading()
            },
            complete: function () {
                Common.hideLoading();
            },
            success: function (res) {
                cacheHub[paramKey] = res;
                dealRes(res);
            }
        });

        function dealRes(res) {
            _this.setData({ ticketList: res.data.list })
        }
    },

    /**
     * 套票数据
     *
     * @param {any} lid 景区id
     */
    getPackageTicketList: function (lid) {
        var cacheHub = app.cacheHub.productDetail;

        var data = {
            lid: lid
        },
            _this = this;

        var paramKey = "packageTicketList" + JSON.stringify(data);

        if (cacheHub[paramKey] && this.isUseCache) {
            dealRes(cacheHub[paramKey]);
            return;
        }

        Common.request({
            url: "/r/Mall_Product/getRelatedPackage/",
            data: data,
            loading: function () {
                Common.showLoading()
            },
            complete: function () {
                Common.hideLoading();
            },
            success: function (res) {
                cacheHub[paramKey] = res;
                dealRes(res);
            }
        })

        function dealRes(res) {
            _this.setData({ taoPiaoTicketList: res.data });
            if (res.data.length == 0) {
                _this.setData({ isRenderTaoPiaoList: false })
            }
        }
    },

    /**
     * @method  点击预订按钮时
     */
    onBookBtnTap: function (e) {
        wx.navigateTo({
            url: '../booking/booking?aid=' + e.target.dataset.aid + '&pid=' + e.target.dataset.pid
        });
    },

    /**
     * 打开地图查看位置
     */
    openMap: function () {
        let land = this.data.land;
        wx.openLocation({
            latitude: parseFloat(land.latitude),
            longitude: parseFloat(land.longitude),
            scale: 28
        })
    },

    /**
     * 分享
     */
    onShareAppMessage: function () {
        return {
            title: this.data.land.title,
            path: 'pages/pdetail/pdetail?lid=' + this.data.land.id + "&scenCode=" + app.globalData.curScenCode,
            success: function (res) { },
            fail: function (res) {
                // 转发失败
            }
        }
    },

    /**
     * 拨打电话时
     *
     */
    onPhoneCall: function (e) {
        var curPhoneNumber = e.currentTarget.dataset.phonenum + "";
        wx.makePhoneCall({ phoneNumber: curPhoneNumber })

    },

    //当二维码点击时
    onQrCodeTap: function () {
        var _this = this;
        var data = {
            account: encodeURIComponent(Common.getAccount()),
            // scenCode: encodeURIComponent(app.globalData.curScenCode),
            // page: encodeURIComponent("pages/pdetail/pdetail?lid=" + _this.landId)
            scenCode: encodeURIComponent("pages/pdetail/pdetail?lid=" + _this.landId + "&scenCode=" + app.globalData.curScenCode),
            page: encodeURIComponent("pages/pdetail/pdetail"),
            codeType: 1
        };

        wx.navigateTo({
            url: '../qrcode/qrcode?' + Common.urlStringify(data)
        });
    }

});