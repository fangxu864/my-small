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

        code: 200,
        data: {
            carNo: "豫S7D578",
            bTime: "2017-09-18 08:33:55",
            eTime: "2017-09-18 08:33:55",
            stayHour: "1",
            stayMinute: "39",
            alreadyMoney: "0.00",
            baseMoney: "12.00"
        },
        msg: ""

    },

    /**
     * 根据车牌号来查询数据
     * 
     * @param {any} carNo 
     */
    biz_query: function (carNo) {

        var _this = this;

        Common.ajax({
            debug: true,
            url: 'test.php', //仅为示例，并非真实的接口地址
            data: {
                x: '',
                y: ''
            },
            loading: function () {
                wx.showLoading({
                    title: "努力加载中..",
                    mask: true
                })
            },
            success: function (res) {


                var res = _this.biz_debugData;
                if (res.code == 200) {

                    App.myfeeCache = res.data;
                    wx.navigateTo({
                        url: '../myfee/myfee'
                    })

                } else {
                    wx.showModal({
                        title: "提示",
                        content: res.msg || "暂无数据",
                        showCancel: false
                    })
                }

            },
            complete: function () {
                wx.hideLoading();
            }
        })
    }
}


module.exports = indexBiz;