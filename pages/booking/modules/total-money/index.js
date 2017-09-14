var totalMoney = {
    
	/**
	 * 计算总金额
	 * 
	 */
	tmoney_calTotalMoney: function () {
		var ticketList = this.data.viewData.ticketList.ticketList;
		var total = 0;
		ticketList.forEach(function (item) {
			total += (item.value * item.jsprice);
		});
		this.setData({ "viewData.totalMoney.totalMoney": Number(total).toFixed(2) });
	},

	/**
	 * 点击提交按钮时
	 * 
	 */
	tmoney_submit: function (e) {
		this.biz_submitData();
	}
}

module.exports = totalMoney;