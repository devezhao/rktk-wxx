const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
    btnText: '返回首页',
    hideBtn: true
  },
  fromCoinBuy: false,

  onLoad: function (e) {
    var msg = e.msg || '无效的请求参数';
    var icon = 'warn';
    if (msg.indexOf('成功') > -1) icon = 'success';
    this.setData({
      msg: msg,
      icon: icon
    });

    this.fromCoinBuy = msg.indexOf('充值成功') > -1;
    if (this.fromCoinBuy) {
      this.setData({
        btnText: '查看充值记录',
        hideBtn: !false
      });
    }
  },

  goHome: function () {
    if (this.fromCoinBuy) {
      wx.redirectTo({
        url: '../my/coin-records'
      })
    } else {
      wx.switchTab({
        url: 'index'
      });
    }
  }
})