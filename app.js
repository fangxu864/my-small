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
      _limitLength: 3,

      //历史记录栈
      _shopData: [],

      //增加一个店铺
      _addShop: function (opt) {
        //栈顶增加
        this._shopData.unshift({
          img: opt.img,
          name: opt.name,
          scenCode: opt.scenCode
        })
        if (this._shopData.length > this._limitLength) {
          //栈尾部删除
          this._shopData.pop();
        }
      },

      /**
       * 根据scenCode来检查是否已加入历史栈
       * 
       * @param {any} scenCode 
       */
      _checkExist: function (scenCode) {
        var isExist = false,
          existIndex = 0,
          existItem = {};
        console.log(this._shopData);
        //循环
        this._shopData.forEach(function (item, index) {
          if (item.scenCode == scenCode) {
            existIndex = index;
            isExist = true;
          }
        });

        //如果存在，将此项删除，并返回此项
        if (isExist) {
          existItem = this._shopData.splice(existIndex, 1);
        }

        return {
          isExist: isExist,
          existItem: existItem[0]
        };
      },

      /**
       * @public 增加一项历史记录
       * 
       * @param {any} opt 
       */
      addHistoryShop: function (opt) {
        var checkResult = this._checkExist(opt.scenCode);
        //如果存在，将此项删除，并移动到栈顶
        if (checkResult.isExist) {
          this._addShop(checkResult.existItem);
        } else {
          this._addShop(opt);
        }
      },


      /**
       * @public 获取历史记录
       * 
       */
      getShopData: function () {
        console.log(this._shopData);
        return this._shopData;
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