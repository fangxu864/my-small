var Common = require("../../utils/common.js");
var ShowError = Common.showError;
var app = getApp();
Page({
	data : {},
	onReady : function(){},
	onLoad : function(option){
		var ordernum = option.ordernum || "3317783";
		this.setData({ordernum:ordernum});
		wx.setNavigationBarTitle({title:"支付"});
		this.queryOrderInfo(ordernum,Common.getAccount());
	},
	queryOrderInfo : function(ordernum,account){
		var that = this;
		if(!ordernum || !account) return false;
		Common.request({
			debug : false,
			url : "/r/Mall_Order/pay/",
			data : {
				ordernum : ordernum,
				host : account
			},
			loading : function(){
				Common.showLoading();
			},
			complete : function(){
				Common.hideLoading();
			},
			success : function(res){
				var code = res.code;
				var msg = res.msg;
				var data = res.data;
				if(code==200){
					that.setData(data);
				}else{
					ShowError(msg);
				}
			}
		})
	},
	//支付
	onPay : function(){
		var payParams = this.data.payParams;
		var ordernum = this.data.ordernum;
		Common.request({
			url : "/r/pay_WxPay/order/",
			data : {
				appid : payParams.appid,
				out_trade_no : payParams.outTradeNo,
				subject : payParams.subject,
				openid : payParams.openid,
				expire_time : payParams.expireTime
			},
			loading : function(){ Common.showLoading()},
			complete : function(){ Common.hideLoading()},
			success : function(res){
				var status = res.status;
				var msg = res.msg;
				var data = res.data || {};


				data["success"] = function(res){

					wx.navigateTo({url:"../paysuccess/paysuccess?ordernum="+ordernum});

				}

				if(status=="ok"){
					wx.requestPayment(data);
				}else{
					showError(msg);
				}
			},
			fail : function(res){
				console.log(res);
				Common.showError(JSON.stringify(res));
			}
		})

	}

})