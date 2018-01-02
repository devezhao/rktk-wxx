const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
  },

  onLoad: function () {
    var that = this;
    app.getUserInfo(function () {
      that.listSubject();
    });
  },

  onShow: function () {
    if (zutils.array.in(app.GLOBAL_DATA.RELOAD_SUBJECT, 'Subject')) {
      zutils.array.erase(app.GLOBAL_DATA.RELOAD_SUBJECT, 'Subject');
      this.listSubject();
    }
  },

  listSubject: function () {
    var that = this;
    zutils.post(app, 'api/subject/list?showAll=0', function (res) {
      if (res.data.error_code > 0) {
        that.setData({
          showNosubject: true
        })
        wx.navigateTo({
          url: 'subject-choice?source=first'
        });
        return;
      }

      var _data = res.data.data;
      wx.setNavigationBarTitle({
        title: _data.subject
      });
      _data.showNosubject = false;

      var _sublist1 = _data.sublist1;
      for (var i = 0; i < _sublist1.length; i++) {
        _sublist1[i][4] = _sublist1[i][4].toFixed(1);
        _sublist1[i][10] = _sublist1[i][1].substr(0, 4);
        _sublist1[i][11] = _sublist1[i][1].substr(4, 3);
        var sname = _sublist1[i][1];
        if (sname.indexOf('下午题') > -1) {
          _sublist1[i][12] = 'T2';
          if (sname.indexOf('Ⅱ') > -1) {
            _sublist1[i][12] = 'T3';
          }
        }
      }
      that.setData(_data);
    });
  },

  onShareAppMessage: function (e) {
    var d = app.warpShareData('/pages/question/subject-list');
    if (this.data.subject) d.title = this.data.subject + '题库';
    else d.title = '软考题库';
    console.log(d);
    return d;
  }
});