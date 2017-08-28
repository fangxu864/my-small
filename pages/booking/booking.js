var Common = require("../../utils/common.js");
var MinueToDayTime = Common.MinueToDayTime;
var comContact = require("./contact.js");
var app = getApp();
Page({
	data: {
		today: Common.getToday(),
		isReady: false,
		begintime: Common.getToday(),
		aid: "",
		pid: "",
		isSubmitLoading: false,
		totalMoney: 0,
		contacttel: "12301",
		ordername: "小程序购票",
		sfz: "",
		needIDErrTipShow: false,
		contacttelErrTipShow: false,
		orderNameErrTipShow: false,
		ticketList: [],
		canSubmit: true,
		contactDisplay: "none", // 常用联系人是否显示
		simpleMsgPopDisplay: "none", // 简单显示信息是否显示
		idcardListWrapDisplay: "none", //身份证列表是否显示
		contactData: {},
		refundTicketRuleText: "退票规则",
		touristInfoTotalNum: 0,//共计需要身份证的数量
		touristInfoAlreadyNum: 0,//已正确填写身份证的数量
		touristInfoArr: [],//联系人数组

	},
	onReady: function () {
		var that = this;
		var data = this.data;
		var pid = data.pid;
		var aid = data.aid;


		if (pid && aid) {
			this.queryBookingInfo(pid, aid);
		} else {
			wx.showModal({
				title: "提示",
				content: "缺少pid或aid",
				showCancel: false
			})
		}

	},
	onLoad: function (option) {
		this.setData({
			aid: option.aid || "3385",
			pid: option.pid || "6698"
		})
	},
	onShow: function () { },
	onHide: function () { },
	/**
	 * 点击票数增加减少的按钮时
	 * 
	 * @param {any} e 
	 * @returns 
	 */
	onCountBtnTap: function (e) {
		var dataset = e.currentTarget.dataset;
		var type = dataset.type;
		var value = dataset.value * 1;
		var store = dataset.store * 1;
		var buyup = dataset.buyup * 1;
		var buylow = dataset.buylow * 1;
		var isMain = dataset.ismain;
		var ticketId = dataset.id;
		if (type == "add") {
			if (value >= store && store != -1) {
				return wx.showModal({
					title: '提示',
					content: "库存不足",
					showCancel: false
				})
			}
			if (value >= buyup && buyup != -1) {
				return wx.showModal({
					title: '提示',
					content: "限购" + buyup + "张",
					showCancel: false
				})
			}

			value = value + 1;
			if (value < buylow) value = buylow;


		} else if (type == "minus") {
			if (value <= buylow && value != -1 && isMain) {
				return wx.showModal({
					title: '提示',
					content: buylow + "张起订",
					showCancel: false
				})
			}
			if (value < 0) {
				return wx.showModal({
					title: '提示',
					content: "票数不能为负数",
					showCancel: false
				})
			}
			if (value == 0 && isMain) {
				return wx.showModal({
					title: '提示',
					content: "主票票数不能为0",
					showCancel: false
				})
			}

			value = value - 1;
			//如果非主票，且票数小于最少起购数，则直接把数据置为0
			if (!isMain && value < buylow) value = 0;
		}

		var newTicketList = this.data.ticketList.map(function (ticket) {
			var pid = ticket.pid;
			var aid = ticket.aid;
			if (ticketId == (pid + "-" + aid)) {
				ticket["value"] = value;
			}
			return ticket;
		});

		this.setData({ ticketList: newTicketList });

		this.calTotalMoney();

		//刷新需要的身份证数量
		this.setData({
			touristInfoTotalNum: value
		})



	},

	/**
	 * 联系人手机input的blur事件
	 * @param e
     */
	onContacttelInpBlur: function (e) {
		var detail = e.detail;
		var value = detail.value;
		if (value.length != 11 || isNaN(value)) {
			this.setData({ contacttelErrTipShow: true })
		} else {
			this.setData({ contacttelErrTipShow: false })
		}
	},
	onOrderNameInpBlur: function (e) {
		var detail = e.detail;
		var value = detail.value;
		if (!value) {
			this.setData({ orderNameErrTipShow: true })
		} else {
			this.setData({ orderNameErrTipShow: false })
		}
	},
	onContacttelInpChange: function (e) {
		var detail = e.detail;
		var value = detail.value;
		this.setData({
			contacttel: value
		})
		if (value.length == 11 && !isNaN(value)) this.setData({ contacttelErrTipShow: false })
	},
	onOrderNameInpChange: function (e) {
		var detail = e.detail;
		var value = detail.value;
		this.setData({
			ordername: value
		})
		this.setData({ orderNameErrTipShow: value ? false : true })
	},
	onIDCardInpBlur: function (e) {
		var detail = e.detail;
		var value = detail.value;
		var result = Common.validateIDCard(value);
		this.setData({ needIDErrTipShow: result ? false : true })
	},
	onIDCardInpChange: function (e) {
		var detail = e.detail;
		var value = detail.value;
		this.setData({ sfz: value });
		if (value.length == 18 || value.length == 15) {
			var result = Common.validateIDCard(value);
			this.setData({ needIDErrTipShow: result ? false : true })
		}
	},
	bindDateChange: function (result) {
		var date = result.detail.value;
		this.setData({ begintime: date });
		this.queryPriceAndStore(date);
	},
	//初始化时请求产品详情
	queryBookingInfo: function (pid, aid) {
		var that = this;
		Common.request({
			url: "/r/Mall_Product/getBookInfo/",
			data: {
				pid: pid,
				aid: aid,
				scenCode: app.globalData.curScenCode
			},
			loading: function () {
				Common.showLoading()
			},
			complete: function () {

				Common.hideLoading();
			},
			success: function (res) {
				var data = res.data;
				var ticketList = [];
				data.tickets.forEach(function (ticket, index) {
					var buyup = ticket.buy_up;
					var buylow = ticket.buy_low;
					var value = 0;
					if (buyup == 0) ticket["buy_up"] = -1; //不限
					if (index == 0) { //如果是第一张票，即主票
						value = buylow;
					}
					ticket["value"] = value;
					ticket["store"] = -1;   //初始时，库存都为不限 -1
					ticketList.push(ticket);
				})


				that.setData({
					ticketList: ticketList,
					isReady: true
				})
				wx.setNavigationBarTitle({
					title: data.title
				})

				that.adaptInfo(data);

				that.queryPriceAndStore(that.data.begintime);
			}
		})
	},

	adaptInfo: function (data) {

		var that = this;
		var validTime = data.validTime;
		if (validTime == 0) {
			data["validTime"] = "仅当天有效";
		} else {
			var pre = data.validType == 1 ? "下单后" : "游玩日期后";
			if (validTime.indexOf("~") < 0) {
				data["validTime"] = (pre + validTime + "天内有效");
			} else {
				data["validTime"] = (pre + validTime + "内有效");
			}
		}

		//验证时间（全天都可验时，不显示）
		//"verifyTime": -1  -1表示不限验证时间, [0,1,3,4,5,6]表示周一周二周四周五周六周日可验, 2016-08-01~2016-08-10表示此时间段可验
		var verifyTime = data.verifyTime;
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
			data["verifyTime"] = (verifyTimeResult + "使用");
		} else {
			data["verifyTime"] = "限" + verifyTime + "使用";
		}

		//2不可退，1游玩日期前可退，0有效期前可退
		var refund_rule = data.refund_rule;
		var refund_early_time = MinueToDayTime(data.refund_early_time);
		if (refund_rule == 1) {
			data["refund_rule_text"] = "有效期前" + refund_early_time + "可退";
		} else if (refund_rule == 0) {
			data["refund_rule_text"] = "游玩日期前可退";
		} else if (refund_rule == 2) {
			data["refund_rule_text"] = "不可退";
		} else if (refund_rule == 3){
			data["refund_rule_text"] = "随时退";
		}

		//得出并设置退票规则文本
		this.getRefundTicketRuleText(data);
		var reb = data.reb;
		var reb_type = data.reb_type;
		data["reb"] = reb * 1;
		data["reb_type"] = reb_type * 1;

		var batch_check = data.batch_check;
		var batch_day = data.batch_day;
		if (batch_check == 1 && batch_day != 0) { //开启分批验证 并且不能设置为不限验证数
			data["batch_day"] = "本次提交的订单，每日最多使用" + batch_day + "张";
		}

		var newData = {};
		for (var i in data) {
			if (i != 'tickets' && i != 'cancel_cost') {
				newData[i] = data[i];
			}
		}

		this.setData(newData);

		//初始化需要身份证的总个数
		if (data.needID == 2) {
			this.setData({
				touristInfoTotalNum: data.tickets[0]["buy_low"]
			})
		}

	},

	/**
	 * 得出并设置退票规则文本
	 * 
	 * @param {any} data 
	 */
	getRefundTicketRuleText: function (data) {
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

		this.setData({
			refundTicketRuleText: {
				ladderTextList: ladderChargeTextArr,
				baseText: baseChargeText
			}
		})

		function beginTimePerfix(p_type) {
			return {
				"A": "游玩日期前",
				"B": "集合日期前",
				"C": "入住日期前",
				"F": "游玩日期前",
				"H": "演出日期前"
			}[data.p_type]
		}




	},

	//提交订单
	onSubmit: function (e) {
		var oData = this.data;
		var ticketList = oData.ticketList;
		if (oData.isSubmitLoading) return false;
		if (oData.needIDErrTipShow || oData.needIDErrTipShow || oData.orderNameErrTipShow) return false;
		var contacttel = oData.contacttel;
		var ordername = oData.ordername;
		var sfz = oData.sfz;

		var submitData = {
			pid: oData.pid,
			aid: oData.aid,
			tnum: ticketList[0]["value"],   //主票购买张数
			begintime: oData.begintime,     //开始时间
			contacttel: oData.contacttel,   //取票人手机号
			ordername: oData.ordername,      //联系人姓名,
			scenCode: app.globalData.curScenCode //店铺唯一编码
		};
		if (oData.needID == 1) submitData["sfz"] = oData.sfz; //需要一张身份证

		// if(contacttel.length!==11 || isNaN(contacttel)) return this.setData({contacttelErrTipShow:true});
		// if(!ordername) return this.setData({orderNameErrTipShow:true});
		if (oData.needID == 1 && !Common.validateIDCard(sfz)) return this.setData({ needIDErrTipShow: true });

		//如果一票一身份证
		if (oData.needID == 2) {
			if (this.touristIdcardList.getOkNum() != submitData.tnum) {
				wx.showModal({
					title: "提示",
					content: "游客信息填写有误，请完善",
					showCancel: false
				})
				return false;
			} else { 
				submitData["idcards"] = this.touristIdcardList.getTouristIdArr();
				submitData["tourists"] = this.touristIdcardList.getTouristNameArr();
			}
		}

		comContact.addContact({
			name: ordername,
			tel: contacttel,
			id: sfz
		});

		var link = {};
		ticketList.forEach(function (item, index) {
			if (index != 0) {
				var pid = item.pid;
				var value = item.value;
				link[pid] = value;
			}
		});

		submitData["link"] = link;


		Common.request({
			url: "/r/Mall_Order/order/",
			data: submitData,
			loading: function () {
				Common.showLoading();
			},
			complete: function () {
				Common.hideLoading();
			},
			success: function (res) {
				var code = res.code;
				var msg = res.msg;
				var data = res.data;
				var ordernum = data.ordernum;
				var paymode = data.paymode;
				if (code == 200) {
					if (paymode == 1) {
						wx.navigateTo({ url: "../pay/pay?ordernum=" + ordernum });
					} else if (paymode == 4) {
						wx.navigateTo({ url: "../paysuccess/paysuccess?ordernum=" + ordernum });
					} else {
						Common.showError("paymode=" + paymode);
					}

				} else {
					Common.showError(msg);
				}
			}
		})




	},

	//请求库存价格
	queryPriceAndStore: function (date) {
		var that = this;
		var aid = this.data.aid;
		var pids = this.data.ticketList.map(function (item) {
			return item.pid;
		}).join("-");

		Common.request({
			debug: false,
			url: "/r/Mall_Product/getPriceAndStorage/",
			data: {
				pids: pids,
				aid: aid,
				date: date
			},
			loading: function () {
				// Common.showLoading("请求库存价格..");
			},
			complete: function () {
				Common.hideLoading();
			},
			success: function (res) {
				if (res.code == 200) {
					var data = res.data;
					var ticketList = that.data.ticketList;
					var newTicketList = [];
	
					if (Object.prototype.toString.call(data) == "[object Array]" && data.length == 0) {
	
						Common.showError("该日期没有库存及价格，请更换日期", "提示");
	
						var newList = [];
						that.data.ticketList.forEach(function (item) {
							item["jsprice"] = 0;
							newList.push(item);
						})
	
						that.setData({ ticketList: newList });
						that.setData({ canSubmit: false });
						that.calTotalMoney();
	
						return false;
	
					}
	
					that.setData({ canSubmit: true });
	
					ticketList.forEach(function (ticket) {
						var pid = ticket.pid;
						if (data[pid]) {
							newTicketList.push(that.updateTicketPriceStore(ticket, data[pid].price, data[pid].store));
						}
					})
	
					that.setData({ ticketList: newTicketList });
					that.calTotalMoney();
				} else {
					Common.showError("该日期没有库存及价格，请更换日期", "提示");
				}
				

			}
		})
	},
	//日历切换时，把请求回来的数据跟现有数据对比，更新ticketList
	updateTicketPriceStore: function (ticket, price, store) {
		var value = ticket.value;

		ticket["jsprice"] = price;  //更新价格
		ticket["store"] = store;  //更新库存

		if (store != -1) {
			if (store < value) { //如果当前的票数已经大于新的库存值,则票数需重置,此时无须考虑buyup值，因为任何时候程序都会保证value<=buyup
				value = store;
				ticket["value"] = value;
			}
		}



		return ticket;

	},

	//计算总金额
	calTotalMoney: function () {
		var ticketList = this.data.ticketList;
		//var total = this.data.ticketList.reduce(function(prev,current,currentIndex){
		//	return (prev.value*1 * prev.tprice*1) + (current.value*1 * current.tprice*1);
		//});
		var total = 0;
		ticketList.forEach(function (item) {
			total += (item.value * item.jsprice);
		});
		this.setData({ totalMoney: Number(total).toFixed(2) });
	},

	/**
	 * 关闭常用联系人
	 */
	closeCommonContact: function () {
		this.setData({
			contactDisplay: "none"
		})
	},

	/**
	 * 点击添加常用联系人
	 */
	onAddContactTap: function () {
		this.setData({
			contactDisplay: "block",
			contactData: comContact.getContactArr()
		})
	},

	/**
	 * 关闭简单消息提示
	 */
	closeSimpleMsgPop: function () {
		this.setData({
			simpleMsgPopDisplay: "none"
		})
	},

	/**
	 * 打开简单消息提示
	 */
	openSimpleMsgPop: function () {
		this.setData({
			simpleMsgPopDisplay: "block",

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
			ordername: name,
			sfz: id,
			contacttel: tel,
			contactDisplay: "none"
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
				contactData: comContact.getContactArr()
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
			idcardListWrapDisplay: "block",
			touristInfoArr: arr
		})
	},

	/**
	 * 游客信息关闭
	 */
	closeIdcardListWrap: function () {
		var _this = this;
		this.setData({
			idcardListWrapDisplay: "none",
			touristInfoAlreadyNum: _this.touristIdcardList.getOkNum()
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
			var text = "", allOk = true,i = 0;

			for (i; i < this._listData.length; i++){

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


});
