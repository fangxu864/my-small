var Common = require("../../utils/common.js");
var MinueToDayTime = Common.MinueToDayTime;
var app = getApp();
Page({
    data: {
		isReady : false,
        begintime : Common.getToday(),
		aid : "",
		pid : "",
		isSubmitLoading : false,
		totalMoney : 0,
		contacttel : "",
		ordername : "",
		sfz : "",
		needIDErrTipShow : false,
		contacttelErrTipShow : false,
		orderNameErrTipShow : false,
		ticketList : [],
		canSubmit : true
    },
    onReady : function(){
        var that = this;
		var data = this.data;
		var pid = data.pid;
		var aid = data.aid;


		if(pid && aid){
			this.queryBookingInfo(pid,aid);
		}else{
			wx.showModal({
				title : "提示",
				content: "缺少pid或aid",
				showCancel : false
			})
		}

    },
	onLoad: function (option) {
		this.setData({
			aid : option.aid || "3385",
			pid : option.pid || "6698"
		})
	},
	onShow : function(){ },
	onHide : function(){ },
	onCountBtnTap : function(e){
		var dataset = e.currentTarget.dataset;
		var type = dataset.type;
		var value = dataset.value * 1;
		var store = dataset.store * 1;
		var buyup = dataset.buyup * 1;
		var buylow = dataset.buylow * 1;
		var isMain = dataset.ismain;
		var ticketId = dataset.id;
		if(type=="add"){
			if(value>=store && store!=-1){
				return wx.showModal({
					title: '提示',
					content: "库存不足",
					showCancel : false
				})
			}
			if(value>=buyup && buyup!=-1){
				return wx.showModal({
					title: '提示',
					content: "限购"+buyup+"张",
					showCancel : false
				})
			}

			value = value +1;
			if(value<buylow) value = buylow;


		}else if(type=="minus"){
			if(value<=buylow && value!=-1 && isMain){
				return wx.showModal({
					title: '提示',
					content: buylow+"张起订",
					showCancel : false
				})
			}
			if(value<0){
				return wx.showModal({
					title: '提示',
					content: "票数不能为负数",
					showCancel : false
				})
			}
			if(value==0 && isMain){
				return wx.showModal({
					title: '提示',
					content: "主票票数不能为0",
					showCancel : false
				})
			}

			value = value-1;
			//如果非主票，且票数小于最少起购数，则直接把数据置为0
			if(!isMain && value<buylow) value = 0;
		}

		var newTicketList = this.data.ticketList.map(function(ticket){
			var pid = ticket.pid;
			var aid = ticket.aid;
			if(ticketId==(pid+"-"+aid)){
				ticket["value"] = value;
			}
			return ticket;
		});

		this.setData({ticketList:newTicketList});

		this.calTotalMoney();

	},
	onContacttelInpBlur : function(e){
		var detail = e.detail;
		var value = detail.value;
		if(value.length!=11 || isNaN(value)){
			this.setData({contacttelErrTipShow : true})
		}else{
			this.setData({contacttelErrTipShow : false})
		}
	},
	onOrderNameInpBlur : function(e){
		var detail = e.detail;
		var value = detail.value;
		if(!value){
			this.setData({orderNameErrTipShow : true})
		}else{
			this.setData({orderNameErrTipShow : false})
		}
	},
	onContacttelInpChange : function(e){
		var detail = e.detail;
		var value = detail.value;
		this.setData({
			contacttel : value
		})
		if(value.length==11 && !isNaN(value)) this.setData({contacttelErrTipShow : false})
	},
	onOrderNameInpChange : function(e){
		var detail = e.detail;
		var value = detail.value;
		this.setData({
			ordername : value
		})
		this.setData({orderNameErrTipShow : value ? false : true})
	},
	onIDCardInpBlur : function(e){
		var detail = e.detail;
		var value = detail.value;
		var result = Common.validateIDCard(value);
		this.setData({needIDErrTipShow : result ? false : true})
	},
	onIDCardInpChange : function(e){
		var detail = e.detail;
		var value = detail.value;
		this.setData({sfz:value});
		if(value.length==18 || value.length==15){
			var result = Common.validateIDCard(value);
			this.setData({needIDErrTipShow : result ? false : true})
		}
	},
    bindDateChange : function(result){
		var date = result.detail.value;
		this.setData({begintime : date});
		this.queryPriceAndStore(date);
    },
	//初始化时请求产品详情
	queryBookingInfo : function(pid,aid){
		var that = this;
		Common.request({
			url : "/r/Mall_Product/getBookInfo/",
			data : {
				pid : pid,
				aid : aid,
                scenCode: app.globalData.curScenCode
			},
			loading : function(){
				Common.showLoading()
			},
			complete : function(){
				Common.hideLoading();
			},
			success : function(res){
				var data = res.data;
				var ticketList = [];
				data.tickets.forEach(function(ticket,index){
					var buyup = ticket.buy_up;
					var buylow = ticket.buy_low;
					var value = 0;
					if(buyup==0) ticket["buy_up"] = -1; //不限
					if(index==0){ //如果是第一张票，即主票
						value = buylow;
					}
					ticket["value"] = value;
					ticket["store"] = -1;   //初始时，库存都为不限 -1
					ticketList.push(ticket);
				})


				that.setData({
					ticketList : ticketList,
					isReady : true
				})
				wx.setNavigationBarTitle({
					title: data.title
				})

				that.adaptInfo(data);

				that.queryPriceAndStore(that.data.begintime);
			}
		})
	},

	adaptInfo : function(data){

		var that = this;
		var validTime = data.validTime;
		if(validTime==0){
			data["validTime"] = "仅当天有效";
		}else{
			var pre = data.validType==1 ? "下单后" : "游玩日期后";
			if(validTime.indexOf("~")<0){
				data["validTime"] = (pre+validTime+"天内有效");
			}else{
				data["validTime"] = (pre+validTime+"内有效");
			}
		}

		//验证时间（全天都可验时，不显示）
		//"verifyTime": -1  -1表示不限验证时间, [0,1,3,4,5,6]表示周一周二周四周五周六周日可验, 2016-08-01~2016-08-10表示此时间段可验
		var verifyTime = data.verifyTime;
		var verifyTimeResult = "限";
		if(verifyTime==-1){
			data["verifyTime"] = "";
		}else if(Object.prototype.toString.call(verifyTime)=="[object Array]"){
			for(var i in verifyTime){
				var str = {
					0 : "周日",
					1 : "周一",
					2 : "周二",
					3 : "周三",
					4 : "周四",
					5 : "周五",
					6 : "周六"
				}[verifyTime[i]];
				verifyTimeResult += (str + " ");
			}
			data["verifyTime"] = (verifyTimeResult + "使用");
		}else{
			data["verifyTime"] = "限" + verifyTime + "使用";
		}

		//2不可退，1游玩日期前可退，0有效期前可退
		var refund_rule = data.refund_rule;
		var refund_early_time = MinueToDayTime(data.refund_early_time);
		if(refund_rule==1){
			data["refund_rule_text"] = "有效期前"+refund_early_time+"可退";
		}else if(refund_rule==0){
			data["refund_rule_text"] = "游玩日期前可退";
		}else if(refund_rule==2){
			data["refund_rule_text"] = "不可退";
		}


		var reb = data.reb;
		var reb_type = data.reb_type;
		data["reb"] = reb * 1;
		data["reb_type"] = reb_type * 1;

		var batch_check = data.batch_check;
		var batch_day = data.batch_day;
		if(batch_check==1 && batch_day!=0){ //开启分批验证 并且不能设置为不限验证数
			data["batch_day"] = "本次提交的订单，每日最多使用" + batch_day + "张";
		}

		var newData = {};
		for(var i in data){
			if(i!='tickets' && i!='cancel_cost'){
				newData[i] = data[i];
			}
		}

		this.setData(newData);

	},

	//提交订单
	onSubmit : function(e){
		var oData = this.data;
		var ticketList = oData.ticketList;
		if(oData.isSubmitLoading) return false;
		if(oData.needIDErrTipShow || oData.needIDErrTipShow || oData.orderNameErrTipShow) return false;
		var contacttel = oData.contacttel;
		var ordername = oData.ordername;
		var sfz = oData.sfz;


		var submitData = {
			pid : oData.pid,
			aid : oData.aid,
			tnum : ticketList[0]["value"],   //主票购买张数
			begintime : oData.begintime,     //开始时间
			contacttel : oData.contacttel,   //取票人手机号
			ordername : oData.ordername      //联系人姓名
		};
		if(oData.needID==1) submitData["sfz"] = oData.sfz; //需要一张身份证

		if(contacttel.length!==11 || isNaN(contacttel)) return this.setData({contacttelErrTipShow:true});
		if(!ordername) return this.setData({orderNameErrTipShow:true});
		if(oData.needID==1 && !Common.validateIDCard(sfz)) return this.setData({needIDErrTipShow:true});

		var link = {};
		ticketList.forEach(function(item,index){
			if(index!=0){
				var pid = item.pid;
				var value = item.value;
				link[pid] = value;
			}
		});

		submitData["link"] = link;


		Common.request({
			url : "/r/Mall_Order/order/",
			data : submitData,
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
				var ordernum = data.ordernum;
				var paymode = data.paymode;
				if(code==200){
					if(paymode==1){
						wx.navigateTo({url:"../pay/pay?ordernum="+ordernum});
					}else if(paymode==4){
						wx.navigateTo({url:"../paysuccess/paysuccess?ordernum="+ordernum});
					}else{
						Common.showError("paymode="+paymode);
					}

				}else{
					Common.showError(msg);
				}
			}
		})




	},


	//请求库存价格
	queryPriceAndStore : function(date){
		var that = this;
		var aid = this.data.aid;
		var pids = this.data.ticketList.map(function(item){
			return item.pid;
		}).join("-");

		Common.request({
			debug : false,
			url : "/r/Mall_Product/getPriceAndStorage/",
			data : {
				pids : pids,
				aid : aid,
				date : date
			},
			loading : function(){
				Common.showLoading("请求库存价格..");
			},
			complete : function(){
				Common.hideLoading();
			},
			success : function(res){
				var data = res.data;
				var ticketList = that.data.ticketList;
				var newTicketList = [];

				if(Object.prototype.toString.call(data)=="[object Array]" && data.length==0){

					Common.showError("该日期没有库存及价格，请更换日期","提示");

					var newList = [];
					that.data.ticketList.forEach(function(item){
						item["jsprice"] = 0;
						newList.push(item);
					})

					that.setData({ticketList:newList});
					that.setData({canSubmit:false});
					that.calTotalMoney();

					return false;

				}

				that.setData({canSubmit:true});

				ticketList.forEach(function(ticket){
					var pid = ticket.pid;
					if(data[pid]){
						newTicketList.push(that.updateTicketPriceStore(ticket,ticket.jsprice,ticket.store));
					}
				})

				that.setData({ticketList:newTicketList});
				that.calTotalMoney();

			}
		})
	},
	//日历切换时，把请求回来的数据跟现有数据对比，更新ticketList
	updateTicketPriceStore : function(ticket,price,store){
		var value = ticket.value;

		ticket["jsprice"] = price;  //更新价格
		ticket["store"] = store;  //更新库存

		if(store!=-1){
			if(store<value){ //如果当前的票数已经大于新的库存值,则票数需重置,此时无须考虑buyup值，因为任何时候程序都会保证value<=buyup
				value = store;
				ticket["value"] = value;
			}
		}



		return ticket;

	},

	//计算总金额
	calTotalMoney : function(){
		var ticketList = this.data.ticketList;
		//var total = this.data.ticketList.reduce(function(prev,current,currentIndex){
		//	return (prev.value*1 * prev.tprice*1) + (current.value*1 * current.tprice*1);
		//});
		var total = 0;
		ticketList.forEach(function(item){
			total += (item.value * item.jsprice);
		})
		this.setData({totalMoney:total});
	}

})
