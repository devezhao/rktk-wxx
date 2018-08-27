const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
    tt: 'vip',
    vipLevel: null,
  },
  inputData: {},

  onLoad: function (e) {
    if (!app.GLOBAL_DATA.USER_INFO) return;
    app.reportKpi('VIP2.VIEW');

    if (app.GLOBAL_DATA.IS_IOS === true) {
      app.alert('由于相关政策，你暂时无法在这里开通会员。', function(){
        app.gotoPage('/pages/index/index');
      });
    }
  },

  onShow: function (e) {
    let that = this;
    app.getUserInfo(function () {
      that.__loadBuy(app.GLOBAL_DATA.__BuySubject);
    });
  },

  __loadBuy: function (s) {
    let that = this;
    zutils.get(app, 'api/user/buy-vip-pre?subject=' + (s || ''), function (res) {
      let _data = res.data.data;
      that.__buydata = _data;
      that.setData({
        subjectName: _data.subject_name,
        feeVip: _data.vip_fee < 199 ? ('¥' + _data.vip_fee) : '',
        feeSVip: _data.svip_fee < 299 ? ('¥' + _data.svip_fee) : '',
        vipExpires: _data.vip_expires || ''
      });
      that.__calcFee();
    });
  },

  __calcFee: function () {
    if (!this.__buydata) return;

    let coin_fee = this.__buydata.coin_balance / 10;
    let fee = this.__buydata[this.data.tt + '_fee'] - coin_fee;
    let feeOld = 0;
    fee = fee.toFixed(1).split('.');
    this.setData({
      coinFee: coin_fee.toFixed(1),
      fee: fee[0],
      feeFix: fee[1],
      feeOld: feeOld
    });
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
    if (!this.__buydata) return;
    if (!this.__buydata.subject) {
      app.alert('请选择考试类型');
      return;
    }
    if (!this.inputData.friendUid) {
      app.alert('请输入好友UID或手机');
      return;
    }
    app.reportKpi('VIP2.CLICKBUY');

    let that = this;
    let _url = 'api/pay/create-buyvip?subject=' + this.__buydata.subject + '&tt=' + this.data.tt + '&friendUid=' + that.inputData.friendUid;
    zutils.post(app, _url, function (res) {
      let _data = res.data;
      if (_data.error_code > 0) {
        app.alert(_data.error_msg);
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

      wx.showModal({
        title: '提示',
        content: '将为好友 ' + that.inputData.friendUid + ' 开通' + that.data.subjectName + that.data.tt.toUpperCase() + '会员。是否确认？',
        success: function(res){
          if (res.confirm) {
            wx.requestPayment(_data);
          }
        }
      })
    });
  },

  inputTake: function (e) {
    this.inputData[e.currentTarget.dataset.id] = e.detail.value;
    let mobile = this.inputData.mobile;
    let vcode = this.inputData.vcode;
    this.setData({
      inputBad: !(mobile && mobile.length == 11 && vcode && vcode.length == 6)
    });
  },
})