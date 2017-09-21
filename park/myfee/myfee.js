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

        carNo: "",
        bTime: "",
        eTime: "2017-09-18 08:33:55",
        stayHour: "1",
        stayMinute: "39",
        alreadyMoney: "0.00",
        baseMoney: "12.00"

    },

    onLoad: function () {
        this.setData(App.myfeeCache)
    }



})