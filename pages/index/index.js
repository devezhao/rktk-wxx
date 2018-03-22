const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
    hideBanners: false,
    hideCoupon: true
  },

  onLoad: function (e) {
    let that = this;
    zutils.get(app, 'api/home/comdata', function (res) {
      let _data = res.data.data;
      wx.setNavigationBarTitle({
        title: _data.title || '软考必备',
      });

      if (!_data.banners || _data.banners.length == 0) {
        that.setData({
          hideBanners: true
        });
      } else {
        that.setData({
          banners: _data.banners
        });

        // 红点
        if (_data.reddot) {
          for (let k in _data.reddot) {
            app.showReddot(_data.reddot[k], k)
          }
        }
      }
    });

    app.getUserInfo(function () {
      that.__loadRecent();
      that.__loadRecommend();
      that.__checkTwxx();
      that.__checkToken();
      that.__checkCoupon();
    });

    wx.getStorage({
      key: 'FOLLOW_SUBJECT',
      success: function (res) {
        let fs = res.data.split(',');
        app.GLOBAL_DATA.FOLLOW_SUBJECT = fs;
        if (fs.length > 0) {
          that.__loadFollowSubject(fs);
        }
      }
    })
  },

  onPullDownRefresh: function () {
    this.onLoad();
    setTimeout(function () {
      wx.stopPullDownRefresh();
    }, 800);
  },

  onShow: function () {
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
    }
  },

  // 解析分享来源
  __checkTwxx: function () {
    var q = app.__enter_source.query.q || app.__enter_source.query.scene;
    if (q && decodeURIComponent(q).indexOf('/t/wxx/') > -1) {
      zutils.get(app, 'api/share/parse-twxx?q=' + q, function (res) {
        if (res.data.error_code == 0) {
          wx.navigateTo({
            url: res.data.data
          })
        }
      });
    }
  },

  // 解析口令
  __checkToken: function () {
    if (this.__checkToken_OK == true) return;
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
          if (that.__enter_source.scene == 1011 || that.__enter_source.scene == 1012 || that.__enter_source.scene == 1013) {
            console.log('扫码进入' + that.__enter_source.scene + ': ' + res.data);
            rktk_token = true;
            return;
          }
          // 自己分享的
          if (zutils.array.in(that.GLOBAL_DATA.KT_TOKENS, res.data)) {
            return;
          }

          rktk_token = true;
          zutils.get(app, 'api/share/token-parse?text=' + encodeURIComponent(res.data), function (res2) {
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

  // 最近关注题库
  __loadFollowSubject: function (fs) {
    if (!fs || fs.length < 3) return;
    this.__lastFs = fs[fs.length - 1];
    let that = this;
    zutils.get(app, 'api/home/subject-names?ids=' + fs.join(','), function (res) {
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
  __loadRecent: function () {
    var that = this;
    zutils.get(app, 'api/home/recent-exams', function (res) {
      that.setData(res.data.data);
    });
  },

  // 推荐题库
  __loadRecommend: function () {
    let that = this;
    zutils.get(app, 'api/home/recommend-subjects', function (res) {
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

  __formatSubject: function (_subjects) {
    for (var i = 0; i < _subjects.length; i++) {
      var sname = _subjects[i][1];
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

  todayExam: function (e) {
    var that = this;
    zutils.post(app, 'api/exam/today-exam?formId=' + (e.detail.formId || ''), function (res) {
      if (res.data.error_code == 0) {
        var data = res.data.data;
        wx.navigateTo({
          url: '../exam/exam?subject=' + data.subject_id + '&exam=' + data.exam_id
        })
      } else {
        var error_msg = res.data.error_msg || '系统错误';
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

  signin: function (e) {
    zutils.post(app, 'api/home/signin?noloading&formId=' + (e.detail.formId || ''), function (res) {
      var _data = res.data;
      if (_data.error_code == 0) {
        app.GLOBAL_DATA.RELOAD_COIN = ['Home'];
        wx.showToast({
          title: _data.data || '签到成功',
          icon: 'success'
        });
      } else {
        app.alert(_data.error_msg);
      }
    });
  },

  gotoPage: function (e) {
    let formId = (e && e.detail) ? (e.detail.formId || '') : '';
    zutils.post(app, 'api/user/report-formid?formId=' + formId);
    app.gotoPage(e.currentTarget.dataset.url);
  },

  onShareAppMessage: function () {
    return app.warpShareData();
  },

  // 优惠券

  __checkCoupon: function () {
    let that = this;
    let today = zutils.formatDate('ONyyyyMMdd');
    wx.getStorage({
      key: 'LastCouponShow',
      complete: function (res) {
        // 今日未显示
        if (!(res.data && res.data == today)) {
          zutils.get(app, 'api/user/check-coupon', function (res) {
            if (res.data.error_code == 0 && res.data.data) {
              let _data = res.data.data;
              _data.hideCoupon = false;
              that.setData(_data);
              app.reportKpi('COUPON.SHOW');
              wx.setStorage({
                key: 'LastCouponShow',
                data: today
              });
            }
          });
        }
      }
    });
  },

  hideCoupon: function () {
    let that = this;
    that.setData({ hideCoupon: true });
    app.reportKpi('COUPON.CLOSE');
    // wx.getStorage({
    //   key: 'LastCouponShowTips',
    //   complete: function (res) {
    //     that.setData({ hideCoupon: true });
    //     if (!res.data) {
    //       wx.setStorage({
    //         key: 'LastCouponShowTips',
    //         data: '1',
    //       });
    //       wx.showModal({
    //         title: '提示',
    //         content: '你可在VIP会员开通页选择使用',
    //         showCancel: false,
    //         confirmText: '知道了'
    //       });
    //     }
    //   }
    // });
  }
});