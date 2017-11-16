const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  onLoad: function () {
    var that = this;
    app.getUserInfo(function () {
      that.onPullDownRefresh();
    });

    zutils.get(app, 'api/home/banners', function (res) {
      that.setData({
        banners: res.data.data
      })
    });
  },

  onPullDownRefresh: function () {
    var that = this;
    zutils.get(app, 'api/home/recent-exams', function (res) {
      that.setData(res.data.data);
    });
  }
})