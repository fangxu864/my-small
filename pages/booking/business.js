/**
 * @author [fangxu]
 * @email [864109504@qq.com]
 * @create date 2017-09-12 10:55:57
 * @modify date 2017-09-12 10:55:57
 * @desc [description]
*/



var Common = require("../../utils/common.js");
var App = getApp();
var comContact = require("./modules/tourist-info/contact.js");


/**
 * 本模块为业务数据模块
 */
var bookingBusiness = {

	// pid	int	14624,主票pid
	// tnum	int	2,主票购买张数
	// begintime	string	2016-08-01,游玩日期
	// endtime	string	2016-08-02, 结束时间,酒店类型的产品才有
	// contacttel	int	手机号
	// ordername	string	联系人
	// sfz	string	身份证
	// memo	string	备注
	// aid	int	3385,上级供应商id
	// idcards	array	身份证数组,[350181, 350182, ......]
	// tourists	array	游客姓名数组,[马大爷, 他二舅, .....]
	// link	object	联票, {"14624" : 2, "14625" : 3}
	// roundid	int	场馆信息, 演出类才有
	// venusid	int	场次信息, 演出类才有
	// zoneid	int	区域信息, 演出类才有
	// parentid	int	上级用户id, 全民营销

	// 产品类型：A=景点，B=线路，C=酒店，F=套票，G=餐饮，H=演出，I=年卡套餐

	//预订页面的业务数据,相当一个数据池
	biz_data: {
		contacttel: "12301",
		ordername: "小程序购票",
		scenCode: App.globalData.curScenCode //店铺唯一编码
	},

	/**
	 * 更新业务数据的方法
	 * 
	 * @param {any} data 
	 */
	biz_updateData: function (data) {
		Object.assign(this.biz_data, data);
	},


	//请求库存价格
	biz_queryPriceAndStore: function (date) {
		var that = this;
		var aid = this.data.aid;
		var pids = this.data.viewData.ticketList.ticketList.map(function (item) {
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
					var ticketList = that.data.viewData.ticketList.ticketList;
					var newTicketList = [];

					if (Common.judgeTrue(data)) {
						ticketList.forEach(function (ticket) {
							var pid = ticket.pid;
							if (data[pid]) {
								newTicketList.push(that.biz_updateTicketPriceStore(ticket, data[pid].price, data[pid].store));
							}
						})

					} else {
						Common.showError("该日期没有售票，请更换日期", "提示");
						ticketList.forEach(function (item) {
							item["jsprice"] = 0;
							item["store"] = 0;
							newTicketList.push(item);
						})
					}
					that.tlist_dataChange(newTicketList);

				} else {
					Common.showError("该日期没有售票，请更换日期", "提示");
				}

			}
		})
	},

	//日历切换时，把请求回来的数据跟现有数据对比，更新ticketList
	biz_updateTicketPriceStore: function (ticket, price, store) {
		var value = Number(ticket.value);
		var buy_low = Number(ticket.buy_low);

		ticket["jsprice"] = price;  //更新价格
		ticket["store"] = store;  //更新库存

		if (store != -1) {
			if (store <= value) { //如果当前的票数已经大于新的库存值,则票数需重置,此时无须考虑buyup值，因为任何时候程序都会保证value<=buyup
				ticket["value"] = store;
			} else {
				ticket["value"] = buy_low;
			}
		}
		return ticket;
	},


	/**
	 * 请求酒店价格库存
	 * 
	 * @param {any} beginDate 住店开始时间
	 * @param {any} endDate   离店时间
	 */
	biz_getHotelPriceAndStorage: function (beginDate, endDate) {
		var _this = this, oData = this.data;

		Common.request({
			debug: false,
			url: "/r/Mall_Product/getHotelPriceAndStorage/",
			data: {
				pid: oData.pid,
				aid: oData.aid,
				beginDate: beginDate,
				endDate: endDate
			},
			loading: function () {
				// Common.showLoading("请求库存价格..");
			},
			complete: function () {
				Common.hideLoading();
			},
			success: function (res) {
				var data = res.data;

				var price = data.jsprice;

				var store = (function () {
					var storage = data.store;
					var storeArray = [];
					for (var i in storage) storeArray.push(storage[i]);
					var daycount = storeArray.length;

					var getStoreMin = function (array) {
						if (array.length == 0) return null;
						var no_limit_arr = [];
						var limit_arr = [];
						array.forEach(function (item, index) {
							if (item == -1) no_limit_arr.push(item);
							if (item != -1) limit_arr.push(item);
						})
						//都为-1
						if (no_limit_arr.length == array.length) return -1;
						return Math.min.apply({}, limit_arr);
					};

					var storeMin = getStoreMin(storeArray);

					if (daycount == 1) { //预订1天
						return {
							daycount: daycount,
							storeNum: storeArray[0],
							storeText: ""
						}
					} else { //预订1天以上

						//在多天中只要有一天库存为0(没有库存)，即视为用户选择的时间段内没有库存，无法下单
						//有问题请 @产品-詹必魁
						if (storeMin == 0) {
							return {
								daycount: daycount,
								storeNum: 0,
								storeText: "无"
							}
						} else { //如果选择的时间段内都有库存(包含不限库存)，库存取最小的那天
							if (storeMin == -1) { //时间段内每一天库存都为不限(都为-1)
								return {
									daycount: daycount,
									storeNum: -1,
									storeText: ""
								}
							} else { //如果时间段内有不限的 也有 具体库存的，取具体库存最小值,但是页面上只要显示"有" 有问题请@产品-詹必魁
								return {
									daycount: daycount,
									storeNum: storeMin,
									storeText: "有"
								}
							}
						}
					}
				})();


				//酒店类产品永远只能下单票，不存在连票 
				var newTicketList = _this.data.viewData.ticketList.ticketList.map(function (ticket) {
					ticket["jsprice"] = price;
					ticket["store"] = store.storeNum;
					ticket["storeText"] = store.storeText;
					return ticket;
				})

				_this.tlist_dataChange(newTicketList);
			}
		})

	},

	/**
	 * 提交订单
	 *  
	 */
	biz_submitData: function () {

		var submitData = this.biz_getSubmitData();

		if (!Common.judgeTrue(submitData)) {
			console.log("未提交任何信息")
			return false
		};

		if (submitData.contacttel != "12301") {
			comContact.addContact({
				name: submitData.ordername,
				tel: submitData.contacttel,
				id: submitData.sfz
			});
		}


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

	/**
	* 根据不同的产品类型获取需要提交的数据
	* 
	* @returns 需要提交的数据
	*/
	biz_getSubmitData: function () {
		var _this = this, oData = this.data, p_type = oData.p_type;

		var submitData = {};
		var comData = {
			scenCode: App.globalData.curScenCode,//店铺唯一编码
			pid: oData.pid,
			aid: oData.aid
		}

		// 产品类型：A=景点，B=线路，C=酒店，F=套票，H=演出，I=年卡套餐，G=餐饮，
		switch (p_type) {

			case "A": {
				submitData = Object.assign(
					{},
					comData, //通用数据
					_this.qts_getBizData(), //景区类时间模块的数据
					_this.tlist_getBizdata(), //票类列表
					_this.tInfo_getBizData() //联系人数据
				)
				break;
			}
			case "B": {
				submitData = Object.assign(
					{},
					comData, //通用数据
					_this.qts_getBizData(), //景区类时间模块的数据
					_this.tlist_getBizdata(), //票类列表
					_this.tInfo_getBizData() //联系人数据
				)
				break;
			}
			case "H": {
				submitData = Object.assign(
					{},
					comData, //通用数据
					_this.qts_getBizData(), //景区类时间模块的数据
					_this.sinfo_getBizData(), //场次信息
					_this.tlist_getBizdata(), //票类列表
					_this.tInfo_getBizData() //联系人数据
				)
				break;
			}
			case "F": {
				submitData = Object.assign(
					{},
					comData, //通用数据
					_this.qts_getBizData(), //景区类时间模块的数据
					_this.tlist_getBizdata(), //票类列表
					_this.tInfo_getBizData() //联系人数据
				)
				break;
			}
			// C=酒店	
			case "C": {
				submitData = Object.assign(
					{},
					comData, //通用数据
					_this.qth_getBizData(), //景区类时间模块的数据
					_this.tlist_getBizdata(), //票类列表
					_this.tInfo_getBizData() //联系人数据
				)
				break;
			}
		}


		//校验提交的数据
		if (!this.biz_validSubmitData(submitData)) return false;

		return submitData;



	},

	/**
	 * 校验提交的数据
	 * 
	 * @param {any} submitData 
	 */
	biz_validSubmitData: function (submitData) {
		var p_type = this.data.p_type, allOk = true;


		//分类选择校验

		// 产品类型：A=景点，B=线路，C=酒店，F=套票，H=演出，I=年卡套餐，G=餐饮，
		switch (p_type) {

			case "A": {
				//校验开始时间
				if (!submitData.begintime) {
					this.biz_Error("请选择游玩时间");
					allOk = false;
					break;
				}

				break;

			}
			case "B": {
				//校验开始时间
				if (!submitData.begintime) {
					this.biz_Error("请选择游玩时间");
					allOk = false;
					break;
				}

				break;

			}
			case "H": {
				//校验开始时间
				if (!submitData.begintime) {
					this.biz_Error("请选择观看时间");
					allOk = false;
					break;
				}

				break;

			}
			case "F": {
				//校验开始时间
				if (!submitData.begintime) {
					this.biz_Error("请选择游玩时间");
					allOk = false;
					break;
				}
				break;

			}
			case "C": {

				console.log("酒店", submitData.begintime, submitData.endtime)
				//校验开始时间
				if (!submitData.begintime) {
					this.biz_Error("请选择住店时间");
					allOk = false;
					break;
				}
				//校验开始时间
				if (!submitData.endtime) {
					this.biz_Error("请选择离店时间");
					allOk = false;
					break;
				}
				break;

			}
		}

		if(!allOk) return false;

		//通用校验

		//1.校验联系人信息
		if (!this._biz_validTouristInfo(submitData)) {

			console.log("校验联系人信息出错")
			allOk = false;
			return false;
		};

		return allOk;


	},

	_biz_validTouristInfo: function (submitData) {

		console.log("666666")
		var oData = this.data,
			allOk = true,
			needID = Number(oData.needID),
			_this = this;


		//校验取票人姓名手机号

		switch (needID) {

			//不需要身份证时
			case 0: {
				break;
			}

			//需要1张身份证时
			case 1: {
				if (!Common.validateIDCard(submitData.sfz)) {
					_this.biz_Error("身份证填写有误，请重新填写");
					allOk = false;
				}
				if (!/\d{11}/.test(submitData.contacttel)) {
					_this.biz_Error("手机号填写有误，请重新填写");
					allOk = false;
				}
				if (submitData.ordername == "") {
					_this.biz_Error("取票人姓名不能为空，请重新填写");
					allOk = false;
				}
				break;
			}

			//需要多张身份证时
			case 2: {

				if (this.touristIdcardList.getOkNum() != submitData.front_totalNum) {
					_this.biz_Error("游客信息填写有误，请完善");
					allOk = false;
				}

				if (!/\d{11}/.test(submitData.contacttel)) {
					_this.biz_Error("手机号填写有误，请重新填写");
					allOk = false;
				}
				if (submitData.ordername == "") {
					_this.biz_Error("取票人姓名不能为空，请重新填写");
					allOk = false;
				}
				break;
			}
		}


		return allOk;

	},

	biz_Error(text) {
		wx.showModal({
			title: "提示",
			content: text,
			showCancel: false
		})
	},


}

module.exports = bookingBusiness;