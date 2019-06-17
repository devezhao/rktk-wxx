const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
    numHold: 100,
    fee: '10.0'
  },
  num: 100,

  onLoad: function (e) {
    let that = this;
    app.getUserInfo(function (u) {
      that.setData({
        user: u.uid
      })
    });
  },

  selectNum: function (e) {
    let n = ~~e.currentTarget.dataset.num;
    if (n == 999999 && this.__inputHold) {
      this.num = this.__inputHold;
    } else {
      this.num = n == 999999 ? this.num : n;
    }
    this.setData({
      numHold: n,
      fee: (this.num / 10).toFixed(1)
    });
  },

  inputNum: function (e) {
    let n = ~~(e.detail.value || this.num);
    this.num = n;
    this.setData({
      fee: (this.num / 10).toFixed(1)
    });
    this.__inputHold = n;
  },

  buyNow: function (e) {
    let that = this;
    if (this.num <= 0) this.num = 100;
    if (this.num < 100){
      app.alert('最低100学豆起充');
      return;
    }
    zutils.get(app, 'api/pay/create-buycoin?num=' + this.num + '&formId=' + (e.detail.formId || ''), function (res) {
      let _data = res.data;
      if (_data.error_code > 0) {
        app.alert(_data.error_msg);
        return;
      }

      _data = _data.data;
      _data.success = function (res) {
        app.GLOBAL_DATA.RELOAD_COIN = ['Home'];
        wx.redirectTo({
          url: '../index/tips?msg=学豆充值成功',
        });
      };
      _data.fail = function (res) {
        console.log('学豆充值失败: ' + JSON.stringify(res));
        if ((res.errMsg || '').indexOf(' cancel') > -1) {
          wx.showToast({
            icon: 'none',
            title: '用户取消支付'
          })
        }
      };
      wx.requestPayment(_data);
    });
  }
});