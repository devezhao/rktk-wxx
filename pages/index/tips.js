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
    if (msg.indexOf('提交资料') > -1) icon = 'waiting';
    this.setData({
      msg: msg,
      icon: icon
    });

    if (msg.indexOf('提交资料') > -1) {
      this.setData({
        btnText: '点击提交',
        hideBtn: false
      });
    }
  }
})