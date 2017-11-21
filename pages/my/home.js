const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
    headimgUrl: '../../images/nohead2.png',
    nick: '游客',
    level: 'Lv.1',
    subject: '选择考试类型'
  },

  onLoad: function (e) {
    var that = this;
    app.getUserInfo(function (res) {
      that.setData({
        headimgUrl: res.headimgUrl.replace('/0', '/64'),
        nick: res.nick,
        user: res.uid
      });
      that.reloadUserInfos();
    })
  },

  onShow: function (e) {
    if (zutils.array.in(app.GLOBAL_DATA.RELOAD_SUBJECT, 'Home') || zutils.array.in(app.GLOBAL_DATA.RELOAD_COIN, 'Home')) {
      zutils.array.erase(app.GLOBAL_DATA.RELOAD_SUBJECT, 'Home');
      zutils.array.erase(app.GLOBAL_DATA.RELOAD_COIN, 'Home');
      this.reloadUserInfos();
    }
  },

  reloadUserInfos: function (e) {
    var that = this;
    zutils.get(app, 'api/user/infos', function (res) {
      that.setData({
        level: res.data.data.user_level,
        subject: res.data.data.subject,
        coin: res.data.data.coin_balance
      })
    });
  },

  onShareAppMessage: function () {
    return app.shareData();
  }
});