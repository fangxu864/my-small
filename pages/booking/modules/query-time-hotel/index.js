var qureyTimeHotel = {

    /**
     * 点击开始日期
     * 
     */
    qth_beginTimeChange: function (e) {
        //用户选取的时间
        var date = e.detail.value, _this = this;
        var endDate = this.data.viewData.qureyTimeMode.endDate;

        //更新视图数据
        this.setData({
            'viewData.qureyTimeMode.beginDate': date
        })

        if (date > endDate || endDate == "") {
            //更新视图数据
            this.setData({
                'viewData.qureyTimeMode.endDate': _this.qth_addDay(date, 1)
            })
        }

        this._qth_dateChange();
    },

    /**
     * 点击结束日期
     * 
     */
    qth_endTimeChange: function (e) {

        //用户选取的时间
        var endDate = e.detail.value, _this = this;
        var beginDate = this.data.viewData.qureyTimeMode.beginDate;

        //更新视图数据
        this.setData({
            'viewData.qureyTimeMode.endDate': endDate
        })

        // if (date < endDate || endDate == "") {
        //     //更新视图数据
        //     this.setData({
        //         'viewData.qureyTimeMode.endDate': _this.qth_addDay(date, 1)
        //     })
        // }

        // //如果开始时间大于结束时间
        // if (beginDate > endDate) {

        // }

        this._qth_dateChange();

    },


    /**
     * 当日期改变时
     * 
     */
    _qth_dateChange: function () {

        var beginDate = this.data.viewData.qureyTimeMode.beginDate;
        var endDate = this.data.viewData.qureyTimeMode.endDate;

        var diffDays = this.qth_GetDateDiff(beginDate, endDate);

        this.setData({
            'viewData.qureyTimeMode.diffDays': diffDays
        })


        //请求价格库存
        // this.biz_getHotelPriceAndStorage(beginDate,endDate);
    },

    /**
     * 获取本模块的业务数据
     * 
     */
    qth_getBizData: function () {

        return {
            "begintime": this.data.viewData.qureyTimeMode.beginDate,
            "endDate": this.data.viewData.qureyTimeMode.endDate
        }
    },


    /**
     * 日期加减
     * 
     * @param {any} dateTime 2017-06-09
     * @param {any} number 5
     * @returns 
     */
    qth_addDay: function (dateTime, number) {

        var dateStr = dateTime.replace(/\-/g, "\/");
        var date = new Date(dateStr);
        date.setDate(date.getDate() + number);
        var y = date.getFullYear();
        var m = date.getMonth() + 1;
        var d = date.getDate();
        if (m < 10) m = "0" + m;
        if (d < 10) d = "0" + d;
        return y + "-" + m + "-" + d;

    },

    /**
     * 计算两个日期间的天数
     * 
     * @param {any} startDate 
     * @param {any} endDate 
     * @returns 
     */
    qth_GetDateDiff: function (startDate, endDate) {
        var startTime = new Date(Date.parse(startDate.replace(/-/g, "/"))).getTime();
        var endTime = new Date(Date.parse(endDate.replace(/-/g, "/"))).getTime();
        var dates = Math.abs((startTime - endTime)) / (1000 * 60 * 60 * 24);
        return dates;
    }

}

module.exports = qureyTimeHotel;