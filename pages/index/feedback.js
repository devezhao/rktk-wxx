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

  onShareAppMessage: function () {
    return { title: '软考刷题必备利器', path: '/pages/index/go?source=feedback' };
  }
})