/**
 * @author [fangxu]
 * @email [864109504@qq.com]
 * @create date 2017-09-20 02:03:30
 * @modify date 2017-09-20 02:03:30
 * @desc [description]
*/



var IndexBiz = require("./business.js");
var Common = require("../../utils/common.js");
var App = getApp();

Page(Object.assign({}, IndexBiz, {
    data: {
        showDialog: false,

        inputVal: "",



        //汉字键盘
        carText: [
            "京", "津", "沪", "冀", "豫", "云", "辽", "黑",
            "湘", "皖", "鲁", "新", "苏", "浙", "赣", "鄂",
            "桂", "甘", "晋", "蒙", "陕", "吉", "闽", "贵",
            "粤", "川", "青", "藏", "琼", "宁", "渝"
        ],

        carText: {
            line1: ["京", "津", "沪", "冀", "豫", "云", "辽", "黑"],
            line2: ["湘", "皖", "鲁", "新", "苏", "浙", "赣", "鄂"],
            line3: ["桂", "甘", "晋", "蒙", "陕", "吉", "闽", "贵"],
            line4: ["粤", "川", "青", "藏", "琼", "宁", "渝"]
        },

        wordNum: {
            line1: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
            line2: ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
            line3: ["A", "S", "D", "F", "G", "H", "J", "K", "L", "delete"],
            line4: ["Z", "X", "C", "V", "B", "N", "M", "完成"]
        },

        //输入框状态
        parkInpActive: false,

        // 键盘
        wordNumBoxSow: false, //数字键盘
        hanziBoxSow: true, //汉字键盘
    },

    onLoad(opt) {
        console.log(decodeURIComponent(opt.scenCode))
        //转发进来的会有scenCode参数
        if (opt.scenCode) {
            App.globalData.curScenCode = decodeURIComponent(opt.scenCode);
        }
    },

    /**
     * 分享
     */
    onShareAppMessage: function () {
        return {
            title: this.data.land.title,
            path: 'pages/index/index?parkId=' + encodeURIComponent(curParkId),
            success: function (res) { },
            fail: function (res) {
                // 转发失败
            }
        }
    },

    parkInputTap() {
        this.setData({
            showDialog: !this.data.showDialog,
            parkInpActive: !this.data.parkInpActive
        });
    },

    onKeyboradTap(e) {
        var type = e.target.dataset.type;
        if (type !== "btn") return false;
        var curCode = e.target.dataset.code;

        if (curCode == "完成") {

            this.biz_query(this.data.inputVal);

        } else {
            if (curCode == "delete") {
                var text = this.data.inputVal.slice(0, -1);
            } else {
                var text = this.data.inputVal + curCode;
            }
            this.setData({
                "inputVal": text
            })
        }

        this.onInputValChange();

    },

    /**
     * 长按删除键,删除全部
     * 
     * @param {any} e 
     */
    deleteLongtap(e) {
        var type = e.target.dataset.type;
        var curCode = e.target.dataset.code;
        if (curCode == "delete") {
            this.setData({
                "inputVal": ""
            })
            this.onInputValChange();
        }
    },

    /**
     * 文本内容有变化时,更改键盘状态
     * 
     */
    onInputValChange() {
        if (this.data.inputVal.length >= 1) {
            this.setData({
                wordNumBoxSow: true, //数字键盘
                hanziBoxSow: false, //汉字键盘
            })
        } else {
            this.setData({
                wordNumBoxSow: false, //数字键盘
                hanziBoxSow: true, //汉字键盘
            })
        }
    },


    //当二维码点击时
    onQrCodeTap: function () {
        var _this = this;
        var data = {
            account: encodeURIComponent(Common.getAccount()),
            scenCode: encodeURIComponent("park/index/index?scenCode=" + encodeURIComponent(App.globalData.curScenCode)),
            page: encodeURIComponent("park/index/index"),
            codeType: 1
        };

        wx.navigateTo({
            url: '../../pages/qrcode/qrcode?' + Common.urlStringify(data)
        });
    }

}))