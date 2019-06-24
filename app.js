const zutils = require('utils/zutils.js');

App({
  GLOBAL_DATA: {
    // 用户信息
    USER_INFO: null,
    // 数据刷新
    RELOAD_SUBJECT: [],
    RELOAD_EXAM: [],
    RELOAD_COIN: [],
    RELOAD_VIP: [],
    // 自己分享的口令
    KT_TOKENS: [],
    // 最近关注题库
    FOLLOW_SUBJECT: [],
    // 系统信息
    SYS_INFO: {},
    IS_ANDROID: false,
    IS_IOS: false,
    // 红点
    RED_DOT: {},
  },

  onLaunch: function(e) {
    this.enterSource = e;
    console.log("小程序初始化: " + JSON.stringify(this.enterSource));

    let that = this;
    wx.getStorage({
      key: 'USER_INFO',
      success: function(res) {
        console.log('用户信息: ' + JSON.stringify(res));
        that.GLOBAL_DATA.USER_INFO = res.data;
        that.reportKpi('LOGIN', null, JSON.stringify(that.enterSource));
      },
      fail: function() {
        that.getUserInfo()
      },
      complete: function() {
        //that.reportKpi('LOGIN', null, JSON.stringify(that.enterSource));
      }
    });

    wx.getSystemInfo({
      success: function(res) {
        that.GLOBAL_DATA.IS_ANDROID = /Android/g.test(res.system);
        that.GLOBAL_DATA.IS_IOS = /iOS/g.test(res.system);

        // NOTE!!! 使用 windowHeight 会有问题，高度可能与页面获取的不一致（由是否有tab决定）
        that.GLOBAL_DATA.SYS_INFO = res;
        console.log('系统信息: ' + JSON.stringify(that.GLOBAL_DATA.SYS_INFO));
      },
    });
  },

  onShow: function(e) {
    console.log("小程序进入前台: " + JSON.stringify(e));
    this.reenterSource = e
  },

  onHide: function(e) {
    console.log("小程序进入后台: " + JSON.stringify(e));

    // 新版微信已取消
    // try {
    //   wx.setTopBarText({
    //     text: '正在答题，点击继续',
    //     complete: function (res) {
    //       console.log("setTopBarText - " + JSON.stringify(res));
    //     }
    //   });
    // } catch (error) {
    //   console.error("setTopBarText error - " + JSON.stringify(error));
    // }
  },

  onError: function(e) {
    console.error("出现错误: " + JSON.stringify(e));
  },

  // 基础库 1.9.90 支持
  onPageNotFound: function(e) {
    console.error("页面不存在: " + JSON.stringify(e));
    this.gotoPage('/pages/index/index');
  },

  // 需要授权才能访问的页面/资源先调用此方法
  // 在回调函数中执行实际的业务操作
  getUserInfo: function(cb, _retry) {
    if (this.GLOBAL_DATA.USER_INFO) {
      typeof cb == 'function' && cb(this.GLOBAL_DATA.USER_INFO)
    } else {
      let that = this;
      _retry = _retry || 1;
      if (that.__inLogin == true && _retry <= 10) {
        console.log('已在登陆中 WAIT-' + _retry + ' ...')
        setTimeout(function() {
          that.getUserInfo(cb, _retry + 1);
        }, 200 + (_retry * 20));
        return;
      }

      that.__inLogin = true;
      wx.login({
        success: function(res) {
          that.__storeUserInfo(res, cb);
        }
      })
    }
  },
  // 存储授权
  __storeUserInfo: function(res, cb) {
    console.log('存储授权 - ' + JSON.stringify(res))
    let that = this;
    let _data = {
      code: res.code,
      iv: res.iv || '',
      data: res.encryptedData || ''
    };
    _data.enterSource = that.enterSource;
    zutils.post(that, 'api/user/wxx-login', _data, function(res) {
      that.GLOBAL_DATA.USER_INFO = res.data.data;
      wx.setStorage({
        key: 'USER_INFO',
        data: that.GLOBAL_DATA.USER_INFO,
        success: function() {
          that.__inLogin = false;
          that.reportKpi('LOGIN', null, JSON.stringify(that.enterSource));
        }
      })

      typeof cb == 'function' && cb(that.GLOBAL_DATA.USER_INFO);
    });
  },

  // 20180514: 新版授权。授权成功后返回当前页面，因此不具备回调方法执行能力
  // @back 页面回退
  getUserInfoForce: function(back) {
    if (back === true) {
      wx.navigateTo({
        url: '/pages/index/auth?nexturl=back'
      });
      return;
    }

    let cp = getCurrentPages()[getCurrentPages().length - 1];
    let url = cp.route;
    if (cp.options && Object.keys(cp.options).length > 0) {
      let args = [];
      for (let k in cp.options) {
        args.push(k + '=' + cp.options[k]);
      }
      url += '?' + args.join('&');
    }
    wx.navigateTo({
      url: '/pages/index/auth?nexturl=' + encodeURIComponent('/' + url)
    });
  },

  // ---- 助手类方法

  // 分享数据
  warpShareData: function(url) {
    url = url || '/pages/index/index';
    if (url.indexOf('?') > -1) url += '&';
    else url += '?';
    url += 'u=' + (this.GLOBAL_DATA.USER_INFO ? this.GLOBAL_DATA.USER_INFO.uid : '');
    let d = {
      title: '软考刷题必备利器',
      path: url,
      success: function(res) {
        console.log('分享回调: ' + JSON.stringify(res));
      }
    };
    console.log(d);
    return d;
  },

  // 页面跳转
  gotoPage: function(url, redirect) {
    if (!!!url) return;
    if (typeof url == 'object') {
      url = url.currentTarget.dataset.url;
    }
    if (url == '/pages/index/index' || url == '/pages/question/subject-list' || url == '/pages/my/home' || url == '/pages/pk/start') {
      wx.switchTab({
        url: url
      })
    } else {
      if (redirect == true) wx.redirectTo({
        url: url
      })
      else wx.navigateTo({
        url: url
      })
    }
  },

  gotoVipBuy: function(msg, forceTips) {
    if (this.GLOBAL_DATA.IS_IOS) {
      this.alert('你还不是VIP会员');
      return;
    }

    msg = msg || '本题库/功能仅VIP会员可用';
    if (forceTips === true) {
      wx.showModal({
        title: '提示',
        content: msg,
        confirmText: '立即开通',
        success: function(res) {
          if (res.confirm) this.gotoPage('/pages/my/vip-buy')
        }
      });
    } else {
      this.gotoPage('/pages/my/vip-buy?msg=' + msg)
    }
  },

  // 上报分析数据
  // t=EXAM,EXPLAIN etc.
  // s=相关题库（可选）
  // ext=附加信息（可选）
  reportKpi: function(k, s, ext) {
    zutils.post(this, 'api/kpi/report?noloading&kpi=' + k + '&subject=' + (s || '') + '&ext=' + encodeURIComponent(ext || ''), function(res) {
      console.log('KPI Report: ' + JSON.stringify(res.data));
    });
  },

  // 添加关注题库（答题或解析的）
  followSubject: function(id) {
    if (!id || !this.GLOBAL_DATA.FOLLOW_SUBJECT) return;
    let fs = this.GLOBAL_DATA.FOLLOW_SUBJECT;
    zutils.array.erase(fs, id);
    fs.push(id);
    if (fs.length > 20) fs = fs.slice(fs.length - 20);
    this.GLOBAL_DATA.FOLLOW_SUBJECT = fs;
    let that = this;
    wx.setStorage({
      key: 'FOLLOW_SUBJECT',
      data: that.GLOBAL_DATA.FOLLOW_SUBJECT.join(',')
    })
  },

  // 基础库 1.9 支持
  // 显示红点
  showReddot: function(tabIndex, key) {
    if (!wx.showTabBarRedDot) return;
    let that = this;
    wx.getStorage({
      key: 'TapedReddot' + key,
      fail: function(res) {
        setTimeout(function() {
          wx.showTabBarRedDot({
            index: tabIndex,
            success: function(res) {
              that.GLOBAL_DATA.RED_DOT[tabIndex] = key;
            }
          });
        }, 666);
      }
    })
  },
  // 隐藏红点
  hideReddot: function(tabIndex, key) {
    if (!wx.hideTabBarRedDot) return;
    setTimeout(function() {
      wx.hideTabBarRedDot({
        index: tabIndex,
        complete: function(res) {
          wx.setStorage({
            key: 'TapedReddot' + key,
            data: 'TAPED'
          });
        }
      });
    }, 666);
  },

  // 简单 alert
  alert: function(msg, fn) {
    wx.showModal({
      title: '提示',
      content: msg || '系统繁忙请重试',
      showCancel: false,
      success: fn || function() {}
    });
  }
})