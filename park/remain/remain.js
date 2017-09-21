/**
 * @author [fangxu]
 * @email [864109504@qq.com]
 * @create date 2017-09-20 02:03:06
 * @modify date 2017-09-20 02:03:06
 * @desc [description]
*/

var Common = require("../../utils/common.js");
var App = getApp();


Page({

    data: {
        remainNum: 66666,
        updateTime: "00-00-00 00:00:00",
    },

    debug_data: {

        code: 200,
        data: {
            Surplus: function () { 
                return (Math.random() * 10000).toFixed(0);
            },
            Message: "成功",
            Stete: 1,
            Account: "100014"
        },
        msg: ''
    },

    onLoad() {
        console.log(6666);
        this.getRemainData();
    },

    /**
     * 获取剩余车位数量
     * 
     */
    getRemainData() {

        var _this = this;

        Common.request({
            debug: true,
            url: "/r/AppCenter_HaboDockApi/getHaboParkSurplus/",
            data: { sceneCode: App.globalData.curScenCode },
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

                var res = _this.debug_data;
                if (res.code == 200) {

                    _this.setData({
                        "remainNum": res.data.Surplus(),
                        "updateTime": Common.getNowFormatDate()
                    })

                } else {
                    wx.showModal({
                        title: "提示",
                        content: res.msg || "暂无数据",
                        showCancel: false
                    })
                }
            }
        });

    }



})