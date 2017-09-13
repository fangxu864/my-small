var Common = require("../../../../utils/common.js");
var MinueToDayTime = Common.MinueToDayTime;

var smallTips = {

    stips_init: function (data) {

        var _this = this;

        //游玩有效期
        this.stips_validTime(data);

        //验证时间  
        this.stips_verifyTime(data);

        //退票规则
        this.stips_refund_rule(data);

        //退票规则文本
        this.stips_refund_rule_text(data);

        //得出并设置退票规则文本
        this.stips_getRefundTicketRuleText(data);

        //每日最多使用
        this.stips_batchDay(data);

    },

    /**
     * 游玩有效期
     * 
     * @param {any} data 
     */
    stips_validTime: function (data) {
        var validTime = data.validTime;
        var text = "";
        if (validTime == 0) {
            text = "仅当天有效";
        } else {
            var pre = data.validType == 1 ? "下单后" : "游玩日期后";
            if (validTime.indexOf("~") < 0) {
                text = (pre + validTime + "天内有效");
            } else {
                text = (pre + validTime + "内有效");
            }
        }

        this.setData({
            "viewData.smallTips.validTime": text
        })
    },

    /**
     * 验证时间（全天都可验时，不显示）
     * 
     * @param {any} data 
     */
    stips_verifyTime: function (data) {
        //验证时间（全天都可验时，不显示）
        //"verifyTime": -1  -1表示不限验证时间, [0,1,3,4,5,6]表示周一周二周四周五周六周日可验, 2016-08-01~2016-08-10表示此时间段可验
        var verifyTime = data.verifyTime, text = '';
        var verifyTimeResult = "限";
        if (verifyTime == -1) {
            data["verifyTime"] = "";
        } else if (Object.prototype.toString.call(verifyTime) == "[object Array]") {
            for (var i in verifyTime) {
                var str = {
                    0: "周日",
                    1: "周一",
                    2: "周二",
                    3: "周三",
                    4: "周四",
                    5: "周五",
                    6: "周六"
                }[verifyTime[i]];
                verifyTimeResult += (str + " ");
            }
            text = (verifyTimeResult + "使用");
        } else {
            text = "限" + verifyTime + "使用";
        }
        this.setData({
            "viewData.smallTips.verifyTime": text
        })
    },

    /**
     * 退票规则文本
     * 
     * @param {any} data 
     */
    stips_refund_rule_text: function (data) {
        //2不可退，1游玩日期前可退，0有效期前可退
        var refund_rule = data.refund_rule, refund_rule_text = "";
        var refund_early_time = MinueToDayTime(data.refund_early_time);
        if (refund_rule == 1) {
            refund_rule_text = "有效期前" + refund_early_time + "可退";
        } else if (refund_rule == 0) {
            refund_rule_text = "游玩日期前可退";
        } else if (refund_rule == 2) {
            refund_rule_text = "不可退";
        } else if (refund_rule == 3) {
            refund_rule_text = "随时退";
        }

        this.setData({
            "viewData.smallTips.refund_rule_text": refund_rule_text
        })
    },

    /**
     * 退票规则
     * 
     * @param {any} data 
     */
    stips_refund_rule: function (data) {
        //2不可退，1游玩日期前可退，0有效期前可退
        var refund_rule = data.refund_rule;
        this.setData({
            "viewData.smallTips.refund_rule": refund_rule
        })
    },

    /**
     * 每日最多使用
     * 
     * @param {any} data 
     */
    stips_batchDay: function (data) {
        var batch_check = data.batch_check;
        var batch_day = data.batch_day,
            text = "";
        if (batch_check == 1 && batch_day != 0) { //开启分批验证 并且不能设置为不限验证数
            text = "本次提交的订单，每日最多使用" + batch_day + "张";
        }

        this.setData({
            "viewData.smallTips.batch_day": text
        })
    },

    /**
	 * 得出并设置退票规则文本
	 * 
	 * @param {any} data 
	 */
    stips_getRefundTicketRuleText: function (data) {
        //2不可退，1游玩日期前可退，0有效期前可退 3随时退
        if (data.refund_rule == 2) return false;
        var baseChargeText = "", //基础扣费文本
            ladderChargeTextArr = []; //阶梯扣费


        //基础扣费 reb_type 0百分比 1固定金额
        if (data.reb_type == 1) {
            if (Number(data.reb) == 0) {
                baseChargeText = "退票不收取手续费"
            } else {
                baseChargeText = "基础扣费：" + Number(data.reb) / 100 + "元"
            }

        } else {
            if (Number(data.reb) == 0) {
                baseChargeText = "退票不收取手续费"
            } else {
                baseChargeText = "基础扣费：票价的" + data.reb + "%"
            }
        }

        //阶梯扣费
        if (Common.judgeTrue(data.cancel_cost)) {
            var arr = data.cancel_cost;
            arr.forEach(function (item, index) {
                //c_type 1百分比 0固定金额
                if (item.c_type == 1) {
                    ladderChargeTextArr.push(beginTimePerfix() + MinueToDayTime(item.c_days) + "内，收取手续费：票价的" + Number(item.c_cost) / 100 + "%");
                } else {
                    ladderChargeTextArr.push(beginTimePerfix() + MinueToDayTime(item.c_days) + "内，收取手续费：" + Number(item.c_cost) / 100 + "元");
                }
            })
        }

        function beginTimePerfix(p_type) {
            return {
                "A": "游玩日期前",
                "B": "集合日期前",
                "C": "入住日期前",
                "F": "游玩日期前",
                "H": "演出日期前"
            }[data.p_type]
        }

        this.setData({
            "viewData.smallTips.refundTicketRuleText": {
                "ladderTextList": ladderChargeTextArr,
                "baseText": baseChargeText
            }
        })

        
    },

    /**
	 * 打开简单消息提示
	 */
	stips_toggleDialog: function () {
        var _this = this;
		this.setData({
			"viewData.smallTips.dialogshow": !_this.data.viewData.smallTips.dialogshow
        })
    }

}

module.exports = smallTips;