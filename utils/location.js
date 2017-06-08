

//和位置相关的工具
module.exports = {

    //精度
    longitude: null,

    //纬度
    latitude: null,

    /**
     * 获取经纬度
     */
    getLocation: function () {
        //如果缓存了经纬度
        if( this.latitude && this.longitude ){
            return{
                longitude: longitude
            }
        }
        wx.getLocation({
            type: 'wgs84',
            success: function(res) {
                var latitude = res.latitude;
                var longitude = res.longitude;

            }
        })
    }

};