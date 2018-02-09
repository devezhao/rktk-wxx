const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
    inputBad: true,
  },
  inputData: {},

  onLoad: function (options) {
    this.setData({
      bind: options.bind || null
    })
  },

  inputTake: function (e) {
    this.inputData[e.currentTarget.dataset.id] = e.detail.value;
    let mobile = this.inputData.mobile;
    let vcode = this.inputData.vcode;
    this.setData({
      inputBad: !(mobile && mobile.length == 11 && vcode && vcode.length == 6)
    });
  },

  sendVcode: function () {
    if (this.data.waitVcode) return;
    let mobile = this.inputData.mobile;
    if (!mobile || mobile.length != 11) {
      wx.showToast({
        icon: 'none',
        title: '请输入正确的手机号'
      });
      return;
    }

    let that = this;
    zutils.post(app, 'api/user/send-vcode?mobile=' + mobile, function (res) {
      if (res.data.error_code == 0) {
        let countdown = 60;
        that.setData({
          waitVcode: countdown + '秒后重发'
        });
        let countdownTimer = setInterval(function () {
          countdown--;
          if (countdown == 0) {
            that.setData({
              waitVcode: null
            });
            clearInterval(countdownTimer);
          } else {
            that.setData({
              waitVcode: countdown + '秒后重发'
            });
          }
        }, 1000);

        wx.showToast({
          icon: 'none',
          title: '验证码已发送'
        });
      } else {
        wx.showToast({
          icon: 'none',
          title: res.data.error_msg
        });
      }
    });
  },

  bindMobile: function (e) {
    if (this.data.inputBad == true) return;
    zutils.post(app, 'api/user/bind-mobile?formId=' + (e.detail.formId || ''), JSON.stringify(this.inputData), function (res) {
      if (res.data.error_code == 0) {
        app.GLOBAL_DATA.RELOAD_COIN = ['Home'];
        wx.redirectTo({
          url: '../index/tips?msg=手机账号绑定成功'
        });
      } else {
        wx.showModal({
          title: '提示',
          content: res.data.error_msg,
          showCancel: false
        })
      }
    });
  }
})