const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
    buyNowProgress: false,
  },
  inputData: {},

  onLoad: function (e) {
    if (e.msg) {
      this.setData({
        urlMsg: e.msg
      })
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
      that.inputData.subject = _data.subject;
      that.setData({
        subjectName: _data.subject_name
      });
    });
  },

  selectSubject: function (e) {
    wx.navigateTo({
      url: '../question/subject-choice?back=vipsn',
    })
  },

  buyNow: function () {
    if (!this.inputData.subject) {
      app.alert('请选择考试类型');
      return;
    }
    if (!this.inputData.sncode) {
      app.alert('请输入激活码');
      return;
    }

    // let that = this;
    // wx.showModal({
    //   title: '提示',
    //   content: '确认立即激活吗？',
    //   confirmText: '确认',
    //   success: function (res) {
    //     if (res.confirm) {
    //       that.__buyNow();
    //     }
    //   }
    // });
    this.__buyNow();
  },

  __buyNow: function () {
    let that = this;
    that.setData({
      buyNowProgress: true
    });
    zutils.post(app, 'api/user/vip-snactive?subject=' + this.inputData.subject + '&sncode=' + this.inputData.sncode, function (res) {
      that.setData({
        buyNowProgress: false
      });
      let _data = res.data;
      if (_data.error_code == 0) {
        app.GLOBAL_DATA.RELOAD_VIP = ['Home'];
        wx.redirectTo({
          url: '../index/tips?msg=' + _data.data.level + '会员激活成功'
        });
      } else {
        app.alert(_data.error_msg);
      }
    });
  },

  inputTake: function (e) {
    let id = e.currentTarget.dataset.id;
    let val = e.detail.value;
    this.inputData[id] = val;
  }
})