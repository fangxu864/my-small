/**
 * @author [fangxu]
 * @email [864109504@qq.com]
 * @create date 2017-09-20 02:03:43
 * @modify date 2017-09-20 02:03:43
 * @desc [description]
*/


var Common = require("../../utils/common.js");
var App = getApp();


var indexBiz = {

    //业务数据
    biz_data: {
        carNum: '' //车牌号
    },

    biz_debugData: {
        "code": 200,
        "msg": "成功",
        "data": {
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
            }
        },
        aid:"94"
    },

    /**
     * 根据车牌号来查询数据
     * 
     * @param {any} carNo 
     */
    biz_query: function (carNo) {

        var _this = this;

        Common.request({
            debug: false,
            url: "/r/AppCenter_HaboDockApi/getParkOrder/",
            data: {
                carno: carNo,
                scanCode: App.globalData.curScenCode
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

                // var res = _this.biz_debugData;
                if (res.code == 200) {

                    App.myfeeCache = res.data;
                    wx.navigateTo({
                        url: '../myfee/myfee'
                    })

                } else {
                    wx.showModal({
                        title: "未查询到" + carNo + "的车辆",
                        content: res.msg.Message || "请确认您输入的车牌号无误，且车辆停放本停车场或已支付",
                        showCancel: false
                    })
                }
            }
        });
    }
}


module.exports = indexBiz;