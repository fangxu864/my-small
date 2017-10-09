/**
 * @author [fangxu]
 * @email [864109504@qq.com]
 * @create date 2017-09-20 02:03:19
 * @modify date 2017-09-20 02:03:19
 * @desc [description]
*/


var Common = require("../../utils/common.js");
var App = getApp();

Page({

    data: {

        "CarNo": "闽DRV500",
        "State": 1,
        "Message": "成功",
        "Order": {
            "CarNo": "闽DRV500",
            "ParkId": "0B95306F-7AC2-4F70-BE20-F533A6829FC8",
            "ParkName": "123624",
            "Account": "123624",
            "CarImg": "",
            "Message": "外来车辆:闽DRV500|入场:09-07 14:32|停车:14天23分|应收费:66元",
            "MemberType": "外来车辆",
            "InTime": "2017-09-07 14:32:48",
            "OutTime": "2017-09-21 14:55:45",
            "Price": "71.00",
            "Balance": "0.00",
            "PayPrice": "5.00",
            "NoPayPrice": "0.01"
        },

        stayTime: "14天23分" //停车时长

    },

    onLoad: function () {
        this.setData(App.myfeeCache);
        this.setData({
            stayTime: App.myfeeCache.Order.Message.split("|")[2].split(":")[1]
        })
    },

    /**
     * 点击支付按钮时
     *
     * 第一步：根据订单信息请求微信支付参数
     * 第二步：根据返回的微信支付参数发起微信支付
     *
     */
    onPay: function () {
        var _this = this;
        var oData = this.data;
        Common.request({
            debug: false,
            url: "/r/AppCenter_HaboDockPayApi/order/",
            data: {
                "scanCode": App.globalData.curScenCode,
                "appid": Common.appId,
                "PayAppid": Common.appId,
                "subject": "停车场小程序支付",  //描述
                "carNo": oData.Order.CarNo //车牌牌号码
            },
            loading: function () {
                wx.showLoading({
                    title: "努力加载中..",
                    mask: true
                })
            },
            complete: function (res) {
                wx.hideLoading();
            },
            success: function (res) {

                // var res = _this.debug_data;
                if (res.code == 200) {
                    console.log(res);
                    var oData = res.data.data;

                    var requestObj = {};
                    requestObj["timeStamp"] = oData["timeStamp"];
                    requestObj["nonceStr"] = oData["nonceStr"];
                    requestObj["package"] = oData["package"];
                    requestObj["signType"] = oData["signType"];
                    requestObj["paySign"] = oData["paySign"];
                    requestObj["success"] = function (res) {
                        if (res.errMsg == "requestPayment:ok") {
                            //进行支付成功校验
                            _this.checkPaySuccess(oData["order_no"]);
                        }
                    }
                    requestObj["fail"] = function (res) {
                        console.log(res);
                    }

                    wx.requestPayment(requestObj)

                } else {
                    wx.showModal({
                        title: "提示",
                        content: res.msg || "暂无数据",
                        showCancel: false
                    })
                }
            }
        });
    },

    /**
     * 检查支付是否成功
     * 
     * @param {any} order_no 
     */
    checkPaySuccess: function (order_no) {
        
        if (!order_no) return console.log("校验-订单号没有");

        Common.request({
            debug: false,
            url: "/r/AppCenter_HaboDockPayApi/payResultCheck/",
            data: {
                "order_no": order_no //订单号
            },
            loading: function () {
                wx.showLoading({
                    title: "支付检测中..",
                    mask: true
                })
            },
            complete: function (res) {
                wx.hideLoading();
            },
            success: function (res) {

                if (res.code == 200) {
                    wx.showModal({
                        title: "提示",
                        content: "支付成功",
                        showCancel: false
                    })
                } else if (res.code == 501) {
                    _this.checkePayTimer = setTimeout(function () {
                        _this.checkPaySuccess(order_no);
                    },3000)
                } else {
                    wx.showModal({
                        title: "提示",
                        content: res.msg,
                        showCancel: false
                    })
                }
               
            }
        });

    }



})