var Common = require("../../utils/common.js");
var app = getApp();

/**
 * 店铺列表页
 */
Page({
    data:{},

    onLoad: function () {
        wx.getLocation({
            type: 'gcj02',
            success: function(res) {
                console.log(res);
                var latitude = res.latitude
                var longitude = res.longitude
                var speed = res.speed
                var accuracy = res.accuracy

            }
        });


        Common.request({
                url: "/r/Mall_Product/getTicketList/",
                data: {
                    lid: 212,
                    scenCode:"wxApp#oBvKZ9",
                },
                loading: function () {
                    Common.showLoading()
                },
                complete: function () {
                    Common.hideLoading();
                },
                success: function (res) {
                    //console.log(res);
                    _this.setData({
                        ticketList : res.data.list,
                    })
                }
        });
    },
    onPullDownRefresh: function () {
      setTimeout(function(){
        wx.stopPullDownRefresh()
      }, 500)
    }
})