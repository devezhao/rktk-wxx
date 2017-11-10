const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
    headimgUrl: '../../images/nohead2.png',
    nick: '游客',
    level: 'Lv.1',
    subject: '点击设置'
  },

  onReady: function (e) {
    var that = this;
    app.getUserInfo(function (res) {
      that.setData({
        headimgUrl: res.headimgUrl,
        nick: res.nick
      });
      that.reloadUserInfos();
    })
  },

  onShow: function (e) {
    if (zutils.array.in(app.GLOBAL_DATA.RELOAD_SUBJECT, 'Home')) {
      zutils.array.erase(app.GLOBAL_DATA.RELOAD_SUBJECT, 'Home');
      this.reloadUserInfos();
    }
  },

  reloadUserInfos: function (e) {
    console.log(e);
    var that = this;
    zutils.get(app, 'api/user/infos', function (res) {
      console.log(res)
      that.setData({
        level: res.data.data.user_level,
        subject: res.data.data.subject
      })
    });
  },

  onShareAppMessage: function () {
    return app.shareData();
  }
});