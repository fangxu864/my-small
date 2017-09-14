var ticketList = {

	tlist_init: function (data) {
		var ticketList = [];
		data.tickets.forEach(function (ticket, index) {
			var buyup = ticket.buy_up;
			var buylow = ticket.buy_low;
			var value = 0;
			if (buyup == 0) ticket["buy_up"] = -1; //不限

			ticket["ismain"] = false;
			if (index == 0) { //如果是第一张票，即主票
				value = buylow;
				ticket["ismain"] = true;
			}
			ticket["value"] = value;
			ticket["store"] = -1;   //初始时，库存都为不限 -1
			ticketList.push(ticket);
		})

		this.tlist_dataChange(ticketList);

	},

	/**
	 * 当票类列表数据变化时
	 * 
	 * @param {any} newListdata 变化后的列表数据
	 */
	tlist_dataChange: function (newListdata) {

		var totalTicketNum = 0; //购票总数

		//根据列表数据更新按钮状态
		var newArr = newListdata.map(function (ticket) {

			var store = Number(ticket.store);
			var value = Number(ticket.value);
			var buy_low = Number(ticket.buy_low);
			var buy_up = Number(ticket.buy_up);
			var max = 0;

			totalTicketNum += value;

			//不是主票，最低购票数为0
			if (!ticket.ismain) {
				buy_low = 0;
			}

			//判断-按钮是否为禁用状态
			ticket["minusdisabled"] = value <= buy_low ? true : false;

			//判断+按钮是否为禁用状态
			if (buy_up === -1 && store === -1) {
				ticket["adddisabled"] = false;
			} else if (buy_up !== -1 && store !== -1) {
				if (value >= Math.min(buy_up, store)) {
					ticket["adddisabled"] = true;
				} else {
					ticket["adddisabled"] = false;
				}
			} else {
				if (value >= (store + buy_up + 1)) {
					ticket["adddisabled"] = true;
				} else {
					ticket["adddisabled"] = false;
				}
			}

			if (store == 0) {
				ticket["adddisabled"] = true;
				ticket["minusdisabled"] = true;
				ticket["value"] = 0;
			}

			return ticket;
		})

		//更新视图数据
		this.setData({ "viewData.ticketList.ticketList": newArr });

		//重新计算总价钱
		this.tmoney_calTotalMoney();


		//刷新需要的身份证数量
		this.setData({
			"viewData.touristInfo.touristInfoTotalNum": totalTicketNum
		})
	},

	/**
	 * 获取业务数据
	 * 
	 */
	tlist_getBizdata: function () {
		// tnum	int	2,主票购买张数
		// link	object	联票, {"14624" : 2, "14625" : 3}

		var newArr = this.data.viewData.ticketList.ticketList;
		var tnum = '', link = {};
		newArr.forEach(function (item) {
			//不是主票，最低购票数为0
			if (!item.ismain) {
				if (item.value > 0) {
					link[item.pid] = item.value;
				}
			} else {
				tnum = item.value;
			}
		})

		//更新业务数据
		return {
			"tnum": tnum,
			"link": link
		}

	},


    /**
	 * 点击票数增加减少的按钮时
	 * 
	 * @param {any} e 
	 * @returns 
	 */
	tlist_onCountBtnTap: function (e) {

		var dataset = e.currentTarget.dataset;
		//如果按钮是禁用状态的话，不予处理
		if (dataset.isdisabled) return false;
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

		var newTicketList = this.data.viewData.ticketList.ticketList.map(function (ticket) {
			var pid = ticket.pid;
			var aid = ticket.aid;
			if (ticketId == (pid + "-" + aid)) {
				ticket["value"] = value;
			}
			return ticket;
		});

		this.tlist_dataChange(newTicketList);



	}
}

module.exports = ticketList;