const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
    tt: 'vip'
  },

  onLoad: function (e) {
  },

  onShow: function (e) {
    var that = this;
    app.getUserInfo(function () {
      that.__loadBuy(app.GLOBAL_DATA.__BuySubject);
    });
  },

  __loadBuy: function (s) {
    var that = this;
    zutils.get(app, 'api/user/buy-vip-pre?subject=' + (s || ''), function (res) {
      var _data = res.data.data;
      that.__buydata = _data;
      that.setData({
        subjectName: _data.subject_name
      });
      that.__calcFee();
    });
  },

  __calcFee: function () {
    let coin_fee = this.__buydata.coin_balance / 10;
    let fee = this.__buydata[this.data.tt + '_fee'] - coin_fee;
    fee = fee.toFixed(2).split('.');
    this.setData({
      coinFee: coin_fee.toFixed(2),
      fee: fee[0],
      feeFix: fee[1]
    })
  },

  selectType: function (e) {
    let tt = e.currentTarget.dataset.tt;
    this.setData({
      tt: tt
    });
    this.__calcFee();
  },

  selectSubject: function (e) {
    wx.navigateTo({
      url: '../question/subject-choice?back=vip',
    })
  },

  buyNow: function () {
    if (!this.__buydata || !this.__buydata.subject) return;

    let that = this;
    let _url = 'api/pay/create-buyvip?subject=' + this.__buydata.subject + '&tt=' + this.data.tt;
    zutils.post(app, _url, function (res) {
      var _data = res.data;
      if (_data.error_code > 0) {
        wx.showModal({
          title: '提示',
          content: _data.error_msg || '系统错误',
          showCancel: false
        })
        return;
      }

      _data = _data.data;
      _data.success = function (res) {
        wx.navigateTo({
          url: '../index/tips?msg=' + that.tt + '会员开通成功',
        });
      };
      _data.fail = function (res) {
        console.log('会员开通失败: ' + JSON.stringify(res));
      };
      wx.requestPayment(_data);
    });
  }
})