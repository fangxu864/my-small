var comContact = require("./contact.js");

var touristInfo = {

    tinfo_init: function (data) {

		//初始化需要身份证的总个数
		if (data.needID == 2) {
			this.setData({
                "viewData.touristInfo.touristInfoTotalNum": data.tickets[0]["buy_low"],
                "viewData.touristInfo.needID": data.needID
			})
		}

	},


    /**
     * 联系人手机input的blur事件
     * @param e
     */
    onContacttelInpBlur: function (e) {
        var detail = e.detail;
        var value = detail.value;
        if (value.length != 11 || isNaN(value)) {
            this.setData({ "viewData.touristInfo.contacttelErrTipShow": true })
        } else {
            this.setData({ "viewData.touristInfo.contacttelErrTipShow": false })
        }
    },
    onOrderNameInpBlur: function (e) {
        var detail = e.detail;
        var value = detail.value;
        if (!value) {
            this.setData({ "viewData.touristInfo.orderNameErrTipShow": true })
        } else {
            this.setData({ "viewData.touristInfo.orderNameErrTipShow": false })
        }
    },
    onContacttelInpChange: function (e) {
        var detail = e.detail;
        var value = detail.value;
        this.setData({
            contacttel: value
        })
        if (value.length == 11 && !isNaN(value)) this.setData({ "viewData.touristInfo.contacttelErrTipShow": false })
    },
    onOrderNameInpChange: function (e) {
        var detail = e.detail;
        var value = detail.value;
        this.setData({
            "viewData.touristInfo.ordername": value
        })
        this.setData({ "viewData.touristInfo.orderNameErrTipShow": value ? false : true })
    },
    onIDCardInpBlur: function (e) {
        var detail = e.detail;
        var value = detail.value;
        var result = Common.validateIDCard(value);
        this.setData({ "viewData.touristInfo.needIDErrTipShow": result ? false : true })
    },
    onIDCardInpChange: function (e) {
        var detail = e.detail;
        var value = detail.value;
        this.setData({ "viewData.touristInfo.sfz": value });
        if (value.length == 18 || value.length == 15) {
            var result = Common.validateIDCard(value);
            this.setData({ "viewData.touristInfo.needIDErrTipShow": result ? false : true })
        }
    },




	/**
	 * 关闭常用联系人
	 */
    closeCommonContact: function () {
        this.setData({
            "viewData.touristInfo.contactDisplay": "none"
        })
    },

	/**
	 * 点击添加常用联系人
	 */
    onAddContactTap: function () {
        this.setData({
            "viewData.touristInfo.contactDisplay": "block",
            "viewData.touristInfo.contactData": comContact.getContactArr()
        })
    },



	/**
	 * 点击常用联系人
	 * 包括选择和删除
	 */
    comContactItemTap: function (e) {
        var tel = e.currentTarget.dataset.tel || "";
        var name = e.currentTarget.dataset.name || "";
        var id = e.currentTarget.dataset.id || "";
        this.setData({
            "viewData.touristInfo.ordername": name,
            "viewData.touristInfo.sfz": id,
            "viewData.touristInfo.contacttel": tel,
            "viewData.touristInfo.contactDisplay": "none"
        })
    },

	/**
	 * 删除联系人
	 * @param e
     */
    delContactTap: function (e) {
        var _this = this;
        var tel = e.currentTarget.dataset.tel;
        comContact.delContact(tel, function () {
            _this.setData({
                "viewData.touristInfo.contactData": comContact.getContactArr()
            })
        });

    },

	/**
	 * 游客信息编辑
	 */
    onEditTouristTap: function (e) {
        var total = e.currentTarget.dataset.total;
        var arr = this.touristIdcardList.getListData(total);

        this.setData({
            "viewData.touristInfo.idcardListWrapDisplay": "block",
            "viewData.touristInfo.touristInfoArr": arr
        })
    },

	/**
	 * 游客信息关闭
	 */
    closeIdcardListWrap: function () {
        var _this = this;
        this.setData({
            "viewData.touristInfo.idcardListWrapDisplay": "none",
            "viewData.touristInfo.touristInfoAlreadyNum": _this.touristIdcardList.getOkNum()
        })

    },

	/**
	 * 游客身份信息输入框blur事件
	 * 
	 * @param {any} e 
	 */
    onTouristInpBlur: function (e) {
        var dataset = e.currentTarget.dataset,
            index = dataset.index,
            type = dataset.type,
            value = e.detail.value;
        this.touristIdcardList.addData(index, type, value);
    },

    IdcardListWrapConfirm: function () {
        if (this.touristIdcardList.checkData()) {
            this.closeIdcardListWrap();
        }
    },

	/**
	 * 一票一身份证的相关操作
	 */
    touristIdcardList: {

        //存储的游客信息数据,格式如下
        // [
        // {name:"fsdf",idcard:"1234564521212"},
        // {name:"fsdf",idcard:"1234564521212"},
        // ]
        _listData: [],

		/**
		 * 获取游客信息数据
		 * 输入游客个数，输出相同长度游客信息数组
		 * 
		 * @param {any} length 
		 */
        getListData: function (length) {
            var curLen = this._listData.length,
                wantLenth = Number(length);

            if (curLen == wantLenth) {
                //长度相等
                return this._listData;
            } else if (curLen > wantLenth) {
                //存储的数组长度大于想要的数组长度
                this._listData.length = wantLenth;
                return this._listData;
            } else {
                this.loop(wantLenth - curLen, function () {
                    this._listData.push({
                        name: "",
                        idcard: ""
                    });
                }.bind(this));
                return this._listData;
            }
        },

		/**
		 * 增加数据
		 * 
		 * @param {any} index 数据索引
		 * @param {any} type 数据类型（名称或身份证）
		 * @param {any} value 值
		 */
        addData: function (index, type, value) {
            this._listData[index][type] = value;
        },

		/**
		 * 校验数据的正确与错误
		 * 
		 */
        checkData: function () {
            var text = "", allOk = true, i = 0;

            for (i; i < this._listData.length; i++) {

                if (this._listData[i].name == "") {
                    text = "第" + (i + 1) + "位游客的姓名不能为空";
                    wx.showModal({
                        title: "提示",
                        content: text,
                        showCancel: false
                    })
                    allOk = false;
                    break;
                }
                if (!Common.validateIDCard(this._listData[i].idcard)) {
                    text = "第" + (i + 1) + "位游客的身份证填写错误";
                    wx.showModal({
                        title: "提示",
                        content: text,
                        showCancel: false
                    })
                    allOk = false;
                    break;
                }
            }

            return allOk;
        },

		/**
		 * 获取身份正确填写的个数
		 * 
		 */
        getOkNum: function () {
            var okNum = 0, allOk = true;
            this._listData.forEach(function (item, index) {
                if (item.name != "" && Common.validateIDCard(item.idcard)) {
                    okNum++;
                }
            })
            return okNum;
        },

        getTouristNameArr: function () {
            var arr = [];
            this._listData.forEach(function (item, index) {
                arr.push(item.name);
            })
            return arr;
        },

        getTouristIdArr: function () {
            var arr = [];
            this._listData.forEach(function (item, index) {
                arr.push(item.idcard);
            })
            return arr;
        },

        loop: function (times, callback) {
            var times = Number(times);
            for (var i = 0; i < times; i++) {
                callback();
            }
        }
    }
}

module.exports = touristInfo;