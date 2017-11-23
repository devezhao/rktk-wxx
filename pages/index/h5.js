const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  onLoad: function (e) {
    if (!wx.canIUse('web-view')) {
      wx.showModal({
        title: '提示',
        content: '你的微信版本不支持此功能，请升级最新版微信',
        showCancel: false,
        success: function (res) {
          wx.navigateBack({
          });
        }
      });
      return;
    }

    var _url = e.url;
    _url = decodeURIComponent(_url);
    if (e.bgcolor) {
      wx.setNavigationBarColor({
        frontColor: (e.bgcolor == 'fff' || e.bgcolor == 'ffffff') ? '#000000' : '#ffffff',
        backgroundColor: '#' + e.bgcolor
      })
    }
    this.setData({
      url: 'https://rktk.qidapp.com/' + _url
    });
  },

  onShareAppMessage: function () {
    return app.warpShareData('/pages/index/h5?url=' + encodeURIComponent(this.data.url));
  }
})