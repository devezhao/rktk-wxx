const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
    selected: null,
  },
  from_source: null,

  onLoad: function (e) {
    this.from_source = e.source;

    var that = this;
    zutils.get(app, 'api/subject/list-top', function (res) {
      var data = res.data;
      that.setData({
        subjectList_1: data.data.L1,
        subjectList_2: data.data.L2,
        subjectList_3: data.data.L3
      });
    });
  },

  subjectChange: function (e) {
    var _selected = e.detail.value;
    var _subjectList1 = this.data.subjectList_1;
    for (var i = 0, len = _subjectList1.length; i < len; ++i) {
      _subjectList1[i][3] = _subjectList1[i][0] == _selected;
    }
    var _subjectList2 = this.data.subjectList_2;
    for (var i = 0, len = _subjectList2.length; i < len; ++i) {
      _subjectList2[i][3] = _subjectList2[i][0] == _selected;
    }
    var _subjectList3 = this.data.subjectList_3;
    for (var i = 0, len = _subjectList3.length; i < len; ++i) {
      _subjectList3[i][3] = _subjectList3[i][0] == _selected;
    }
    this.setData({
      subjectList_1: _subjectList1,
      subjectList_2: _subjectList2,
      subjectList_3: _subjectList3
    });
    this.data.selected = _selected;
  },

  saveChange: function () {
    var that = this;
    if (!that.data.selected) {
      wx.showModal({
        title: '提示',
        content: '请选择你要参加的考试',
        showCancel: false
      })
      return;
    }

    zutils.post(app, 'api/user/settings?key=MainSubject&value=' + that.data.selected, function (res) {
      console.log(res);
      // 更改后要刷新的标记
      app.GLOBAL_DATA.RELOAD_SUBJECT = ['Home', 'Subject'];
      if (that.from_source == 'home') {
        wx.navigateBack({
        });
      } else {
        wx.redirectTo({
          url: '../question/subject'
        })
      }
    });
  }
});