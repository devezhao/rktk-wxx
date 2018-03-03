const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
    headimgUrl: '../../images/afo.png',
    nick: '游客',
    level: '普通会员',
    subject: '选择考试类型'
  },
  showTimes: 0,

  onLoad: function (e) {
    let that = this;
    app.getUserInfo(function (u) {
      that.setData({
        headimgUrl: u.headimgUrl,
        nick: u.nick,
        user: u.uid
      });
      that.__onLoad();
    });

    if (!!app.GLOBAL_DATA.RED_DOT[3]) {
      let k = app.GLOBAL_DATA.RED_DOT[3];
      setTimeout(function () {
        app.hideReddot(3, k);
      }, 500);
    }
  },

  onPullDownRefresh: function () {
    this.__onLoad(function () {
      wx.stopPullDownRefresh();
    });
  },

  onShow: function (e) {
    this.showTimes++;
    if (zutils.array.in(app.GLOBAL_DATA.RELOAD_SUBJECT, 'Home')
      || zutils.array.in(app.GLOBAL_DATA.RELOAD_COIN, 'Home')
      || zutils.array.in(app.GLOBAL_DATA.RELOAD_VIP, 'Home')) {
      zutils.array.erase(app.GLOBAL_DATA.RELOAD_SUBJECT, 'Home');
      zutils.array.erase(app.GLOBAL_DATA.RELOAD_COIN, 'Home');
      zutils.array.erase(app.GLOBAL_DATA.RELOAD_VIP, 'Home');
      this.__onLoad();
    }
    if (app.GLOBAL_DATA.USER_INFO && this.showTimes > 1) {
      let that = this;
      zutils.get(app, 'api/user/study-infos?noloading', function (res) {
        that.setData(res.data.data);
      });
    }
  },

  __onLoad: function (cb) {
    let that = this;
    zutils.get(app, 'api/user/infos', function (res) {
      typeof cb == 'function' && cb();
      let _data = res.data.data;
      that.setData({
        level: _data.user_level,
        subject: _data.subject,
        coin: _data.coin_balance,
        vip: _data.user_level.indexOf('VIP') > -1 ? 'vip' : '',
        vip_discount: _data.vip_discount || '',
        bindMobile: _data.bindMobile || '',
        bindMobileShow: !!!_data.bindMobile
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

  gotoPage: function (e) {
    app.gotoPage(e);
  },
});