const zutils = require('utils/zutils.js');

App({
  GLOBAL_DATA: {
    USER_INFO: null
  },
  onLaunch: function (e) {
    var that = this;
    wx.getStorage({
      key: 'USER_INFO',
      success: function (res) {
        that.GLOBAL_DATA.USER_INFO = res.data;
        console.log('checkUserInfo 1 - ' + JSON.stringify(res))
      }
    });
    this.checkUserInfo(null, true);
  },
  checkUserInfo: function (cb, needLogin) {
    var that = this;
    wx.checkSession({
      fail: function () {
        if (needLogin == true) that.getUserInfo()
      },
      success: function () {
        if (that.GLOBAL_DATA.USER_INFO) {
          typeof cb == 'function' && cb(this.GLOBAL_DATA.USER_INFO);
        } else {
          wx.getStorage({
            key: 'USER_INFO',
            success: function (res) {
              that.GLOBAL_DATA.USER_INFO = res.data;
              typeof cb == 'function' && cb(this.GLOBAL_DATA.USER_INFO);
              console.log('checkUserInfo 2 - ' + JSON.stringify(res))
            },
            fail: function () {
              if (needLogin == true) that.getUserInfo()
            }
          });
        }
      }
    });
  },
  getUserInfo: function (cb) {
    if (this.GLOBAL_DATA.USER_INFO) {
      typeof cb == 'function' && cb(this.GLOBAL_DATA.USER_INFO)
    } else {
      var that = this;
      wx.login({
        success: function (res) {
          wx.getUserInfo({
            success: function (res2) {
              zutils.post(that, 'api/user/wxx-login', { code: res.code, iv: res2.iv, data: res2.encryptedData }, function (res3) {
                that.GLOBAL_DATA.USER_INFO = res3.data.data;
                wx.setStorage({ key: 'USER_INFO', data: that.GLOBAL_DATA.USER_INFO })
                typeof cb == 'function' && cb(that.GLOBAL_DATA.USER_INFO)
                wx.hideLoading()
              })
            }
          })
        }
      })
    }
  }
})