const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
  },
  pageNo: 1,

  onLoad: function (e) {
    var that = this;
    app.getUserInfo(function () {
      that.list();
    })
  },

  list: function () {
    var that = this;
    zutils.get(app, 'api/fav/list?page=' + this.pageNo, function (res) {
      that.setData({
        favs: res.data.data,
        nodata: that.pageNo == 1 && res.data.data.length == 0
      });
    });
  },

  moreAction: function (e) {
    var _id = e.currentTarget.dataset.id;
    var that = this;
    wx.showActionSheet({
      itemList: ['取消收藏'],
      success: function (res) {
        if (res.tapIndex == 0) {
          zutils.post(app, 'api/fav/toggle?question=' + _id, function (res) {
            wx.showToast({
              title: '已取消收藏'
            });
            that.list();
          });
        }
      }
    });
  }
});