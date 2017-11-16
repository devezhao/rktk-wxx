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
    this.setData({
      url: 'https://rktk.qidapp.com/' + _url
    });

    if (!wx.canIUse('web-view')) {
      wx.showModal({
        title: '提示',
        content: '你的微信版本不支持此功能，请升级最新版微信',
        showCancel: false,
        success: function(res) {
          wx.navigateBack({
          });
        }
      })
    }
  },

  onShareAppMessage: function () {
    return app.shareData();
  }
})