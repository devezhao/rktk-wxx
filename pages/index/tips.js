const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
  },

  onLoad: function (e) {
    this.setData({
      msg: e.msg || '无效的请求参数'
    });
  },

  goHome: function(){
    wx.switchTab({
      url: 'index'
    });
  }
})