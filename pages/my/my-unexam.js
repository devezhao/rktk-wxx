const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
  },
  pageNo: 1,
  _redirect: 1,

  onLoad: function (e) {
    var that = this;
    app.getUserInfo(function () {
      that.list();
    });
    this._redirect = e.redirect || 1;
  },

  list: function () {
    var that = this;
    zutils.get(app, 'api/exam/unexam-list?page=' + this.pageNo, function (res) {
      that.setData({
        exams: res.data.data,
        nodata: that.pageNo == 1 && res.data.data.length == 0
      });
    });
  },

  goExam: function (e) {
    var ds = e.currentTarget.dataset;
    var url = '../exam/exam?exam=' + ds.exam + '&subject=' + ds.subject + '&duration=' + ds.duration;
    if (this._redirect == 2) {
      wx.navigateTo({ url: url });
    } else {
      wx.redirectTo({ url: url });
    }
  },

  goSubjectList: function () {
    app.gotoPage('/pages/question/subject-list');
  }
});