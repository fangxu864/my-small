/**
 * Author: huangzhiyang
 * Date: 2017/1/4 14:09
 * Description: ""
 */
var Config = require("./config.js");
var Common = {
    appId: "wx5605b231e666f425",
	REQUEST_HOST : "https://api.12301dev.com/index.php",
	SESSION_STORAGE_KEY : "pft-session-storage",
	SESSION_STORAGE_EXPIRE_KEY : "pft-session-storage-expire",  //session过期时长的key
	SESSION_STORAGE_AT_TIME : "pft-session-storage-attime",
	getAccount : function(){
		return Config.account;
	},

	orderStatus : {
		0 : {
			name : "未使用",
			color:"#3eba40"
		},
		1 : {
			name : "已使用",
			color:"#f37138"
		},
		2 : {
			name : "已过期",
			color:"#e12424"
		},
		3 : {
			name : "已取消",
			color:"#f37138"
		},
		4 : {
			name : "凭证码被替代",
			color:"#f37138"
		},
		5 : {
			name : "被终端撤销(已取消)",
			color:"#f37138"
		},
		6 : {
			name : "被终端撤销(已使用)",
			color:"#f37138"
		},
		7 : {
			name : "已部分使用",
			color:"#f37138"
		},
		9 : {
			name : "已删除",
			color:"#f37138"
		},
		101 : {
			name : "退票中",
			color : "#e12424"
		}
	},

	//全局显示loading状态
	showLoading : function(text){
		wx.showToast({
			title : text || "努力加载中..",
			icon : "loading",
			duration : 10 * 1000
		})
	},

	//隐藏loading
	hideLoading : function(){
		wx.hideToast();
	},

	/**
	 * 弹窗显示错误信息
	 * @param errMsg  错误信息  必填
	 * @param title   弹窗标题  可选
	 */
	showError : function(errMsg,title){
		wx.showModal({
			title : title || "出错",
			content : errMsg || "出错",
			showCancel : false
		})
	},

	/**
	 * 登录微信 然后用返回的code去服务器取sessionKey
	 */
	login : function(callback){
		var that = this;
		var sessionKey = this.SESSION_STORAGE_KEY;
		var expireKey = this.SESSION_STORAGE_EXPIRE_KEY;
		var atTimeKey = this.SESSION_STORAGE_AT_TIME;
		var showError = this.showError;
		var account = this.getAccount();
		console.log("缓存过期，调用登录登录接口重新登录");
		wx.login({
			success : function(res){
				var code = res.code;
				if(code){
					wx.request({
						url : that.REQUEST_HOST + "?c=Mall_Member&a=smallAppLogin",
						method : "POST",
						header : {
							"Small-App" : account
						},
						data : {
                            account: account,
							code : code
						},
						success : function(res){
							console.log(res);
							var _res = res.data;
							var data = _res.data;
							var code = _res.code;
							if(code==200){ //由code换session成功后，把session存入本地storage
								var sessionValue = data.sessionKey;
								var expireValue = data.expire;
								wx.setStorage({
									key : sessionKey,
									data : sessionValue
								});
								wx.setStorage({
									key : expireKey,
									data : expireValue
								});
								//把当前登录成功后换回session的时间点存下来
								//用于后面比对是否过期
								wx.setStorage({
									key : atTimeKey,
									data : (+new Date())
								});
								callback && callback(sessionValue,expireValue);
							}else{
								showError(_res.msg);
							}
						},
						fail : function(err){
							console.log(err);
							console.log("请求后端接口：https://api.12301dev.com/index.php?c=Mall_Member&a=smallAppLogin");
							console.log(JSON.stringify(err));
							//showError("code换session出错");
							showError("出错出错出错出错出错");
						}
					})
				}else{
					showError('获取用户登录态失败！' + res.errMsg)
				}
			},
			fail : function(){
				showError("微信登录接口调用失败");
			}
		})
	},

	/**
	 * 每次发ajax请求给后端时，需要先判断是否已经微信登录
	 * 如果已登录，接着判断登录session有没有过期，如果过期需重新登录
	 * 如果未登录，需登录后通过返回的code，请求后端，用code换回session_key，存在本地
	 * 每次发请求需检查此session_key是否过期
	 * @param callback
	 */
	auth : function(callback){
		var that = this;
		var sessionKey = this.SESSION_STORAGE_KEY;
		var expireKey = this.SESSION_STORAGE_EXPIRE_KEY;
		var atTimeKey = this.SESSION_STORAGE_AT_TIME;
		var showError = this.showError;
		var account = this.getAccount();


		// wx.clearStorage();

		//判断是否过期
		var isOverTime = function(sucCallback,failCallback){
			sucCallback = sucCallback || function(){};
			failCallback = failCallback || function(){};
			wx.getStorage({
				key : atTimeKey,
				success : function(res){

					var lastTime = res.data;
					if(lastTime){
						wx.getStorage({
							key : expireKey,
							success : function(res){
								var expire = res.data;
								if(expire){
									var nowTime = +new Date();
									if(nowTime-lastTime>=(expire * 1000)){ //过期
										sucCallback({isOver:true,expire:expire});
									}else{ //未过期
										sucCallback({isOver:false,expire:expire});
									}
								}else{
									failCallback();
								}
							},
							fail : function(){
								failCallback();
							}
						})
					}else{
						failCallback();
					}
				},
				fail : function(){

					failCallback();
				}
			})
		};

		//登录微信 然后用返回的code去服务器取sessionKey
		wx.getStorage({
			key : sessionKey,
			success : function(res){ //如果存在
				var session = res.data;

				//判断此session是否过期
				isOverTime(
					//判断有结果返回
					function(result){
						if(result.isOver){ //已过期,则重新登录去获取session
							that.login(function(session,expire){
								callback && callback(session,expire);
							});
						}else{ //未过期
							callback && callback(session,result.expire);
						}
					},
					function(){
						showError("判断是否过期失败");
					})
			},
			fail : function(err){ //不存在 则重新登录
				that.login(function(session,expire){
					callback && callback(session,expire);
				});
			}
		})
	},

	/**
	 * 封装wx.request
	 * 这里已为每个请求附带flag、account两个参数
	 * 具体写业务时就不需要在每写一个request时都传这两个参数
	 * opt中的url参数还是跟以前的方式一样: /r/c/a/
	 * @param opt
	 *
	 * how to use:
	 *
	 * Common.request({
	 * 		debug : true,                  //debug==true时 用于脱离后端开发，模拟假数据
	 * 		url : "/r/c/a/",               //路径写法还是用微商城一样的写法，不需要写api.12301dev.com，这个方法已经为你做好路径转换
	 * 		data : {                       //传给后端的数据
	 * 			key : value
	 * 		},
	 *		loading : function(){},        //请求加载时
	 *		complete : function(res){},    //请求完成时执行  不论成功或失败都会执行
	 *		success : function(res){},     //服务器成功处理了请求 code==200
	 *		error : function(msg,code){}   //服务器无法处理该请求或处理时出错  msg:错误消息   code:具体的错误代码
	 * })
	 *
	 *
	 */
	request : function(opt){
		var that = this;

		//默认参数
		var defaults = {
			debug: false,
			url : "",
			method : "POST",
			dataType : "json",
			data : {},
			header : {},
			loading : function(){},
			success : function(){},
			fail : function(err){
				wx.showModal({
					title : "出错",
					content : JSON.stringify(err),
					showCancel : false
				})
			},
			error : function(msg,code){
				wx.showModal({
					title : "出错",
					content : msg + "  错误代码："+code,
					showCancel : false
				})
			},
			complete : function(){}
		};

		//混合默认参数和新参数
		var newOpt = {};
		for(var i in defaults){
			if(typeof opt[i]=="undefined"){
				newOpt[i] = defaults[i];
			}else{
				newOpt[i] = opt[i];
			}
		}

		//设置header的small-app
		newOpt.header["Small-App"] = this.getAccount();
		
		// 执行loading函数，显示动画
		newOpt.loading();

		//开发debug
		if(newOpt.debug) return setTimeout(function(){
			newOpt.complete();
			newOpt.success();
		},1000);

		var url = newOpt.url;
		if(!url) return false;
		//index.php?c=Mall_Product&a=productList
		var host = this.REQUEST_HOST;
		var urlArray = [];
		url.split("/").forEach(function(item){
			if(item) urlArray.push(item);
		});
		var c = "?c=" + urlArray[1];
		var a = "&a=" + urlArray[2];
		newOpt["url"] = host + c + a;


		//complete中间件
		var _complete = newOpt.complete;
		newOpt["complete"] = function(res){
			var _res = res.data;
			var statusCode = res.statusCode;
			if(statusCode==200){
				_complete(_res);
			}else{
				wx.showModal({
					title : "出错",
					content : _res,
					showCancel : false
				})
			}
		};

		//success中间件
		var _success = newOpt.success;
		newOpt["success"] = function(res){
			var _res = res.data;
			var statusCode = res.statusCode;
			if(statusCode==200){
				var code = _res.code;
				var msg = _res.msg;
				var status = _res.status;
				if(_res.code==200 || status=="ok"){
					_success(_res);
				}else if(_res.code==202){ //如果服务端返回202,但客户端存的session还未过期，则客户端还是要重新登录，去获取新的session
					that.login(function(session,expire){
						that.request(opt)
					})
				}else{
					newOpt.error(msg,code);
				}
			}else{

				wx.showModal({
					title : "出错",
					content : JSON.stringify(_res),
					showCancel : false
				})
			}
		};

		//权限校验中间件
		this.auth(function(session,expire){
			newOpt["header"]["Session-Key"] = session;
			wx.request(newOpt);

		})
	},

	getToday : function(){
		var date = new Date();
		var y = date.getFullYear();
		var m = date.getMonth()+1;
		var d = date.getDate();
		if(m<10) m = "0" + m;
		if(d<10) d = "0" + d;
		return y+"-"+m+"-"+d;
	},

	MinueToDayTime : function(daytime){
		var day = daytime/(24*60);
		var day_init = String(day).split(".")[0] * 1;
		var hour = (day-day_init) * 24;
		var hour_init = String(hour).split(".")[0] * 1;
		var mine = (hour-hour_init) * 60;
		var mine_init = Math.ceil(mine);
		var day_text = day_init==0 ? "" : (day_init+"天");
		var hour_text = (day_init==0 && hour_init==0) ? "" : (hour_init+"小时");
		var mine_text = mine_init!=0 ? (mine_init + "分钟") : "";
		return day_text+hour_text+mine_text;
	},

	//验证身份证
	validateIDCard : function(code){
		var city={11:"北京",12:"天津",13:"河北",14:"山西",15:"内蒙古",21:"辽宁",22:"吉林",23:"黑龙江 ",31:"上海",32:"江苏",33:"浙江",34:"安徽",35:"福建",36:"江西",37:"山东",41:"河南",42:"湖北 ",43:"湖南",44:"广东",45:"广西",46:"海南",50:"重庆",51:"四川",52:"贵州",53:"云南",54:"西藏 ",61:"陕西",62:"甘肃",63:"青海",64:"宁夏",65:"新疆",71:"台湾",81:"香港",82:"澳门",91:"国外 "};
		var tip = "";
		var pass= true;

		if(!code || !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(code)){
			tip = "身份证号格式错误";
			pass = false;
		}else if(!city[code.substr(0,2)]){
			tip = "地址编码错误";
			pass = false;
		}else{
			//18位身份证需要验证最后一位校验位
			if(code.length == 18){
				code = code.split('');
				//∑(ai×Wi)(mod 11)
				//加权因子
				var factor = [ 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2 ];
				//校验位
				var parity = [ 1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2 ];
				var sum = 0;
				var ai = 0;
				var wi = 0;
				for (var i = 0; i < 17; i++)
				{
					ai = code[i];
					wi = factor[i];
					sum += ai * wi;
				}
				var last = parity[sum % 11];
				if(parity[sum % 11] != code[17]){
					tip = "校验位错误";
					pass =false;
				}
			}
		}
		return pass;
	},

	/**
	 * 字符串省略
	 * @param string 字符串
	 * @param length 长度
	 */
	ellipsis: function (string , length) {
		var str = string;
		if( string.length > length ){
			var reg = new RegExp('.{0,'+length+'}');
			str = str.match(reg)[0] + '...';
		}
		return str;
	},

	/**
	 * @mehtod 判断真假
	 */
	judgeTrue: function( param ) {
		var type = Object.prototype.toString.call(param);
		switch (type){
			case '[object Array]':
				return param.length === 0 ?  !1 : !0 ;
				break;
			case '[object Object]':
				var t;
				for (t in param)
					return !0;
				return !1;
				break;
			case '[object String]':
				return param === '' ? !1 : !0 ;
				break;
			case '[object Number]':
				return param === 0 ? !1 : !0 ;
				break;
			case '[object Boolean]':
				return param === false ? !1 : !0;
				break;
			case '[object Null]':
				return !1;
				break;
			case '[object Undefined]':
				return !1;
				break;
			default :
				return type;
		}
	}
};


module.exports = Common;



