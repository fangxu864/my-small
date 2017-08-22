/**
 * @author [fangxu]
 * @email [864109504@qq.com]
 * @create date 2017-08-21 05:49:42
 * @modify date 2017-08-21 05:49:42
 * @desc [description]
*/

//获取应用实例
var Common = require("../../utils/common.js");
var QR = require("../../utils/qrcode.js");
var app = getApp();


/**
 * 行程页面
 */
Page({

    data: {
        scenicData: {
            "code": 200,
            "data": {
                "6603": {
                    "lid": "6603",
                    "pos": "26.083343,119.274381",
                    "orderlist": [
                        {
                            "lid": "6603",
                            "ltitle": "（mm测试）江滨公园",
                            "ordernum": "4022440",
                            "totalmoney": "4022440",
                            "status": "0",
                            "begintime": "2017-08-21",
                            "endtime": "2017-08-21",
                            "ordertime": "2017-08-21",
                            "code": "012938",
                            "paystatus": "1",
                            "cancel": 1,
                            "pay": 0,
                            "tickets": [
                                {
                                    "tnum": "2",
                                    "tid": "31255",
                                    "code": "012938",
                                    "title": "一票一码VIP",
                                    "ordernum": "4022440",
                                    "codes": [
                                        {
                                            "idcard": "",
                                            "checked": "0",
                                            "code": "OD#e2ero501"
                                        },
                                        {
                                            "idcard": "",
                                            "checked": "0",
                                            "code": "OD#e2ero502"
                                        }
                                    ]
                                },
                                {
                                    "tnum": "1",
                                    "tid": "31257",
                                    "code": "012938",
                                    "title": "一票一码成人票",
                                    "ordernum": "4022441",
                                    "codes": [
                                        {
                                            "idcard": "",
                                            "checked": "0",
                                            "code": "OD#pP1prb01"
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            "lid": "6603",
                            "ltitle": "（mm测试）江滨公园",
                            "ordernum": "4022435",
                            "totalmoney": "4022440",
                            "status": "0",
                            "begintime": "2017-08-21",
                            "endtime": "2017-08-21",
                            "ordertime": "2017-08-21",
                            "code": "365409",
                            "paystatus": "1",
                            "cancel": 1,
                            "pay": 0,
                            "tickets": [
                                {
                                    "tnum": "1",
                                    "tid": "31255",
                                    "title": "一票一码VIP",
                                    "ordernum": "4022435",
                                    "codes": [
                                        {
                                            "idcard": "",
                                            "checked": "0",
                                            "code": "OD#0jWbwO01"
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            "lid": "6603",
                            "ltitle": "（mm测试）江滨公园",
                            "ordernum": "4022434",
                            "totalmoney": "4022440",
                            "status": "0",
                            "begintime": "2017-08-21",
                            "endtime": "2017-08-21",
                            "ordertime": "2017-08-21",
                            "code": "479263",
                            "paystatus": "1",
                            "cancel": 1,
                            "pay": 0,
                            "tickets": [
                                {
                                    "tnum": "2",
                                    "tid": "31255",
                                    "title": "一票一码VIP",
                                    "ordernum": "4022434",
                                    "codes": [
                                        {
                                            "idcard": "",
                                            "checked": "0",
                                            "code": "OD#Vp7Rrd01"
                                        },
                                        {
                                            "idcard": "",
                                            "checked": "0",
                                            "code": "OD#Vp7Rrd02"
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                "14944": {
                    "lid": "14944",
                    "pos": "26.039681,119.343038",
                    "orderlist": [
                        {
                            "lid": "14944",
                            "ltitle": "测试景区1111111",
                            "ordernum": "4022481",
                            "totalmoney": "4022440",
                            "status": "0",
                            "begintime": "2017-08-21",
                            "ordertime": "2017-08-21",
                            "endtime": "2017-08-21",
                            "code": "812936",
                            "paystatus": "1",
                            "cancel": 1,
                            "pay": 0,
                            "tickets": [
                                {
                                    "tnum": "2",
                                    "tid": "31260",
                                    "title": "一票一码一身份证老人票",
                                    "ordernum": "4022481",
                                    "codes": [
                                        {
                                            "idcard": "632821198704227934",
                                            "checked": "0",
                                            "code": "OD#mnNabn01"
                                        },
                                        {
                                            "idcard": "652901198907275913",
                                            "checked": "0",
                                            "code": "OD#mnNabn02"
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            },
            "msg": ""
        },
        listWrapShow: "none",
        pageStatusShow: "block",
        pageStatusText: "您还没有行程哦，快去定制吧！",
        landList: [], //景区列表
        orderStatus: { //订单状态
            0: "未使用",
            1: "已使用",
            3: "被取消",
            4: "被替代",
            5: "被终端修改",
            6: "被终端撤销",
            7: "部分使用",
            8: "订单完结",
            9: "被删除"
        }
    },

    onLoad: function () {
        this.getListData();
    },

    onShow: function () {
        var _this = this;
        // var reorderedData = _this.reorderDataByDistance(_this.data.scenicData.data);
        // var codeArr = [];

        // this.setData({
        //     landList: reorderedData
        // })
        // reorderedData.forEach(function (item) {
        //     item.orderlist.forEach(function (item2) {
        //         codeArr.push(item2.code);
        //     })
        // });
        // codeArr.forEach(function (item) {
        //     console.log("canvas" + item)
        //     QR.qrApi.draw("1212", "canvas" + item, "120", "120");
        // })
        // this.getListData();
    },

    getListData: function () {
        var _this = this;
        Common.request({
            url: "/r/Mall_Member/myTravel/",
            data: {},
            loading: function () {
                Common.showLoading();
                _this.setData({
                    pageStatusShow: "block",
                    listWrapShow: "none",
                    pageStatusText: "努力加载中...",
                })
            },
            complete: function () {
                Common.hideLoading();
                wx.stopPullDownRefresh();
            },
            success: function (res) {
                if (code == 200) {
                    if (Common.judgeTrue(res.data)) {
                        var reorderedData = _this.reorderDataByDistance(res.data);
                        var codeArr = [];

                        _this.setData({
                            listWrapShow: "block",
                            landList: reorderedData
                        })
                        reorderedData.forEach(function (item) {
                            item.orderlist.forEach(function (item2) {
                                codeArr.push(item2.code);
                            })
                        });
                        codeArr.forEach(function (item) {
                            console.log("canvas" + item)
                            QR.qrApi.draw("1212", "canvas" + item, "120", "120");
                        })
                        _this.getListData();
                    } else {
                        _this.setData({
                            pageStatusShow: "block",
                            listWrapShow: "none",
                            pageStatusText: "您还没有行程哦，快去定制吧！"
                        })
                    }
                } else {
                    _this.setData({
                        pageStatusShow: "block",
                        listWrapShow: "none",
                        pageStatusText: msg
                    })
                }
            }
        });
    },

    /**
     * 
     * 根据距离对数据进行重新排序
     * @param {Object} data 
     * @returns 
     */
    reorderDataByDistance: function (data) {
        var curlat = Number(app.globalData.curLatitude), //纬度
            curlgt = Number(app.globalData.curLongitude), //经度
            resultArr = [],
            _this = this;


        //如果能获取用户的经纬度，则根据距离重新排序数据
        if (!app.globalData.curLatitude || !app.globalData.curLongitude) {
            for (var land in data) {
                resultArr.push(data[land]);
            }
            return resultArr;
        }

        for (var land in data) {
            resultArr.push(data[land]);
        }

        if (resultArr.length > 1) {
            //返回排序后的数据
            return resultArr.sort(function (a, b) {
                a["dis"] = getSimpleDis(getLat(a.pos), getLgt(a.pos));
                b["dis"] = getSimpleDis(getLat(b.pos), getLgt(b.pos));
                return getSimpleDis(getLat(a.pos), getLgt(a.pos)) - getSimpleDis(getLat(b.pos), getLgt(b.pos))
            })
        }

        function getLat(pos) {
            return Number(pos.split(",")[0]);
        }
        function getLgt(pos) {
            return Number(pos.split(",")[1]);
        }
        function getSimpleDis(lat, lgt) {
            return _this.getDistance(curlat, curlgt, lat, lgt);
        }
    },

    /**
     * 根据经纬度计算距离（单位m）
     * 
     * @param {num} lat1 
     * @param {num} lng1 
     * @param {num} lat2 
     * @param {num} lng2 
     * @returns 
     */
    getDistance: function (lat1, lng1, lat2, lng2) {
        var EARTH_RADIUS = 6378137.0;    //单位M
        var PI = Math.PI;

        function getRad(d) {
            return d * PI / 180.0;
        }
        /**
         * approx distance between two points on earth ellipsoid
         * @param {Object} lat1
         * @param {Object} lng1
         * @param {Object} lat2
         * @param {Object} lng2
         */
        function getFlatternDistance(lat1, lng1, lat2, lng2) {
            var f = getRad((lat1 + lat2) / 2);
            var g = getRad((lat1 - lat2) / 2);
            var l = getRad((lng1 - lng2) / 2);

            var sg = Math.sin(g);
            var sl = Math.sin(l);
            var sf = Math.sin(f);

            var s, c, w, r, d, h1, h2;
            var a = EARTH_RADIUS;
            var fl = 1 / 298.257;

            sg = sg * sg;
            sl = sl * sl;
            sf = sf * sf;

            s = sg * (1 - sl) + (1 - sf) * sl;
            c = (1 - sg) * (1 - sl) + sf * sl;

            w = Math.atan(Math.sqrt(s / c));
            r = Math.sqrt(s * c) / w;
            d = 2 * w * a;
            h1 = (3 * r - 1) / 2 / c;
            h2 = (3 * r + 1) / 2 / s;

            return d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg));
        }

        return getFlatternDistance(lat1, lng1, lat2, lng2);

    },

    /**
     * 点击二维码图片时
     */
    onQrImgTap: function (e) {
        var code = e.currentTarget.dataset.code;
        wx.canvasToTempFilePath({
            canvasId: 'canvas' + code,
            success: function (res) {
                wx.previewImage({
                    current: res.tempFilePath, // 当前显示图片的http链接
                    urls: [res.tempFilePath] // 需要预览的图片http链接列表
                })
            }
        })
    },

    /**
     * 下拉刷新
     */
    onPullDownRefresh: function () {
        this.getListData();
    }

});