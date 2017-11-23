const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  onLoad: function (e) {
    console.log('GO 进入 - ' + e);
    if (e.u) {
      app.GLOBAL_DATA.__inviter = e.u;
    }
    wx.switchTab({
      url: 'index'
    });
  }
});