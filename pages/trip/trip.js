/**
 * @author [fangxu]
 * @email [864109504@qq.com]
 * @create date 2017-08-21 05:49:42
 * @modify date 2017-08-21 05:49:42
 * @desc [description]
*/

//获取应用实例
var Common = require("../../utils/common.js");
var QR = require("../../utils/qrcode.js");
var app = getApp();


/**
 * 二维码页
 */
Page({
    
    data: {
        qrImgSrc: '',
        scenicData:{
            "code": 200,
            "data": {
                "6603": {
                    "lid": "6603",
                    "pos": "0,0",
                    "orderlist": [
                        {
                            "lid": "6603",
                            "ltitle": "（mm测试）江滨公园",
                            "ordernum": "4022440",
                            "status": "0",
                            "begintime": "2017-08-21",
                            "endtime": "2017-08-21",
                            "code": "012938",
                            "paystatus": "1",
                            "cancel": 1,
                            "pay": 0,
                            "tickets": [
                                {
                                    "tnum": "2",
                                    "tid": "31255",
                                    "code": "012938",
                                    "title": "一票一码VIP",
                                    "ordernum": "4022440",
                                    "codes": [
                                        {
                                            "idcard": "",
                                            "checked": "0",
                                            "code": "OD#e2ero501"
                                        },
                                        {
                                            "idcard": "",
                                            "checked": "0",
                                            "code": "OD#e2ero502"
                                        }
                                    ]
                                },
                                {
                                    "tnum": "1",
                                    "tid": "31257",
                                    "code": "012938",
                                    "title": "一票一码成人票",
                                    "ordernum": "4022441",
                                    "codes": [
                                        {
                                            "idcard": "",
                                            "checked": "0",
                                            "code": "OD#pP1prb01"
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            "lid": "6603",
                            "ltitle": "（mm测试）江滨公园",
                            "ordernum": "4022435",
                            "status": "0",
                            "begintime": "2017-08-21",
                            "endtime": "2017-08-21",
                            "code": "365409",
                            "paystatus": "1",
                            "cancel": 1,
                            "pay": 0,
                            "tickets": [
                                {
                                    "tnum": "1",
                                    "tid": "31255",
                                    "title": "一票一码VIP",
                                    "ordernum": "4022435",
                                    "codes": [
                                        {
                                            "idcard": "",
                                            "checked": "0",
                                            "code": "OD#0jWbwO01"
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            "lid": "6603",
                            "ltitle": "（mm测试）江滨公园",
                            "ordernum": "4022434",
                            "status": "0",
                            "begintime": "2017-08-21",
                            "endtime": "2017-08-21",
                            "code": "479263",
                            "paystatus": "1",
                            "cancel": 1,
                            "pay": 0,
                            "tickets": [
                                {
                                    "tnum": "2",
                                    "tid": "31255",
                                    "title": "一票一码VIP",
                                    "ordernum": "4022434",
                                    "codes": [
                                        {
                                            "idcard": "",
                                            "checked": "0",
                                            "code": "OD#Vp7Rrd01"
                                        },
                                        {
                                            "idcard": "",
                                            "checked": "0",
                                            "code": "OD#Vp7Rrd02"
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                "14944": {
                    "lid": "14944",
                    "pos": "0,0",
                    "orderlist": [
                        {
                            "lid": "14944",
                            "ltitle": "测试景区1111111",
                            "ordernum": "4022481",
                            "status": "0",
                            "begintime": "2017-08-21",
                            "endtime": "2017-08-21",
                            "code": "812936",
                            "paystatus": "1",
                            "cancel": 1,
                            "pay": 0,
                            "tickets": [
                                {
                                    "tnum": "2",
                                    "tid": "31260",
                                    "title": "一票一码一身份证老人票",
                                    "ordernum": "4022481",
                                    "codes": [
                                        {
                                            "idcard": "632821198704227934",
                                            "checked": "0",
                                            "code": "OD#mnNabn01"
                                        },
                                        {
                                            "idcard": "652901198907275913",
                                            "checked": "0",
                                            "code": "OD#mnNabn02"
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            },
            "msg": ""
        }
    },

    onLoad: function () {
        QR.qrApi.draw( "121212" ,"qrcodeCanvas","150","150");
        QR.qrApi.draw( "4545" ,"qrcodeCanvas1","150","150");
    },

    /**
     * 点击二维码图片时
     */
    onQrImgTap: function () {
        wx.canvasToTempFilePath({
            canvasId: 'qrcodeCanvas',
            success: function(res) {
                wx.previewImage({
                    current: res.tempFilePath, // 当前显示图片的http链接
                    urls: [res.tempFilePath] // 需要预览的图片http链接列表
                })
            }
        })
    }



   
    
});