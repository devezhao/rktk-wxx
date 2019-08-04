const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
    headimgUrl: '../../images/afo.png',
    nick: '游客',
    level: '普通会员',
    subject: '选择考试类型',
    iOS: true,
    runMode: 1
  },
  showTimes: 0,

  onLoad: function (e) {
    if (!!app.GLOBAL_DATA.RED_DOT[3]) {
      app.hideReddot(2, app.GLOBAL_DATA.RED_DOT[3]);
    }

    this.setData({ iOS: app.GLOBAL_DATA.IS_IOS });

    let that = this;
    app.getUserInfo(function (u) {
      that.setData({
        headimgUrl: u.headimgUrl,
        nick: u.nick,
        user: u.uid,
        runMode: app.GLOBAL_DATA.RUN_MODE
      });
      that.__onLoad();

      if (/^U[0-9]{5,10}$/.test(u.nick)) {
        app.getUserInfoForce();
      }
    });
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

    let u = app.GLOBAL_DATA.USER_INFO;
    if (u && this.data.nick != u.nick) {
      this.setData({
        headimgUrl: u.headimgUrl,
        nick: u.nick,
      });
    }
  },

  __onLoad: function (cb, retry) {
    let that = this;
    zutils.get(app, 'api/user/infos', function (res) {
      let _data = res.data.data;
      if (!_data) {
        if (retry) {
          _data = wx.getStorageSync('home.USER_INFOS')
          console.warn('Use cache when request failed again : ' + JSON.stringify(_data || {}))
        } else {
          that.__onLoad(cb, true)
        }
      } else {
        wx.setStorage({
          key: 'home.USER_INFOS',
          data: _data
        })
      }
      
      if (!_data) return
      typeof cb == 'function' && cb();

      let isVip = _data.user_level.indexOf('VIP') > -1
      that.setData({
        level: _data.user_level,
        subject: _data.subject,
        coin: _data.coin_balance,
        vip: isVip,
        vip_discount: _data.vip_discount || '',
        vip2_discount: _data.vip2_discount || '',
        bindMobile: _data.bindMobile || '',
        bindMobileShow: !!!_data.bindMobile,
        runMode: _data.runMode
      });
      that.__UID = _data.longUid;

      if (isVip) {
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

  gotoVipBuy: function(){
    app.gotoVipBuy();
  },

  userInfo: function() {
    if (this.data.longUid) this.setData({ longUid: 0 })
    else this.setData({ longUid: this.__UID || 0 })
  },

  iosBuyVipClick: 0,
  iosBuyVip: function() {
    this.iosBuyVipClick++;
    if (this.iosBuyVipClick >= 6) {
      app.gotoPage('/pages/my/vip-buy')
    }
  }
});