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
            stayTime:  App.myfeeCache.Order.Message.split("|")[2].split(":")[1]
        })
    }



})