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
            remainNum: function () { 
                return (Math.random() * 10000).toFixed(0);
            }
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


                var res = _this.debug_data;
                if (res.code == 200) {

                    _this.setData({
                        "remainNum": res.data.remainNum(),
                        "updateTime": Common.getNowFormatDate()
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



})