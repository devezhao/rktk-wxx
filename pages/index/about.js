const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
    tipsbarHide: true
  },

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
    return app.warpShareData();
  },

  debugTapTimes: 0,
  onShow: function () {
    this.debugTapTimes = 0;
  },
  enableDebug: function () {
    this.debugTapTimes++;
    if (this.debugTapTimes == 3) {
      wx.setEnableDebug({
        enableDebug: true
      });
      zutils.tipsbar(this, 'DEBUG 模式已开启');
    }
  }
})