const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  copy: function (e) {
    var data = e.currentTarget.dataset.text;
    wx.setClipboardData({
      data: data,
      success: function (res) {
        wx.showToast({
          icon: 'success',
          title: '已复制'
        });
      }
    })
  },

  award: function () {
    var that = this;
    var fee = (Math.random() * 19) + 1;
    zutils.get(app, 'api/pay/create?fee=' + fee, function (res) {
      var data = res.data.data;
      console.log(data);
      data.success = function (res) {
        console.log(data);
        wx.showToast({
          title: '感谢赞赏'
        });
      };
      data.fail = function (res) {
      };
      wx.requestPayment(data);
    });
  },

  onShareAppMessage: function () {
    return app.shareData();
  }
})