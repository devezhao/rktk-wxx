const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
    tipsbarHide: true
  },

  onLoad: function () {
    if (app.GLOBAL_DATA.USER_INFO.uid) {
      this.setData({
        user: app.GLOBAL_DATA.USER_INFO.uid
      })
    }
  },

  onShareAppMessage: function () {
    return app.warpShareData();
  },

  debugTapTimes: 0,
  onShow: function () {
    this.debugTapTimes = 0;
  },
  enableDebug: function () {
    this.debugTapTimes++;
    if (this.debugTapTimes == 3) {
      wx.setEnableDebug({
        enableDebug: true
      });
      wx.showToast({
        icon: 'none',
        title: 'DEBUG 模式已开启'
      })
    }
  },

  github: function () {
    app.alert('Fork on GitHub. https://github.com/devezhao/rktk-wxx/');
  },

  reqMessage: function (e) {
    if (wx.requestSubscribeMessage) {
      wx.requestSubscribeMessage({
        tmplIds: ['PKPJKrLCGr_dyAhNZlZRirkQw3kprcdOixTfdl8HasI'],
        complete(res) {
          console.log(JSON.stringify(res))
          let url = e.currentTarget.dataset.url
          if (url) app.gotoPage(url)
        }
      })
    } else {
      let url = e.currentTarget.dataset.url
      if (url) app.gotoPage(url)
    }
  }
})