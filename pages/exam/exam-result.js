const app = app || getApp();
const zutils = require('../../utils/zutils.js');

import {
  zsharebox
} from '../comps/z-sharebox.js';
Page({
  data: {
    shareboxData: zsharebox.data,
    pkimgUrl: null
  },
  examId: null,
  subjectId: null,

  onLoad: function (e) {
    this.examId = e.id;
    let that = this;
    app.getUserInfo(function () {
      that.loadResult(e.s == 'exam');
    });
    this.setData({
      showPk: e.s == 'exam'
    });
  },

  loadResult: function (checkKeep) {
    var that = this;
    zutils.get(app, 'api/exam/result?exam=' + that.examId, function (res) {
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
      that.__drawCircle(scope_percent);
      wx.setNavigationBarTitle({
        title: _data.subject_name
      });
      that.subjectId = _data.subject_id;

      // Keep
      if (checkKeep == true) {
        zutils.get(app, 'api/acts/keep-days-v2?noloading', function (res) {
          let dd = res.data;
          if (dd && dd.data && dd.data.days && dd.data.days > 1) {
            dd = dd.data;
            setTimeout(function () {
              wx.navigateTo({
                url: '/pages/acts/keep-days?days=' + dd.days + '&date=' + dd.date
              })
            }, 1000);
          }
        });
      }
    });
  },

  __drawCircle: function (p) {
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

  gotoPk: function (e) {
    app.gotoPage('/pages/pk/start');
  },

  gotoSubject: function () {
    app.gotoPage('/pages/question/subject?id=' + this.subjectId);
  },

  shareScope: function (e) {
    // zutils.post(app, 'api/user/report-formid?formId=' + (e.detail.formId || ''));
  },

  onShareAppMessage: function () {
    let d = app.warpShareData();
    return d;
  },
});