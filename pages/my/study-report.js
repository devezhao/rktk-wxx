const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
  },

  onLoad: function (e) {
    let that = this;
    that.__drawCircle(0.1);

    // let x = 0;
    // let x_timer = setInterval(function () {
    //   x += 0.01;
    //   that.__drawCircle(x);
    //   if (x >= 0.5) clearInterval(x_timer)
    // }, 50);
  },

  __drawCircle: function (p) {
    let ctx = wx.createContext();
    // 内
    ctx.beginPath(0);
    ctx.arc(50, 50, 48, 0.8 * Math.PI, 2.2 * Math.PI);
    ctx.setStrokeStyle('#eeeeee');
    ctx.setLineWidth(2);
    ctx.stroke();
    // 外
    ctx.beginPath(0);
    ctx.arc(50, 50, 48, 0.8 * Math.PI, p * (2.2 * Math.PI));
    ctx.setStrokeStyle('#4cae4c');
    ctx.setLineWidth(2);
    ctx.stroke();
    wx.drawCanvas({
      canvasId: 'circle-rate',
      actions: ctx.getActions()
    })
  },

})