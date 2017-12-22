const zutils = require('utils/zutils.js');

App({
  GLOBAL_DATA: {
    // 用户信息
    USER_INFO: null,
    // 数据刷新
    RELOAD_SUBJECT: [],
    RELOAD_EXAM: [],
    RELOAD_COIN: [],
    // 自己分享的口令
    KT_TOKENS: [],
    // 进入场景
    ENTER_SCENE: 0,
    // 进入参数
    ENTER_QSTR: null
  },

  onLaunch: function (e) {
    console.log("小程序初始化: " + JSON.stringify(e));
    this.GLOBAL_DATA.ENTER_SCENE = e.scene;
    if (e.u || e._su) {
      this.GLOBAL_DATA.__inviter = e.u || e._su;
    }

    var that = this;
    wx.getStorage({
      key: 'USER_INFO',
      success: function (res) {
        console.log('Launch checkUserInfo - ' + JSON.stringify(res));
        that.GLOBAL_DATA.USER_INFO = res.data;
      },
      complete: function () {
        that.__checkUserInfo(null, false);
      }
    });
  },

  onShow: function (e) {
    console.log("小程序进入前台: " + JSON.stringify(e));
    if (this.USER_INFO) {
      this.__checkToken();
    }
  },

  __checkToken: function () {
    this.__checkToken_OK = true;

    // 清除口令
    var rktk_token = false;
    setTimeout(function () {
      if (rktk_token == true) {
        wx.setClipboardData({
          data: ''
        });
      }
    }, 1500);

    var that = this;
    wx.getClipboardData({
      success: function (res) {
        if (res.data && res.data.substr(0, 6) == '#考题解析#') {
          // 扫码进入，优先级高于粘贴板
          if (that.GLOBAL_DATA.ENTER_SCENE == 1011) {
            console.log('扫码进入1011: ' + res.data);
            rktk_token = true;
            return;
          }
          // 自己分享的
          if (zutils.array.in(that.GLOBAL_DATA.KT_TOKENS, res.data)) {
            return;
          }

          rktk_token = true;
          zutils.get(that, 'api/share/token-parse?text=' + encodeURIComponent(res.data), function (res2) {
            if (res2.data.error_code == 0) {
              var _data = res2.data.data;
              wx.showModal({
                title: _data.title,
                confirmText: '立即查看',
                content: _data.content,
                success: function (res3) {
                  if (res3.confirm) {
                    wx.navigateTo({
                      url: _data.page
                    })
                  }
                }
              });
            }
          });
        }
      }
    });
  },

  onError: function (e) {
    console.error("出现错误: " + JSON.stringify(e));
  },

  // 需要授权才能访问的页面/资源先调用此方法
  // 在回调函数中执行实际的业务操作
  getUserInfo: function (cb) {
    if (this.GLOBAL_DATA.USER_INFO) {
      typeof cb == 'function' && cb(this.GLOBAL_DATA.USER_INFO)
    } else {
      var that = this;
      wx.login({
        success: function (res) {
          that.login_code = res.code;
          wx.getUserInfo({
            success: function (res2) {
              res2.code = res.code;
              that.__storeUserInfo(res2, cb);
            }, fail: function (res2) {
              that.__forceUserInfo(cb);
            }
          })
        }
      })
    }
  },

  __checkUserInfo: function (cb, needLogin) {
    console.log('检查授权 - cb=' + (cb == null ? 'N' : 'Y') + ', needLogin=' + (needLogin ? 'Y' : 'N'));
    var that = this;
    wx.checkSession({
      fail: function () {
        if (needLogin == true) that.getUserInfo(cb)
      },
      success: function () {
        if (that.GLOBAL_DATA.USER_INFO) {
          typeof cb == 'function' && cb(that.GLOBAL_DATA.USER_INFO);
        } else {
          wx.getStorage({
            key: 'USER_INFO',
            success: function (res) {
              that.GLOBAL_DATA.USER_INFO = res.data;
              typeof cb == 'function' && cb(that.GLOBAL_DATA.USER_INFO);
            },
            fail: function () {
              if (needLogin == true) that.getUserInfo(cb)
            }
          });
        }
      }
    });
  },

  __storeUserInfo: function (res, cb) {
    console.log('存储授权 - ' + JSON.stringify(res))
    var that = this;
    var _data = { code: (res.code || that.login_code), iv: res.iv, data: res.encryptedData };
    _data.inviter = that.GLOBAL_DATA.__inviter || '';
    _data.inviter2 = that.GLOBAL_DATA.ENTER_QSTR || '';
    zutils.post(that, 'api/user/wxx-login', _data, function (res2) {
      that.GLOBAL_DATA.USER_INFO = res2.data.data;
      wx.setStorage({ key: 'USER_INFO', data: that.GLOBAL_DATA.USER_INFO })
      typeof cb == 'function' && cb(that.GLOBAL_DATA.USER_INFO)
    })
  },

  __forceUserInfo: function (cb) {
    var that = this;
    wx.getUserInfo({
      success: function (res) {
        that.__storeUserInfo(res, cb);
      }, fail: function (res) {
        wx.showModal({
          title: '提示',
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
  warpShareData: function (url) {
    url = url || '/pages/index/index';
    if (url.indexOf('?') > -1) url += '&';
    else url += '?';
    url += 'u=' + (this.GLOBAL_DATA.USER_INFO ? this.GLOBAL_DATA.USER_INFO.uid : '');
    var d = { title: '软考刷题必备利器', path: url };
    console.log(d);
    return d;
  },

  // 到首页
  goHome: function () {
    wx.switchTab({
      url: '/pages/index/index'
    });
  }
})