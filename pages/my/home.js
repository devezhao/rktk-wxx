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
      that.__onLoad();
    })
  },

  onPullDownRefresh: function () {
    this.__onLoad(function () {
      wx.stopPullDownRefresh();
    });
  },

  onShow: function (e) {
    if (zutils.array.in(app.GLOBAL_DATA.RELOAD_SUBJECT, 'Home') || zutils.array.in(app.GLOBAL_DATA.RELOAD_COIN, 'Home')) {
      zutils.array.erase(app.GLOBAL_DATA.RELOAD_SUBJECT, 'Home');
      zutils.array.erase(app.GLOBAL_DATA.RELOAD_COIN, 'Home');
      this.__onLoad();
    }
  },

  __onLoad: function (cb) {
    let that = this;
    zutils.get(app, 'api/user/infos', function (res) {
      typeof cb == 'function' && cb();
      let _data = res.data.data;
      console.log(_data)
      that.setData({
        level: _data.user_level,
        subject: _data.subject,
        coin: _data.coin_balance,
        vip: _data.user_level.indexOf('VIP') > -1 ? 'vip' : ''
      });
      if (that.data.vip == 'vip') {
        wx.setNavigationBarColor({
          frontColor: '#ffffff',
          backgroundColor: '#a18d62'
        });

        zutils.get(app, 'api/user/vip-info', function (res) {
          let _data = res.data.data;
          that.setData({
            vipLevelFull: '已开通' + _data.subject + _data.level + '会员'
          })
        });
      }
    });
    zutils.get(app, 'api/user/study-infos', function (res) {
      that.setData(res.data.data);
    });
  },

  goVip: function () {
    app.gotoPage('/pages/my/vip-buy');
  }
});