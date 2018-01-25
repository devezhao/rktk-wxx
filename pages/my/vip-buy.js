const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
    coinFee: 9.55,
    payFee: 189.45
  },

  onLoad: function (options) {

  },

  selectVip: function (e) {
    let tt = e.currentTarget.dataset.tt;
    this.setData({
      tt: tt
    })
  },

  onShareAppMessage: function () {
  }
})