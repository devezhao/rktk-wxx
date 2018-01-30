const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
  },

  onLoad: function (e) {
    var that = this;
    zutils.get(app, 'api/share/gen-texts', function (res) {
      that.setData(res.data.data)
    });
  },

  ccopy: function (e) {
    var t = e.currentTarget.dataset.type;
    var ccdata = this.data.text;
    if (t == 2) ccdata = this.data.link;
    wx.setClipboardData({
      data: ccdata,
      success: function () {
        wx.showToast({
          title: (t == 2 ? '链接' : '文字') + '已复制'
        })
      }
    })
  },

  inviteList: function () {
    wx.navigateTo({
      url: '../my/coin-records?type=invite'
    })
  },

  onShareAppMessage: function () {
    var d = app.warpShareData();
    d.imageUrl = 'https://c.rktk.qidapp.com/a/wxx/share-img.png?v2';
    return d;
  }
})