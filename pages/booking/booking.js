var Common = require("../../utils/common.js");
var app = getApp();


//----模块----
var QueryTimeScenic_mode = require("./modules/qurey-time-scenic/index.js"); //景区类查询时间模块
var QueryTimeHotel_mode = require("./modules/query-time-hotel/index.js"); //酒店类查询时间模块
var BookingBiz_mode = require("./business.js"); //业务模块
var SmallTips_mode = require("./modules/small-tips/index.js"); //小提示模块
var TicketList_mode = require("./modules/ticket-list/index.js"); //票类列表
var TotalMoney_mode = require("./modules/total-money/index.js"); //总价模块
var TouristInfo_mode = require("./modules/tourist-info/index.js"); //游客信息


Page({

	initBookInfoData: {}, //初始化获取的数据

	data: {
		aid: "",
		pid: "",
		p_type: "", //产品类型
		needID: 0, //是否需要填写身份证,0不需要,1需要填一个,2需要填多个
		//和视图相关的数据
		viewData: {

			//询问时间模块
			qureyTimeMode: {
				beginDate: "", //开始时间
				endDate: "", //结束时间
				beginWeek: "", //开始时间对应的星期几
				endWeek: "", //结束时间对应的星期几
				beginPrice: "", //开始日期对应的最低价格
				endPrice: "", //结束日期对应的最低价格
				endPrice: "", //结束日期对应的最低价格
				diffDays: "1", //开始时间和结束时间对应的天数
				beginActive: "", //开始时间是否选中
				isShowTwo: true, //是否显示两个日期
				today: Common.getToday(),
				tomorrow: Common.getTomorrow()
			},

			//小标签部分
			smallTips: {
				validTime: "", //有效期
				verifyTime: "", //验证限制时间
				refund_rule_text: "", //退票规则文本
				batch_day: "", //分批每日限制张数
				refund_rule: "", //2不可退，1游玩日期前可退，0有效期前可退
				dialogshow: false, // 弹框是否显示
				refundTicketRuleText: "退票规则"
			},

			//票类列表
			ticketList: {
				ticketList: [] //列表数据
			},

			//游客信息模块
			touristInfo: {
				needID: "", //是否需要填写身份证,0不需要,1需要填一个,2需要填多个
				contactDisplay: "none", // 常用联系人是否显示
				simpleMsgPopDisplay: "none", // 简单显示信息是否显示
				idcardListWrapDisplay: "none", //身份证列表是否显示
				contactData: {},
				refundTicketRuleText: "退票规则",
				touristInfoTotalNum: 0,//共计需要身份证的数量
				touristInfoAlreadyNum: 0,//已正确填写身份证的数量
				touristInfoArr: [],//联系人数组

				ordername: "", //取票人姓名
				orderNameErrTipShow: false,//取票人姓名错误信息
				contacttel: "", //取票人手机
				contacttelErrTipShow: false, //取票人手机错误信息
				sfz:"", //取票人id
				needIDErrTipShow:false//取票人id错误信息
			},

			//底部总价模块
			totalMoney: {
				totalMoney: '0', //总价
				canSubmit: true //是否可提交
			}

		}

	},

	/**
	 * 注入各个模块
	 * 
	 */
	pourIntoModules: function () {
		Object.assign(this, QueryTimeScenic_mode); //景区类时间查询模块
		Object.assign(this, QueryTimeHotel_mode); //酒店类时间查询模块
		Object.assign(this, BookingBiz_mode); //业务模块
		Object.assign(this, SmallTips_mode); //小tips模块
		Object.assign(this, TicketList_mode); //票类列表
		Object.assign(this, TotalMoney_mode); //总价模块
		Object.assign(this, TouristInfo_mode); //游客信息
	},

	onLoad: function (option) {

		//模块注入
		this.pourIntoModules();

		this.setData({
			aid: option.aid || "3385",
			pid: option.pid || "6698"
		})

		//根据aid和pid获取初始化信息
		var pid = this.data.pid;
		var aid = this.data.aid;
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

	/**
	 * 初始化时请求产品详情
	 * 
	 * @param {any} pid 
	 * @param {any} aid 
	 */
	queryBookingInfo: function (pid, aid) {
		var _this = this;
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
				_this.initBookInfoData = data;

				//设置p_ytpe
				_this.setData({
					"p_type": data.p_type,
					"needID": data.needID
				})

				//设置标题
				wx.setNavigationBarTitle({
					title: data.title
				})

				_this.stips_init(data); //小tips初始化
				_this.tlist_init(data); //票类列表初始化
				_this.tinfo_init(data); //游客信息初始化
			}
		})
	}

});
