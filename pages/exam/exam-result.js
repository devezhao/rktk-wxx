const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
    hideFoobar: true
  },
  examId: null,

  onLoad: function (e) {
    this.examId = e.id;
    var that = this;
    app.getUserInfo(function () {
      that.loadResult();
    });

    if (e.redirect == 1) {
      this.setData({
        hideFoobar: false
      })
    }
  },

  loadResult: function () {
    var that = this;
    zutils.get(app, 'api/exam/result?exam=' + that.examId, function (res) {
      console.log(res);
      var data = res.data.data;
      var scope_percent = data.scope / data.full_scope;
      that.setData({
        scope: data.scope,
        scope_color: scope_percent < 0.6 ? '' : 'pass',
        scope_tips: scope_percent < 0.6 ? '本次答题未通过' : '本次答题通过',
        scope_percent: (scope_percent * 100).toFixed(1) + '%',
        duration: data.duration,
        full_scope: data.full_scope,
        exam_items: data.exam_items
      });
      that.__draw_circle(scope_percent);
      wx.setNavigationBarTitle({
        title: data.subject_name
      })
    });
  },

  __draw_circle: function (p) {
    var ctx = wx.createCanvasContext('circle-scope');
    ctx.beginPath();
    ctx.arc(50, 50, 47, 0, 2 * Math.PI);
    ctx.setStrokeStyle('#eeeeee');
    ctx.setLineWidth(4);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(50, 50, 47, 0, p * 2 * Math.PI);
    ctx.setStrokeStyle(p >= 0.6 ? '#4cae4c' : '#d9534f');
    ctx.setLineWidth(4);
    ctx.stroke();
    ctx.draw();
  },

  goHome: function () {
    app.goHome();
  },

  onShareAppMessage: function () {
    return app.warpShareData();
  }
});