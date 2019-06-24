const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
    filter: 0,
    filterHold: false,
    yearsHide: true
  },

  onLoad: function() {
    var that = this;
    app.getUserInfo(function(u) {
      that.listSubject(null, u);
    });

    let wwidth = app.GLOBAL_DATA.SYS_INFO.windowWidth - 32;
    wwidth /= 5;
    if (wwidth > 90) wwidth = 90;
    if (wwidth < 60) wwidth = 60;
    this.setData({
      fyWidth: wwidth,
      isAndroid: app.GLOBAL_DATA.IS_ANDROID
    });
  },

  onShow: function() {
    if (zutils.array.inAndErase(app.GLOBAL_DATA.RELOAD_SUBJECT, 'Subject')) {
      this.listSubject();
    }
  },

  onPullDownRefresh: function() {
    this.listSubject(function() {
      wx.stopPullDownRefresh();
    });
  },

  listSubject: function(cb, u) {
    let that = this;
    zutils.post(app, 'api/subject/list?showAll=0&filter=' + this.data.filter, function(res) {
      typeof cb == 'function' && cb();
      if (res.data.error_code > 0) {
        that.setData({
          showNosubject: true
        })
        wx.navigateTo({
          url: 'subject-choice?source=first'
        });
        return;
      }

      let _data = res.data.data;
      wx.setNavigationBarTitle({
        title: _data.subject
      });
      _data.showNosubject = false;

      let _sublist1 = _data.sublist1 || [];
      for (let i = 0; i < _sublist1.length; i++) {
        _sublist1[i][4] = _sublist1[i][4].toFixed(1);
        _sublist1[i][10] = _sublist1[i][1].substr(0, 4);
        _sublist1[i][11] = _sublist1[i][1].substr(4, 3);
        let sname = _sublist1[i][1];
        if (sname.indexOf('下午') > -1) {
          _sublist1[i][12] = 'T2';
          if (sname.indexOf('论文') > -1) {
            _sublist1[i][12] = 'T3';
          }
        }
      }

      if (!!!_data.subname1 || _data.sublist1.length == 0) {
        _data.subname1 = null;
        _data.sublist1 = null;
      }
      if (!!!_data.subname2) {
        _data.subname2 = null;
        _data.sublist2 = null;
      }

      if (!_data.subname1 && !_data.subname2) {
        _data.showNodata = true;
      } else {
        _data.showNodata = false;
      }
      that.setData(_data);
      wx.pageScrollTo({
        scrollTop: 0
      })

      // 授权
      // setTimeout(function() {
      //   if (/^U[0-9]{5,10}$/.test(u.nick)) {
      //     app.getUserInfoForce(true);
      //   }
      // }, 666);
    });
  },

  doFilter: function(e) {
    let s = e.currentTarget.dataset.s;
    this.setData({
      filter: s,
      yearsText: ~~s > 2000 ? s : null,
      yearsHide: true
    });
    this.listSubject();
  },

  doShowYears: function() {
    this.setData({
      yearsHide: false
    });
    return false;
  },
  doHideYears: function() {
    this.setData({
      yearsHide: true
    })
  },

  onPageScroll: function(res) {
    if (~~res.scrollTop > 80) {
      if (this.data.filterHold == false) {
        this.setData({
          filterHold: true
        })
      }
    } else {
      if (this.data.filterHold == true) {
        this.setData({
          filterHold: false
        })
      }
    }
  },

  gotoPage: function(e) {
    zutils.post(app, 'api/user/report-formid?formId=' + (e.detail.formId || ''));
    app.gotoPage(e);
  },

  onShareAppMessage: function(e) {
    var d = app.warpShareData('/pages/question/subject-list');
    if (this.data.subject) d.title = this.data.subject + '题库';
    else d.title = '软考题库';
    console.log(d);
    return d;
  }
});