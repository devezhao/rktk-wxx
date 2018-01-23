const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
    listData: []
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
      var _data = res.data.data || [];
      var _listData = that.data.listData;
      if (that.pageNo == 1) _listData = [];
      if (_data.length > 0) _listData = _listData.concat(_data);
      else that.pageNo = -1;

      that.setData({
        listData: _listData,
        nodata: _listData.length == 0
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
            that.pageNo = 1;
            that.list();
          });
        }
      }
    });
  },

  onReachBottom: function (e) {
    if (this.pageNo == -1) return;
    this.pageNo++;
    this.list();
  }
});