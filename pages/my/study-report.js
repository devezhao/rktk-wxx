const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
    tabIndex: 1
  },

  onLoad: function (e) {
    this.__drawCircle(0);

    let that = this;
    app.getUserInfo(function (u) {
      that.loadStats();
      that.loadExams();
    });
  },

  loadStats: function () {
    let that = this;
    zutils.get(app, 'api/exam/report/stats', function (res) {
      let _data = res.data.data;
      if (_data.examCount > 0) {
        that.setData(_data);
        let rate = _data.answerRight / _data.answerCount;
        that.__drawCircleAnimate(rate);
      }
    })
  },

  loadExams: function (e) {
    let t = e ? e.currentTarget.dataset.index : 1;
    this.setData({ tabIndex: t });

    let that = this;
    zutils.get(app, 'api/exam/report/exam-by?type=' + t, function (res) {
      let _data = res.data.data;
      console.log(JSON.stringify(res.data.data));
      for (let i = 0; i < _data.length; i++) {
        _data[i][6] = ~~(_data[i][4] * 100 / _data[i][3]);
      }
      that.setData({
        exams: _data
      });
    });
  },

  __drawCircle: function (p) {
    let ctx = wx.createContext();
    let sAngle = 0.8 * Math.PI,
      eAngle = 0.2 * Math.PI;
    // 内
    ctx.beginPath();
    ctx.arc(50, 50, 48, sAngle, eAngle);
    ctx.setStrokeStyle('#eeeeee');
    ctx.setLineWidth(2);
    ctx.stroke();
    // 外
    ctx.beginPath();
    eAngle = sAngle + (p * 1.4 * Math.PI);
    ctx.arc(50, 50, 48, sAngle, eAngle);
    ctx.setStrokeStyle('#09bb07');
    ctx.setLineWidth(2);
    ctx.stroke();
    wx.drawCanvas({
      canvasId: 'circle-rate',
      actions: ctx.getActions()
    });
    this.setData({ rightRate: ~~(p * 100) });
  },

  __drawCircleAnimate: function (p) {
    if (p <= 0) return;
    let that = this;
    let t = 1000 / (p * 100);
    let s = 0;
    let ttt = setInterval(function () {
      s += 0.01;
      that.__drawCircle(s);
      if (s >= p) clearInterval(ttt);
    }, t);
  },
})