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
        wx.navigateTo({
          url: 'room-wait?pkroom=' + e.pkroom
        });
      } else {
        // zutils.get(app, 'api/pk/room-init', function (res) {
        //   let _data = res.data.data;
        //   if (_data && _data.roomid) {
        //     that.roomId = _data.roomid;
        //   }
        // });
      }
    });
  },

  onShow: function () {
    let that = this;
    zutils.get(app, 'api/pk/room-init', function (res) {
      let _data = res.data.data;
      if (_data && _data.roomid) {
        that.roomId = _data.roomid;
      }
    });
  },

  onShareAppMessage: function () {
    let that = this;
    let d = {
      title: app.GLOBAL_DATA.USER_INFO.nick + '向你发起挑战',
      path: '/pages/pk/start?pkroom=' + that.roomId || '',
      success: function (res) {
        if (that.roomId) {
          wx.navigateTo({
            url: 'room-wait?id=' + that.roomId
          });
        }
      }
    }
    return d;
  },

  gotoPage: function (e) {
    app.gotoPage(e);
  }
});