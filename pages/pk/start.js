const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
    hasError: '等待初始化'
  },
  roomId: null,
  onShowTimes: 0,

  onLoad: function (e) {
    if (!!e.pkroom) {
      this.onShowTimes = 1;
    }
    this.setData({
      aClazz: e.pkroom ? '_' : 'animated zoomIn'
    });
    let that = this;
    setTimeout(function () {
      that.setData({
        aClazz: '_'
      });
    }, 1200);

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
            that.onShow('onLoad');
          }
        }, 100);
      }
    });
  },

  onShow: function (s) {
    if (!app.GLOBAL_DATA.USER_INFO) return;
    this.onShowTimes++;
    console.log('Fire on ' + (s || 'N') + ' ' + this.onShowTimes);

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
  }
});