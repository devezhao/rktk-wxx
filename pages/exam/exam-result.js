const app = app || getApp();
const zutils = require('../../utils/zutils.js');

import { zsharebox } from '../comps/z-sharebox.js';
Page({
  data: {
    hideFoobar: true,
    shareboxData: zsharebox.data
  },
  examId: null,
  subjectId: null,

  onLoad: function (e) {
    this.examId = e.id;
    var that = this;
    app.getUserInfo(function () {
      that.loadResult();
    });

    // PK
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
      let _data = res.data.data;
      var scope_percent = _data.scope / _data.full_scope;
      that.setData({
        scope: _data.scope,
        scope_color: scope_percent < 0.6 ? '' : 'pass',
        scope_tips: scope_percent < 0.6 ? '本次答题未通过' : '本次答题通过',
        scope_percent: (scope_percent * 100).toFixed(1) + '%',
        duration: _data.duration,
        full_scope: _data.full_scope,
        exam_items: _data.exam_items
      });
      that.__draw_circle(scope_percent);
      wx.setNavigationBarTitle({
        title: _data.subject_name
      });
      that.subjectId = _data.subject_id;
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
  },

  shareboxOpen: function () {
    zsharebox.shareboxOpen(this);
  },
  shareboxClose: function () {
    zsharebox.shareboxClose(this);
  },
  dialogOpen: function () {
    zsharebox.dialogOpen(this);
  },
  dialogClose: function () {
    zsharebox.dialogClose(this);
  },
  share2Frined: function () {
    zsharebox.share2Frined(this);
  },
  share2QQ: function () {
    zsharebox.share2QQ(this);
  },
  share2CopyLink: function () {
    zsharebox.share2CopyLink(this);
  }
});