const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
  },
  pageNo: 1,

  onLoad: function (e) {
    this.list();
  },

  list: function () {
    var that = this;
    zutils.get(app, 'api/exam/unexam-list?page=' + this.pageNo, function (res) {
      that.setData({
        exams: res.data.data
      });
    });
  },

  onShareAppMessage: function (e) {
    return app.shareData(e);
  }
});