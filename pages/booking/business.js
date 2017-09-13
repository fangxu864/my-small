/**
 * @author [fangxu]
 * @email [864109504@qq.com]
 * @create date 2017-09-12 10:55:57
 * @modify date 2017-09-12 10:55:57
 * @desc [description]
*/



var Common = require("../../utils/common.js");


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
		ordername: "小程序购票"
	},



	/**
	 * 更新业务数据的方法
	 * 
	 * @param {any} data 
	 */
	biz_updateData: function (data) {
		Object.assign(this.biz_data, data);

		console.log(this.biz_data);
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
     * 提交数据
     * 
     */
	biz_submit: function () {

		var submitData = this.biz_getSubmitData();

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

		var submitData = {}

		//获取公共的数据

		//按照类别获取不同的数据

		return submitData;
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
			contacttel: oData.contacttel || "12301",   //取票人手机号
			ordername: oData.ordername || "小程序购票",      //联系人姓名,
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


}

module.exports = bookingBusiness;