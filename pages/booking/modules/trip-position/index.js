var tripPostion = {

    _tpos_postionData: [],

    tpos_init: function (data) {
        var _this = this;
        _this._tpos_postionData = [];
        if (this.data.p_type != "B") return false;

        data.assStation.forEach(function(item) {
            if (item != "") {
                _this._tpos_postionData.push(item);
            }
        });

        if (_this._tpos_postionData.length === 0) {
            _this._tpos_postionData.push("暂无集合点");
        }

        this.setData({
            "viewData.tripPosition.curPos": _this._tpos_postionData[0]
        })


    },

    tpos_onPostap: function (e) {

        var _this = this;

        wx.showActionSheet({
            itemList: _this._tpos_postionData,
            success: function (res) {
                _this.setData({
                    "viewData.tripPosition.curPos": _this._tpos_postionData[res.tapIndex]
                })
            },
            fail: function (res) {
                console.log(res.errMsg)
            }
        })

    }

}


module.exports = tripPostion;