const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
  },

  onLoad: function (e) {
    var msg = e.msg || '无效的请求参数';
    var icon = 'warn';
    if (msg.indexOf('成功') > -1) icon = 'success';
    this.setData({
      msg: msg,
      icon: icon
    });
  },

  goHome: function () {
    wx.switchTab({
      url: 'index'
    });
  }
})