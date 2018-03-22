const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  onLoad: function (e) {
    var _url = e.url;
    _url = decodeURIComponent(_url);
    if (e.bgcolor) {
      wx.setNavigationBarColor({
        frontColor: (e.bgcolor == 'fff' || e.bgcolor == 'ffffff') ? '#000000' : '#ffffff',
        backgroundColor: '#' + e.bgcolor
      })
    }
    if (_url.substr(0, 4) != 'http') {
      _url = zutils.baseUrl + _url;
    }
    console.log('H5 - ' + _url);
    this.setData({
      url: _url
    });
  },

  onShareAppMessage: function () {
    return app.warpShareData('/pages/index/h5?url=' + encodeURIComponent(this.data.url));
  }
})