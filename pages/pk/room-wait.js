const app = app || getApp();
const zutils = require('../../utils/zutils.js');
const wss = require('../../utils/wss.js');

Page({
  data: {
    showConfirm: false
  },
  roomId: null,

  onLoad: function (e) {
    this.roomId = e.id || e.pkroom;
    if (!this.roomId || !app.GLOBAL_DATA.USER_INFO) {
      app.gotoPage('/pages/pk/start');
      return;
    }

    let that = this;
    app.getUserInfo(function (u) {
      that.setData({
        fooHeadimg: u.headimgUrl,
        fooNick: u.nick
      });

      if (e.id) {
        that.fooReady();
      } else if (e.pkroom) {
        that.barEnter();
      }
    });
  },

  fooReady: function () {
    let that = this;
    zutils.post(app, 'api/pk/foo-ready?room=' + this.roomId, function (res) {
      let _data = res.data;
      if (_data.error_code != 0) {
        that.__error(_data.error_msg);
      } else {
        that.initSocket();
        setTimeout(function () {
          that.setData({
            showBtns: true,
            stateText: '等待对手加入'
          })
        }, 600);
      }
    });
  },

  barEnter: function () {
    let that = this;
    zutils.post(app, 'api/pk/bar-enter?room=' + this.roomId, function (res) {
      let _data = res.data;
      if (_data.error_code != 0) {
        that.__error(_data.error_msg);
      } else {
        that.initSocket();
        _data = _data.data;
        that.setData({
          barHeadimg: _data.fooHeadimg,
          barNick: _data.fooNick
        });
        setTimeout(function () {
          that.setData({
            showBtns: true,
            stateText: '等待发起者开始'
          })
        }, 600);
      }
    });
  },

  confirmPk: function (e) {
    let that = this;
    let _url = 'api/pk/foo-start?room=' + this.roomId + '&formId=' + + (e.detail.formId || '');
    zutils.post(app, _url, function (res) {
      let _data = res.data;
      if (_data.error_code != 0) {
        that.__error(_data.error_msg);
      } else {
        wss.close('PKNEXT');
        wx.redirectTo({
          url: 'room-pk?id=' + that.roomId
        });
      }
    });
  },

  initSocket: function () {
    let url = 'ws/api/pk/room-echo?uid=' + app.GLOBAL_DATA.USER_INFO.uid + '&room=' + this.roomId;
    wss.init(url, this.handleMessage);
  },

  handleMessage: function (data) {
    switch (data.action) {
      case 1010:  // BAR 进入
        data.showConfirm = true;
        data.stateText = '请确认开始对战';
        this.setData(data);
        break;
      case 1011:  // FOO 开始
        wss.close('PKNEXT');
        wx.redirectTo({
          url: 'room-pk?id=' + this.roomId
        });
        break;
      case 1012:  // BAR 放弃
        this.setData({
          showConfirm: false,
          barHeadimg: null,
          barNick: null,
          stateText: '等待对手加入'
        });
        break;
      case 1013:  // FOO 放弃
        this.__error('发起者已放弃');
        break;
      default:
        console.log('未知 Action ' + data.action);
    }
  },

  cancelPk: function () {
    wx.showModal({
      title: '提示',
      content: '确认放弃本轮对战吗？',
      success: function (res) {
        if (res.confirm) {
          wss.close('PKWAIT');
          wx.navigateBack();
        }
      }
    })
  },

  // 显示错误并退出
  __error: function (error_msg) {
    wx.showModal({
      title: '提示',
      content: error_msg || '系统错误',
      showCancel: false,
      success: function () {
        wx.navigateBack();
      }
    })
  },

  onUnload: function () {
    wss.close('PKWAIT');
  },

  onShareAppMessage: function () {
    let that = this;
    let d = {
      title: app.GLOBAL_DATA.USER_INFO.nick + '向你发起挑战',
      path: '/pages/pk/start?pkroom=' + this.roomId,
      success: function (res) {
      }
    }
    return d;
  },
})