/**
 * Created by fangxu on 2017/7/7.
 */

/**
 * 常用联系人的相关操作
 */
module.exports = {

    /**
     * 增加一个联系人
     * @param data { name: "张三",tel: "15659329965", id: "411522199312154681" }
     */
    addContact: function ( data ,callBack ) {
        var callBackF = callBack || function () {};
        var contactData = this.getContact();
        if( Object.prototype.toString.call( contactData[ data.tel ] ) !== "[object Object]" ){
            contactData[ data.tel ] = {};
        }
        contactData[ data.tel ]["name"] = data.name || '';
        contactData[ data.tel ]["tel"] = data.tel || '';
        contactData[ data.tel ]["id"] = data.id || '';
        contactData[ data.tel ]["timeStamp"] = new Date().getTime();
        var contactStructLength = this.getObjectLength( contactData );
        //超出指定长度，删除最早的一个
        if( contactStructLength > this.contactLegth ){
            this.delEarliest( contactData );
        }
        wx.setStorage({
            key:"pft-common-contact",
            data: contactData,
            success: function () {
                callBackF();
            }
        })
    },

    /**
     * 删除一个联系人
     */
    delContact: function ( key , callBack ) {
        var callBackF = callBack || function () {};
        var contactData = this.getContact();
        delete contactData[ key ];
        wx.setStorage({
            key:"pft-common-contact",
            data: contactData,
            success: function () {
                callBackF();
            }
        })
    },

    /**
     * 获取联系人
     */
    getContact: function () {
        try {
            var value = wx.getStorageSync('pft-common-contact');
            if (value) {
                return value
            }else{
                return {}
            }
        } catch (e) {
            return {}
        }
    },

    /**
     * 获取排序后的数组
     */
    getContactArr: function () {
        var arr = [] , _this = this;
        try {
            var obj = wx.getStorageSync('pft-common-contact');
            if ( obj ) {
                //获取对象的长度
                var len = _this.getObjectLength( obj );
                while( len > 0 ){
                    len--;
                    //最早的数据入栈
                    arr.unshift( obj[ this.getEarliestKey( obj ) ] );
                    //删除对象中最早的数据
                    _this.delEarliest( obj );
                }
                return arr
            }else{
                return arr;
            }
        } catch (e) {
            return arr;
        }
    },

    /**
     * 最近联系人数据结构
     */
    contactStruct: {
        15659329937: {
            name: "张三",
            tel: "15659329965",
            id: "411522199312154681",
            timeStamp: 15456621455
        }
    },

    /**
     * 最多存储常用联系人数量
     */
    contactLegth: 6 ,

    /**
     * 获取对象长度
     * @param obj
     */
    getObjectLength: function ( obj ) {
        var i = 0;
        for( var key in obj ){ i++ };
        return i;
    },

    /**
     * 删除最早的一个联系人
     */
    delEarliest: function ( obj ) {
        var _this = this;
        var key = _this.getEarliestKey( obj );
        delete obj[ key ];
    },

    /**
     * 获取最早的键值
     * @param obj
     * @returns {*}
     */
    getEarliestKey: function ( obj ) {
        var earliestKey = null,
            earliestStamp = 14994010797122; //初始值为14位
        for( var key in obj ){
            if( Number( obj[key]["timeStamp"] ) < earliestStamp ){
                earliestStamp = Number( obj[key]["timeStamp"] );
                earliestKey = key;
            }
        }
        return earliestKey;
    }
};