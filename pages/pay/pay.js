var Common = require("../../utils/common.js");
var ShowError = Common.showError;
var app = getApp();
Page({
	data: {},
	
	onReady: function () { },
	
	onLoad : function(option){
		var ordernum = option.ordernum || "3317783";
		var pcode = option.pcode || "3317783";
		this.setData({
			ordernum: ordernum,
			pcode: pcode
		});
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
					console.log(res);
					that.setData(data);
				}else{
					ShowError(msg);
				}
			}
		})
	},

	/**
	 * 点击微信支付时
	 */
	onPay : function(){
		var payParams = this.data.payParams;
		var ordernum = this.data.ordernum;
		var pcode = this.data.pcode;
		console.log(pcode);
		var detail = this.data.detail;
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

					//支付成功后，请求向用户发送微信消息
					Common.request({
						url: "/r/Mall_Mall/sendMsgAfterPay",
						data: {
							account: Common.getAccount(),
							openid: payParams.openid,
							prepayId: data.package.match(/(?:prepay_id=)(\w+)/)[1],
							title: detail.landTitle, //景区名称
							code: detail.qrcode, //凭证码
							orderNum: ordernum, // 订单号
							orderTime: Common.getToday(), // 下单时间
							endTime: detail.extra.date.replace(/\~|\～/g , "至"),//有效期
							tips: ''
						},
						loading : function(){ Common.showLoading()},
						complete : function(){ Common.hideLoading()},
						success : function(res){
						}
					});

					setTimeout(function () {
						//跳转至支付成功页面
						wx.navigateTo({url:"../paysuccess/paysuccess?ordernum="+ordernum});
					},1000)

				};

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