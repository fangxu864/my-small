//app.js
App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    //var logs = wx.getStorageSync('logs') || []
    //logs.unshift(Date.now())
    //wx.setStorageSync('logs', logs)
  },
  getUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },
  globalData: {
    userInfo: null,
    //当前的ScenCode
    curScenCode: "",
    //当前的经度
    curLatitude: "",
    //当前的纬度
    curLongitude: "",
    //最近访问的景点
    historyShop: {

      //历史记录长度限制
      limitLength: 3,

      //历史记录栈
      shopData: [],

      //增加一个店铺
      addShop: function (opt) {
        //栈顶增加
        this.shopData.unshift({
          img: opt.img,
          name: opt.name,
          scenCode: opt.scenCode
        })
        if (this.shopData.length > this.limitLength) {
          //栈尾部删除
          this.shopData.pop();
        }
      },

      /**
       * 根据scenCode来检查是否已加入历史栈
       * 
       * @param {any} scenCode 
       */
      checkExist: function (scenCode) {
        var isExist = false;
        console.log(this.shopData);
        //循环
        this.shopData.forEach(function (item) {
          if (item.scenCode == scenCode) {
            isExist = true;
          }
        });
        return isExist;
      }
    }
  },

  //缓存仓库
  cacheHub: {
    //首页
    index: {},
    //店铺列表页面
    shopList: {},
    //产品详情页面
    productDetail: {}
  }
});