const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
  },
  roomId: null,

  onLoad: function (e) {
    let that = this;
    app.getUserInfo(function (u) {
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
        })
      } else {
        setTimeout(function () {
          if (!that.roomId) {
            that.onShow();
          }
        }, 100);
      }
    });
  },

  onShow: function (s) {
    if (!app.GLOBAL_DATA.USER_INFO) return;
    let that = this;
    that.roomId = 'HOLD';
    zutils.get(app, 'api/pk/room-init', function (res) {
      let _data = res.data.data;
      if (_data && _data.roomid) {
        that.roomId = _data.roomid;
      } else {
        that.roomId = null;
      }
    });
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

  gotoPage: function (e) {
    app.gotoPage(e);
  },

  sfid: function (e) {
    zutils.post(app, 'api/user/report-formid?formId=' + e.detail.formId);
  }
});