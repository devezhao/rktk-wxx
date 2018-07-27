const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
    isIOS: true,
    btnDisabled: true
  },

  onLoad: function(e) {
    if (!e.id) {
      app.goHome();
      return;
    }
    this.__id = e.id;

    let that = this;
    app.getUserInfo(function(u) {
      that.__loadPayinfo();
    });

    let qrcodeUrl = 'http://wbs.dev.wisecrm.com/qrcode/gen?w=400&t=' + encodeURIComponent('https://rktk.statuspage.cn/t/wxx/' + this.__id);
    this.setData({
      isIOS: app.GLOBAL_DATA.IS_IOS,
      qrcodeUrl: qrcodeUrl
    });
  },

  // 购买信息
  __loadPayinfo: function() {
    let that = this;
    zutils.get(app, 'api/pay/wxxpay-info?id=' + this.__id, function(res) {
      let _data = res.data;
      if (_data.error_code > 0) {
        app.alert(_data.error_msg, function() {
          app.gotoPage('/pages/index/index', true);
        });
        return;
      }

      _data = _data.data;
      that.setData({
        fee: _data[2].toFixed(2),
        subject: _data[1].substr(2),
        userNick: _data[4],
        btnDisabled: false
      });
      that.__someone = _data[5];
    });
  },

  payNow: function() {
    if (app.GLOBAL_DATA.IS_IOS === true) return;
    app.reportKpi('VIP.CLICKPAY');
    this.setData({
      btnDisabled: true
    })

    let that = this;
    zutils.post(app, 'api/pay/wxxpay-create?id=' + this.__id, function(res) {
      that.setData({
        btnDisabled: false
      })
      let _data = res.data;
      if (_data.error_code > 0) {
        app.alert(_data.error_msg);
        return;
      }

      _data = _data.data;
      _data.success = function(res) {
        app.GLOBAL_DATA.RELOAD_VIP = ['Home'];
        wx.redirectTo({
          url: '/pages/index/tips?msg=' + that.data.subject + '开通成功',
        });
      };
      _data.fail = function(res) {
        console.log('开通失败: ' + JSON.stringify(res));
      };
      wx.requestPayment(_data);
    });
  },

  showPayQrcode: function() {
    if (this.data.btnDisabled === true) return;
    this.setData({ showPayQrcode: true })
  },
  hidePayQrcode: function () {
    this.setData({ showPayQrcode: false })
  },

  onShareAppMessage: function() {
    let d = app.warpShareData('/pages/my/vip-buy-ios?id=' + this.__id);
    d.title = '来自' + this.data.userNick + '的代付请求';
    return d;
  }
})