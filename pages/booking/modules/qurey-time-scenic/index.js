/**
 * @author [fangxu]
 * @email [864109504@qq.com]
 * @create date 2017-09-11 03:17:17
 * @modify date 2017-09-11 03:17:17
 * @desc [description]
*/

var Common = require("../../../../utils/common.js");


/**
 * 景区类时间选取模块（景区。线路。套票。演出）
 */

var qureyTimeScenic = {


    /**
     * 开始时间变化时
     * 
     * @param {any} result 
     */
    qts_beginTimeChange: function (result) {
        //用户选取的时间
        var date = result.detail.value;

        this._qts_dateChange(date);
    },


    /**
     * 今天和明天列表点击
     * 
     * @param {any} e 
     */
    qts_dateItemTap: function (e) {
        var date = e.currentTarget.dataset.date;
        if (this.data.viewData.qureyTimeMode.beginDate == date) return false;
        this._qts_dateChange(e.currentTarget.dataset.date);
    },


    /**
     * 当日期改变时
     * 
     * @param {any} date 
     */
    _qts_dateChange: function (date) {
        var isShowTwo = false;
        //判断用户选取的时间是否是今天或明天
        if (date == Common.getToday() || date == Common.getTomorrow()) {
            isShowTwo = true;
        }
        //更新视图数据
        this.setData({
            'viewData.qureyTimeMode.beginDate': date,
            'viewData.qureyTimeMode.isShowTwo': isShowTwo
        })
        // //更新业务数据
        // this.biz_updateData({
        //     "begintime": date
        // })

        //请求价格库存
        this.biz_queryPriceAndStore(date);
    },

    /**
     * 获取本模块的业务数据
     * 
     */
    qts_getBizData: function () {
        
        return {
            "begintime": this.data.viewData.qureyTimeMode.beginDate
        }
    }
    
    


}

module.exports = qureyTimeScenic;