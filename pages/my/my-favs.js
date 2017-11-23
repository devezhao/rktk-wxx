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
  }
});