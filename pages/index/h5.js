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
    this.__urlRaw = url;

    let that = this;
    wx.getSystemInfo({
      success: function (res) {
        let ua = JSON.stringify(res);
        url += ((url.indexOf('?') > -1 ? '&' : '?') + '_ua=' + encodeURIComponent(ua));
        console.log('H5 加载: ' + url);
        that.setData({ url: url });
      },
    })
  },

  onShareAppMessage: function () {
    return app.warpShareData('/pages/index/h5?url=' + encodeURIComponent(this.__urlRaw));
  }
})