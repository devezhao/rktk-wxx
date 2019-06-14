const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
    hideCoupon: true,
    hideBanners: false,
  },

  onLoad: function(e) {
    e = e || {};
    let osi = app.GLOBAL_DATA.SYS_INFO;
    if (osi && osi.screenWidth != 375) {
      let swiperHeight = 'height:' + (osi.screenWidth / 2.5) + 'px';
      this.setData({
        swiperHeight: swiperHeight
      });
    }
    this.setData({
      isAndroid: app.GLOBAL_DATA.IS_ANDROID
    });

    let that = this;
    zutils.get(app, 'api/home/comdata', function(res) {
      let _data = res.data.data;
      // if (res.data.error_code > 1000) {
      //   wx.redirectTo({ url: '/pages/index/tips?msg=' + res.data.error_msg });
      //   return;
      // }

      wx.setNavigationBarTitle({
        title: _data.title || '软考必备'
      });

      if (!_data.banners || _data.banners.length == 0) {
        that.setData({
          hideBanners: true
        });
      } else {
        that.setData({
          banners: _data.banners
        });
      }
      // 红点
      if (_data.reddot) {
        for (let k in _data.reddot) {
          app.showReddot(_data.reddot[k], k)
        }
      }
      // ICON
      if (_data.homeicon) {
        that.setData({
          homeicon: _data.homeicon
        });
      }
    });

    app.getUserInfo(function(u) {
      that.__loadRecent();
      that.__loadRecommend();
      that.__checkTwxx();
      that.__checkToken();
      setTimeout(function() {
        that.__checkCoupon();
      }, 666)
    });

    // 跳转页面
    if (e.nextpage) app.gotoPage(decodeURIComponent(e.nextpage));

    wx.getStorage({
      key: 'FOLLOW_SUBJECT',
      success: function(res) {
        let fs = res.data.split(',');
        app.GLOBAL_DATA.FOLLOW_SUBJECT = fs;
        if (fs.length > 0) {
          that.__loadFollowSubject(fs);
        }
      }
    });
  },

  onPullDownRefresh: function() {
    this.onLoad();
    setTimeout(function() {
      wx.stopPullDownRefresh();
    }, 800);
  },

  onShow: function() {
    if (zutils.array.inAndErase(app.GLOBAL_DATA.RELOAD_EXAM, 'Index')) {
      this.__loadRecent();
    }
    if (zutils.array.inAndErase(app.GLOBAL_DATA.RELOAD_SUBJECT, 'Index')) {
      this.__loadRecommend();
    }

    let fs = app.GLOBAL_DATA.FOLLOW_SUBJECT;
    if (fs && fs.length > 0) {
      let lastFs = fs[fs.length - 1];
      if (lastFs != this.__lastFs) {
        this.__loadFollowSubject(fs);
      }
    } else {
      this.setData({ followSubjects: null })
    }
  },

  // 解析分享（扫码进入）
  __checkTwxx: function() {
    let q = app.enterSource.query.q;
    if (q && decodeURIComponent(q).indexOf('/t/wxx/') > -1) {
      zutils.get(app, 'api/share/parse-twxx?q=' + q, function(res) {
        if (res.data.error_code == 0) {
          wx.navigateTo({
            url: res.data.data
          })
        }
      });
    }
  },

  // 解析分享口令
  __checkToken: function() {
    if (this.__checkToken_OK == true) return;
    this.__checkToken_OK = true;

    // 清除口令
    var rktk_token = false;
    setTimeout(function() {
      if (rktk_token == true) {
        wx.setClipboardData({
          data: ''
        });
      }
    }, 1500);

    let that = this;
    wx.getClipboardData({
      success: function(res) {
        if (res.data && res.data.substr(0, 6) == '#考题解析#') {
          // 扫码进入的优先级高于粘贴板
          let scene = app.enterSource.scene;
          if (scene == 1011 || scene == 1012 || scene == 1013 || scene == 1047 || scene == 1048 || scene == 1049) {
            console.log('扫码进入' + scene + ': ' + res.data);
            rktk_token = true;
            return;
          }
          // 自己分享的
          if (zutils.array.in(app.GLOBAL_DATA.KT_TOKENS, res.data)) {
            return;
          }

          rktk_token = true;
          zutils.get(app, 'api/share/token-parse?text=' + encodeURIComponent(res.data), function(res2) {
            if (res2.data.error_code == 0) {
              let _data = res2.data.data;
              wx.showModal({
                title: _data.title,
                confirmText: '立即查看',
                content: _data.content,
                success: function(res3) {
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

  // 最近关注题库
  __loadFollowSubject: function(fs) {
    if (!fs || fs.length < 3) return;
    this.__lastFs = fs[fs.length - 1];
    let that = this;
    zutils.get(app, 'api/home/subject-names?ids=' + fs.join(','), function(res) {
      if (res.data && res.data.data && res.data.data.length > 0) {
        let _subjects = res.data.data;
        _subjects.reverse();
        that.__formatSubject(_subjects);
        that.setData({
          followSubjects: _subjects
        });
      }
    });
  },

  // 最近答题
  __loadRecent: function() {
    let that = this;
    zutils.get(app, 'api/home/recent-exams', function(res) {
      that.setData(res.data.data);
    });

    // 错题数量在此加载/刷新
    zutils.get(app, 'api/fav/incorrect-stats?d=1', function(res) {
      that.setData(res.data.data);
    });
  },

  // 推荐题库
  __loadRecommend: function() {
    let that = this;
    zutils.get(app, 'api/home/recommend-subjects', function(res) {
      let _data = res.data.data;
      if (!_data) return;
      let _subjects = _data.recommend_subjects;
      that.__formatSubject(_subjects);
      if (_subjects.length > 3) {
        _data.recommend_subjects = [_subjects[0], _subjects[1], _subjects[2]];
        _data.recommend_subjects2 = [_subjects[3], _subjects[4], _subjects[5]];
      } else {
        _data.recommend_subjects2 = null;
      }
      that.setData(_data);
    });
  },

  __formatSubject: function(_subjects) {
    for (let i = 0; i < _subjects.length; i++) {
      let sname = _subjects[i][1];
      _subjects[i][10] = sname.substr(0, 7);
      _subjects[i][11] = sname.substr(7);
      if (sname.indexOf('下午题') > -1) {
        _subjects[i][12] = 'T2';
        if (sname.indexOf('Ⅱ') > -1) {
          _subjects[i][12] = 'T3';
        }
      }
      if (_subjects[i][3] == 2) {
        _subjects[i][12] = 'T4';
        _subjects[i][10] = '知识点';
        _subjects[i][11] = null;
        _subjects[i][2] = _subjects[i][1];
      }
    }
  },

  todayExam: function(e) {
    let that = this;
    zutils.post(app, 'api/exam/today-exam?formId=' + (e.detail.formId || ''), function(res) {
      if (res.data.error_code == 0) {
        let _data = res.data.data;
        wx.navigateTo({
          url: '../exam/exam?subject=' + _data.subject_id + '&exam=' + _data.exam_id
        })
      } else {
        let error_msg = res.data.error_msg || '系统错误';
        if (error_msg.indexOf('考试类型') > -1 || error_msg.indexOf('尚未选择') > -1) {
          wx.navigateTo({
            url: '../question/subject-choice?back=1'
          });
        } else {
          app.alert(error_msg);
        }
      }
    });
  },

  gotoPage: function(e) {
    let formId = (e && e.detail) ? (e.detail.formId || '') : '';
    zutils.post(app, 'api/user/report-formid?noloading&formId=' + formId);
    app.gotoPage(e.currentTarget.dataset.url);
  },

  onShareAppMessage: function() {
    return app.warpShareData();
  },

  // 优惠券

  __checkCoupon: function() {
    if (app.GLOBAL_DATA.IS_IOS === true) return;
    let that = this;
    zutils.get(app, 'api/user/check-coupon?noloading', function(res) {
      if (res.data.error_code == 0 && res.data.data) {
        let _data = res.data.data;
        _data.hideCoupon = true;
        _data.showConponHighbar = true;
        that.setData(_data);

        let tdshow_key = 'COUPONSHOW' + zutils.formatDate('yyMMdd');
        wx.getStorage({
          key: tdshow_key,
          success: function(res) {
            // 今日显示过
          },
          fail: function() {
            wx.setStorage({
              key: tdshow_key,
              data: '1',
            });
            that.setData({
              hideCoupon: false
            });
          }
        })
      }
    });
  },

  hideCoupon: function(e) {
    let formId = (e && e.detail) ? (e.detail.formId || '') : '';
    if (formId) zutils.post(app, 'api/user/report-formid?noloading&formId=' + formId);

    let that = this;
    that.setData({
      hideCoupon: true
    });
    app.reportKpi('COUPON.CLOSE');
  }
});