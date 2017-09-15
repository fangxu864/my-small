/**
 * @author [fangxu]
 * @email [864109504@qq.com]
 * @create date 2017-09-15 03:49:56
 * @modify date 2017-09-15 03:49:56
 * @desc [description]
*/


var Common = require("../../../../utils/common.js");

//场次信息模块
var showInfo = {


    // roundid	int	场馆信息, 演出类才有
    // venusid	int	场次信息, 演出类才有
    // zoneid	int	区域信息, 演出类才有
    _sinfo_selected_data: {
        roundid:"",
        venusid:"",
        zoneid:""
    },

    _sinfo_Data: [],

    sinfo_init: function (data) {
        if (this.data.p_type != "H") return false;

        this._sinfo_selected_data.zoneid = data.tickets[0]["zone_id"];

        var newTicketList = this.data.viewData.ticketList.ticketList.map(function (ticket) {
            ticket["zone_name"] = data.tickets[0]["zone_name"];
            return ticket;
        })

        this.tlist_dataChange(newTicketList);

        // var date = this.qts_getBizData().begintime || Common.getToday();
        var date = Common.getToday();

        this.sinfo_getShowInfoData(date);

    },

    sinfo_onOptTap: function (e) {

        var _this = this;
        var listdata = [];
        _this._sinfo_Data.forEach(function (item) {
            listdata.push(item.opttext);
        });

        wx.showActionSheet({
            itemList: listdata,
            success: function (res) {
                var option = _this._sinfo_Data[res.tapIndex];
                _this.setData({
                    "viewData.showInfo.curOpt": option["opttext"]
                })
                _this._sinfo_selected_data["roundid"] = option["roundid"];
                _this._sinfo_selected_data["venusid"] = option["venusid"];

            },
            fail: function (res) {
                console.log(res.errMsg)
            }
        })

    },

    /**
     * 渲染场次信息
     * 
     */
    sinfo_render: function () {
        var _this = this, data = _this._sinfo_Data;

        if (data.length == 0) {
            this.setData({
                "viewData.showInfo.curOpt": "暂无场次信息"
            })
        } else {
            this.setData({
                "viewData.showInfo.curOpt": data[0]["opttext"]
            })
            _this._sinfo_selected_data["roundid"] = data[0]["roundid"];
            _this._sinfo_selected_data["venusid"] = data[0]["venusid"];
        }
    },

    /**
     * 获取场次信息数据
     * 
     */
    sinfo_getShowInfoData: function (date) {

        this._sinfo_Data = [];

        var _this = this;
        var pid = this.data.pid;
        var aid = this.data.aid;


        Common.request({
            url: "/r/Mall_Product/getShowInfo/",
            data: {
                pid: pid,
                aid: aid,
                date: date
            },
            loading: function () {
                Common.showLoading()
            },
            complete: function () {
                Common.hideLoading();
            },
            success: function (res) {

                var code = res.code;
                var data = res.data;


                if (code == 200) {
                    if (Common.judgeTrue(data)) {
                        data.forEach(function (item) {
                            var element = {};
                            element.round_name = item.round_name; //场次名称
                            element.bTime = item.bt; //场次开始时间
                            element.eTime = item.et; //场次结束时间
                            element.roundid = item.id; //场馆id
                            element.venusid = item.venus_id; //场次id
                            element.opttext = item.round_name + "  " + item.bt + "-" + item.et;


                            var store = item.area_storage[_this._sinfo_selected_data.zoneid];

                            var newTicketList = _this.data.viewData.ticketList.ticketList.map(function (ticket) {
                                ticket["store"] = store;
                                return ticket;
                            })
            
                            _this.tlist_dataChange(newTicketList);

                           
                            _this._sinfo_Data.push(element);
                        });
                        _this.sinfo_render();
                    }
                }

            }
        })
    },

    /**
     * 获取业务数据
     * 
     */
    sinfo_getBizData: function () {
        return this._sinfo_selected_data;
    }

    

}


module.exports = showInfo;