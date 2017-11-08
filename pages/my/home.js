const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
    headimgUrl: '/images/no-headimg.jpg',
    nick: '匿名',
    btnText: '开始8分钟约会'
  },
  pairs_timer: null,
  countdown_timer: null,
  pairs_wating: false,

  onLoad: function () {
    var that = this;
    app.getUserInfo(function (res) {
      console.log(res)
      that.setData({
        headimgUrl: res.headimgUrl,
        nick: res.nick
      })
    });
  },

  startPairs: function () {
    var that = this;
    if (!!!app.GLOBAL_DATA.USER_INFO) {
      wx.showModal({
        showCancel: false,
        title: '提示',
        content: '请允许8分钟约会使用你的用户信息',
        success: function () {
          wx.openSetting({
            complete: function (res) {
              console.log(JSON.stringify(res));
              if (res.authSetting['scope.userInfo'] == true) {
                that.onLoad();
              }
            }
          });
        }
      })
      return;
    }

    if (this.pairs_wating == true) {
      this.cancelPairs();
      return;
    }

    this.pairs_wating = true;
    zutils.post(app, 'api/chatroom/start-pairs', function (res) {
      if (res.data.error_code == 0) {
        var data = res.data.data;
        if (data.state == 2) {
          // TODO 提示用户进入还是终止
          wx.redirectTo({
            url: '../chat/chat?roomid=' + data.room_id,
          });
        } else {
          that.pairs_timer = setTimeout(that.checkPairsState, 1000);
          that.setData({ btnText: '正在配对 ... [1]', tips: '轻触按钮可停止配对' })
          var time = 1;
          that.countdown_timer = setInterval(function () {
            that.setData({ btnText: '正在配对 ... [' + ++time + ']' })
          }, 1000);
        }
      } else {
        wx.showModal({
          title: '提示',
          content: res.data.error_msg
        })
      }
    });
  },

  cancelPairs: function () {
    var that = this;
    zutils.post(app, 'api/chatroom/cancel-pairs', function (res) {
      if (res.data.error_code == 0) {
        clearInterval(that.countdown_timer);
        clearTimeout(that.pairs_timer);
        that.pairs_wating = false;
        that.setData({ btnText: '开始8分钟约会', tips: '' })
      } else {
        wx.showModal({
          title: '提示',
          content: res.data.error_msg
        })
      }
    });
  },

  checkPairsState: function () {
    var that = this;
    zutils.get(app, 'api/chatroom/start-pairs-state?noloading', function (res) {
      var data = res.data.data;
      if (data.state == 2) {
        clearInterval(that.countdown_timer);
        that.setData({ btnText: '配对成功' });
        setTimeout(function () {
          wx.redirectTo({
            url: '../chat/chat?roomid=' + data.room_id,
          });
        }, 777);
      } else if (data.state == 0) {
        clearInterval(that.countdown_timer);
        that.setData({ btnText: '开始8分钟约会', tips: '配对超时' })
      } else {
        that.pairs_timer = setTimeout(that.checkPairsState, 1000);
      }
    });
  },

  onShareAppMessage: function () {
    return { title: '八分钟约会源于犹太人的传统习俗，年轻的单身男女在互不了解的情况下进行八分钟的交谈', path: '/pages/index/index' };
  }
});