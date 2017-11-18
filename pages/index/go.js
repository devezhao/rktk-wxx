const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  onLoad: function (e) {
    console.log(e);
    wx.switchTab({
      url: 'index'
    })
  }
});