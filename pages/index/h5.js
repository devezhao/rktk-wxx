const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  onLoad: function (e) {
    if (e.bgcolor) {
      wx.setNavigationBarColor({
        frontColor: (e.bgcolor == 'fff' || e.bgcolor == 'ffffff') ? '#000000' : '#ffffff',
        backgroundColor: '#' + e.bgcolor
      })
    }

    let url = decodeURIComponent(e.url);
    if (url.substr(0, 4) != 'http') url = zutils.baseUrl + url;
  },

  onShareAppMessage: function () {
    return app.warpShareData('/pages/index/h5?url=' + encodeURIComponent(this.data.url));
  }
})