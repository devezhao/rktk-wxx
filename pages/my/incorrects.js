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
    zutils.get(app, 'api/fav/incorrect-list?page=' + this.pageNo, function (res) {
      var data = res.data.data;
      that.setData({
        in_list: data,
        nodata: that.pageNo == 1 && data.length == 0
      });
    });
  },
  
  moreAction: function (e) {
    var _id = e.currentTarget.dataset.qid;
    var that = this;
    wx.showActionSheet({
      itemList: ['忽略此题', '加入收藏'],
      success: function (res) {
        if (res.tapIndex == 1) {
          zutils.post(app, 'api/fav/toggle?force=1&question=' + _id, function (res) {
            wx.showToast({
              title: '已加入收藏'
            });
          });
        } else if (res.tapIndex == 0) {
          zutils.post(app, 'api/fav/incorrect-ignore?question=' + _id, function (res) {
            that.list();
          });
        }
      }
    });
  }
});