const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
    headimgUrl: '../../images/afo.png',
    nick: '游客',
    level: '普通会员',
    subject: '选择考试类型'
  },

  onLoad: function (e) {
    var that = this;
    app.getUserInfo(function (res) {
      that.setData({
        headimgUrl: res.headimgUrl,
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
    let that = this;
    zutils.get(app, 'api/user/infos', function (res) {
      let _data = res.data.data;
      that.setData({
        level: _data.user_level,
        subject: _data.subject,
        coin: _data.coin_balance,
        vip: _data.user_level.indexOf('VIP') > -1 ? 'vip' : ''
      })
    });
  },

  goVip: function() {
    // app.gotoPage('/pages/my/vip-buy');
  }
});