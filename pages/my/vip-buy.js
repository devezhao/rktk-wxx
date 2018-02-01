const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
    tt: 'vip',
    vipLevel: null
  },

  onLoad: function (e) {
    if (app.GLOBAL_DATA.USER_INFO) {
      let that = this;
      zutils.get(app, 'api/user/vip-info', function (res) {
        let _data = res.data.data;
        if (_data.level != 'N') {
          let info = '已开通' + _data.subject + _data.level + '会员 ۰ ' + _data.expires;
          if (_data.is_expired == true) info = _data.subject + _data.level + '会员 ۰ 已过期';
          that.setData({
            vipLevel: info,
            expired: _data.is_expired
          })
        }
      });
    }
    app.reportKpi('VIP', 'VIEW');
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
        subjectName: _data.subject_name,
        feeVip: _data.vip_fee < 199 ? ('¥' + _data.vip_fee) : '',
        feeSVip: _data.svip_fee < 299 ? ('¥' + _data.svip_fee) : ''
      });
      that.__calcFee();
    });
  },

  __calcFee: function () {
    let coin_fee = this.__buydata.coin_balance / 10;
    let fee = this.__buydata[this.data.tt + '_fee'] - coin_fee;
    if (fee < 0.01) {
      fee = 0.01;
      coin_fee = this.__buydata[this.data.tt + '_fee'] - 0.01;
    }
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
    app.reportKpi('VIP', 'CLICKBUY');

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
        app.GLOBAL_DATA.RELOAD_VIP = ['Home'];
        wx.redirectTo({
          url: '../index/tips?msg=' + that.data.tt.toUpperCase() + '会员开通成功',
        });
      };
      _data.fail = function (res) {
        console.log('会员开通失败: ' + JSON.stringify(res));
      };
      wx.requestPayment(_data);
    });
  }
})