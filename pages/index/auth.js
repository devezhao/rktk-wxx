const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
    authActive: false
  },

  onLoad: function (e) {
    this.nexturl = decodeURIComponent(e.nexturl || '/pages/index/index');
    console.log(this.nexturl);
    wx.setNavigationBarTitle({ title: '软考必备' });

    let that = this;
    wx.login({
      success: function (res) {
        that.__loginCode = res.code;
        that.setData({ authActive: true });
      }
    })
  },

  storeUserInfo: function (e) {
    let res = e.detail;
    if (res.errMsg != 'getUserInfo:ok') {
      this.setData({ authText: '重新授权' })
      return;
    }
    this.setData({ authText: '请稍后', authActive: false })
    console.log('存储授权 - ' + JSON.stringify(res));

    let _data = { code: this.__loginCode, iv: res.iv, data: res.encryptedData, enterSource: app.enterSource };
    let that = this;
    zutils.post(app, 'api/user/wxx-login?noloading', _data, function (res) {
      app.GLOBAL_DATA.USER_INFO = res.data.data;
      wx.setStorage({ key: 'USER_INFO', data: app.GLOBAL_DATA.USER_INFO });
      app.gotoPage(that.nexturl, true);
    });
  }
})