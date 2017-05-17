//index.js
//获取应用实例
var app = getApp(),
    common = require('../../utils/common.js');

Page({
     onShareAppMessage: function () {
        return {
            title: '鼓浪屿核心景点',
            path: 'pages/pdetail/pdetail?lid=5322',
            success: function(res) {
            },
            fail: function(res) {
                // 转发失败
            }
        }
    },
    data: {
        plist:          [],
        hasMore:        true,
        isHasMoreHidden: false,
        isLoading:      false,
        pageSize:       10,
        lastPos:        0,
        searchInpFocus: false,
        searchVal:      '',
        isClearShow:    false,
        noData:         false,
        hasKeyword:     false,
        lastSearch:     ''
    },
    onLoad: function () {
    
        var that = this;

        this.getData({
            keyword: '',

            loading: function() {
                common.showLoading();
            },

            complete: function ( res ) {},

            success: function ( res ) {
                common.hideLoading();

                that.setData({
                    plist: res.data.list,
                    lastPos: res.data.lastPos
                })

                if( res.data.list.length ) {

                } else {
                    that.setData({
                        noData: true
                    })
                }
            }
        })
    },
    getData: function( opt ) {
        var that = this,
            keyword = opt.keyword || '';

        if (!this.data.hasMore) return;

        if( !this.data.isLoading ) {
            common.request({
                url: '/r/Mall_Product/productList/',
                data: {
                    keyword: keyword,
                    topic: '',
                    type: 'all',
                    city: '',
                    pageSize: this.data.pageSize,
                    lastPos: this.data.lastPos
                },
                debug: false,
                loading : function(){
                    if( opt.loading ) {

                        opt.loading();

                    } else {

                        that.setData({
                            isLoading: true
                        })

                    }
                },
                complete: function( res ) {
                    opt.complete && opt.complete( res );
                },
                success: function( res ) {
                    if( !opt.loading ) {
                        that.setData({
                            isLoading: false
                        });
                    }



                    opt.success && opt.success( res );
                }
            })
        } else {
            console.log('正在请求  请稍后');
        }
    },
    //事件处理函数
    navigateToDetail: function( e ) {
        var currentTarget = e.currentTarget,
            dataset = currentTarget.dataset,
            lid = dataset.lid,
            ptype = dataset.ptype,
            topic = dataset.topic;
            
        wx.navigateTo({
          url: '../pdetail/pdetail?lid=' + e.currentTarget.dataset.lid
        });
    },
    scrollToLower: function( e ) {
        var that = this;

        this.getData({
            keyword: this.data.searchVal,

            complete: function ( res ) {},

            success: function ( res ) {
                that.setData({
                    plist: that.data.plist.concat( res.data.list ),
                    lastPos: res.data.lastPos
                })

                if( res.data.lastPos == that.data.lastPos ) {
                    that.setData({
                        hasMore: false
                    });
                }
            }
        })
    },
    searchIconTap: function(){
        this.setData({
            searchInpFocus: true
        })
    },
    searchInput: function( e ) {
        this.setData({
            searchVal: e.detail.value
        })

        if( this.trim( e.detail.value )!='' ) {
            this.setData({
                hasKeyword: true,
                isClearShow: true
            })
        } else {
            this.setData({
                hasKeyword: false,
                isClearShow: false
            })
        }
    },
    clearSearch: function() {
        this.setData({
            searchVal: '',
            hasKeyword: false,
            isClearShow: false
        })
    },
    search :function() {
        var that = this;

        that.setData({
            hasMore: true,
            lastPos: 0,
            lastSearch: this.data.searchVal
        })

        that.getData({
            keyword: this.data.searchVal,

            loading: function() {
                that.setData({
                    noData: false
                });
                
                common.showLoading();
            },

            complete: function ( res ) {},

            success: function ( res ) {
                common.hideLoading();

                that.setData({
                    plist: res.data.list,
                    lastPos: res.data.lastPos
                })

                if( res.data.list.length ) {
                } else {
                    that.setData({
                        noData: true
                    })
                }
            }
        })
    },
    //去除前后空格
    trim: function( str ) {
        return str.replace(/(^\s*)|(\s*$)/g, '');
    }
})
