const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
    hasError: '等待初始化'
  },
  roomId: null,
  onShowTimes: 0,

  onLoad: function (e) {
    if (!!app.GLOBAL_DATA.RED_DOT[2]) {
      app.hideReddot(2, app.GLOBAL_DATA.RED_DOT[2]);
    }

    if (!!e.pkroom) {
      this.onShowTimes = 1;
    }

    let that = this;
    app.getUserInfo(function (u) {
      that.setData({
        headimgUrl: u.headimgUrl,
        nick: u.nick
      });
      
      if (e.pkroom) {
        zutils.get(app, 'api/pk/room-check?room=' + e.pkroom, function (res) {
          let _data = res.data.data;
          if (!_data || _data.state != 1) {
            wx.showModal({
              title: '提示',
              content: '房间已关闭',
              showCancel: false
            });
          } else {
            if (_data.isFoo) {
              wx.navigateTo({
                url: 'room-wait?id=' + e.pkroom
              });
            } else {
              wx.navigateTo({
                url: 'room-wait?pkroom=' + e.pkroom
              });
            }
          }
        });
      } else {
        setTimeout(function () {
          if (!that.roomId) {
            that.onShow('onLoad');
          }
        }, 100);
      }
    });
  },

  onShow: function (s) {
    if (!app.GLOBAL_DATA.USER_INFO) return;
    this.onShowTimes++;

    let tt = this.onShowTimes;
    let that = this;
    that.roomId = 'HOLD';
    zutils.get(app, 'api/pk/room-init', function (res) {
      let _data = res.data;
      if (_data.error_code == 0) {
        that.roomId = _data.data.roomid;
        that.setData({
          hasError: null
        });
      } else {
        that.setData({
          hasError: _data.error_msg
        });
        if (tt == 1 && _data.error_msg.indexOf('考试类型') > -1) {
          wx.navigateTo({
            url: '../question/subject-choice?back=1'
          });
        }
      }

      that.__loadMeta();
      if (s == 'onPullDownRefresh') wx.stopPullDownRefresh();
    });
  },

  __loadMeta: function () {
    let that = this;
    zutils.get(app, 'api/pkrank/my-pkinfo', function (res) {
      that.setData(res.data);
    });
    zutils.get(app, 'api/pkrank/rank-list?top=3', function (res) {
      that.setData({
        rankList: res.data
      });
    });
  },

  onPullDownRefresh: function () {
    this.onShow('onPullDownRefresh');
  },

  onShareAppMessage: function (e) {
    var d = app.warpShareData('/pages/pk/start');
    d.title = '快来参加软考PK赛';
    if (e.from == 'button') {
      let that = this;
      d = {
        title: app.GLOBAL_DATA.USER_INFO.nick + '向你发起挑战',
        path: '/pages/pk/start?pkroom=' + (that.roomId && that.roomId != 'HOLD' ? that.roomId : ''),
        success: function (res) {
          if (that.roomId) {
            wx.navigateTo({
              url: 'room-wait?id=' + that.roomId
            });
          }
        }
      }
    }
    return d;
  },

  checkReady: function () {
    if (this.data.hasError == null) {
      return;
    }

    let that = this;
    wx.showModal({
      title: '提示',
      content: this.data.hasError,
      showCancel: false,
      success: function () {
        if (that.data.hasError.indexOf('考试类型') > -1 && that.onShowTimes > 1) {
          wx.navigateTo({
            url: '../question/subject-choice?back=1'
          });
        }
      }
    });
  },

  startPk: function () {
    app.alert('本功能即将开放');
  }
});