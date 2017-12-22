const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({

  data: {
    num: 100
  },
  realNum: 0,

  onLoad: function (e) {
    var that = this;
    app.getUserInfo(function (res) {
    });
  },

  selectNum: function (e) {
    var n = e.currentTarget.dataset.num;
    this.setData({
      num: n
    });
    this.realNum = ~~n;
  },

  inputNum: function(e){
    var n = e.detail.value;
    this.realNum = ~~n;
  },

  buyNow: function (e) {
    var that = this;
    zutils.get(app, 'api/pay/create-buycoin?num=' + (this.realNum || 100) + '&formId=' + (e.detail.formId || ''), function (res) {
      var data = res.data.data;
      console.log(data);
      data.success = function (res) {
        wx.navigateTo({
          url: '../index/tips?msg=充值成功',
        });
      };
      data.fail = function (res) {
      };
      wx.requestPayment(data);
    });
  }
});