const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
  },
  pageNo: 1,

  onLoad: function (e) {
    let that = this;
    app.getUserInfo(function () {
      that.list();
    });
  },

  onShow: function(e) {
    console.log(JSON.stringify(e))
  },

  list: function () {
    let that = this;
    zutils.get(app, 'api/exam/unexam-list?page=' + this.pageNo, function (res) {
      that.setData({
        exams: res.data.data,
        nodata: that.pageNo == 1 && res.data.data.length == 0
      });
    });
  },

  goExam: function (e) {
    let ds = e.currentTarget.dataset;
    let url = '../exam/exam?exam=' + ds.exam + '&subject=' + ds.subject + '&duration=' + ds.duration;
    wx.redirectTo({ url: url })
  },

  goSubjectList: function () {
    app.gotoPage('/pages/question/subject-list');
  }
});