const zutils = require('utils/zutils.js');

App({
  GLOBAL_DATA: {
    USER_INFO: null,
    // 数据刷新
    RELOAD_SUBJECT: [],
    RELOAD_EXAM: [],
    RELOAD_COIN: []
  },

  onLaunch: function (e) {
    var that = this;
    wx.getStorage({
      key: 'USER_INFO',
      success: function (res) {
        that.GLOBAL_DATA.USER_INFO = res.data;
        console.log('onLaunch checkUserInfo - ' + JSON.stringify(res))
      }
    });
  },

  onShow: function () {
    this.checkUserInfo(null, false);
  },

  onError: function (e) {
    console.error("出现错误: " + JSON.stringify(e));
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
        success: function (res1) {
          that.login_code = res1.code;
          wx.getUserInfo({
            success: function (res2) {
              res2.code = res1.code;
              that.__storeUserInfo(res2, cb);
            }, fail: function (res2) {
              that.__forceUserInfo(cb);
            }
          })
        }
      })
    }
  },

  __storeUserInfo: function (res, cb) {
    console.log('存储授权 - ' + JSON.stringify(res))
    var that = this;
    var _data = { code: (res.code || that.login_code), iv: res.iv, data: res.encryptedData };
    _data.inviter = this.GLOBAL_DATA.__inviter || '';
    zutils.post(this, 'api/user/wxx-login', _data, function (res2) {
      that.GLOBAL_DATA.USER_INFO = res2.data.data;
      wx.setStorage({ key: 'USER_INFO', data: that.GLOBAL_DATA.USER_INFO })
      typeof cb == 'function' && cb(that.GLOBAL_DATA.USER_INFO)
      wx.hideLoading()
    })
  },

  __forceUserInfo: function (cb) {
    var that = this;
    wx.getUserInfo({
      success: function (res) {
        that.__storeUserInfo(res, cb);
      }, fail: function (res) {
        wx.showModal({
          content: '请允许软考必备使用你的用户信息',
          showCancel: false,
          success: function () {
            wx.openSetting({
              success: function () {
                that.__forceUserInfo(cb);
              }
            })
          }
        });
      }
    })
  },

  // 分享数据
  shareData: function (s) {
    var url = '/pages/index/go?u=' + (this.GLOBAL_DATA.USER_INFO ? this.GLOBAL_DATA.USER_INFO.uid : '');
    if (!!s) {
      url += '&s=' + s;
    }
    console.log('share: ' + url);
    return { title: '软考刷题必备利器', path: url };
  }
})