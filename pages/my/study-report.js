const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
  },

  onLoad: function (e) {
    let that = this;

    let x = 0.1;
    that.__drawCircle(x);
    // let ttt = setInterval(function(){
    //   that.__drawCircle(x);
    //   x += 0.1;
    //   if (x > 0.5) clearInterval(ttt)
    // }, 1000);

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
    if (p <= 0.1) eAngle = sAngle + (0.7 * Math.PI / 5 * 1);
    if (p <= 0.2) eAngle = sAngle + (0.7 * Math.PI / 5 * 2);
    if (p <= 0.3) eAngle = sAngle + (0.7 * Math.PI / 5 * 3);
    if (p <= 0.4) eAngle = sAngle + (0.7 * Math.PI / 5 * 4);
    if (p <= 0.5) eAngle = sAngle + (0.7 * Math.PI / 5 * 5);
    console.log(eAngle)
    ctx.arc(50, 50, 48, sAngle, eAngle);
    ctx.setStrokeStyle('#4cae4c');
    ctx.setLineWidth(2);
    ctx.stroke();
    wx.drawCanvas({
      canvasId: 'circle-rate',
      actions: ctx.getActions()
    });

    
  },

})