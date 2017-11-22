const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
    selected: null,
  },
  back: null,

  onLoad: function (e) {
    this.back = e.back || 0;
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

  saveChange: function (e) {
    var that = this;
    if (!that.data.selected) {
      wx.showModal({
        title: '提示',
        content: '请选择你的考试类型',
        showCancel: false
      })
      return;
    }

    zutils.post(app, 'api/user/settings?key=MainSubject&value=' + that.data.selected + '&formId=' + (e.detail.formId || ''), function (res) {
      app.GLOBAL_DATA.RELOAD_SUBJECT = ['Home', 'Subject'];
      if (that.back == 1) {
        wx.navigateBack();
      } else {
        wx.switchTab({
          url: '../question/subject-list'
        })
      }
    });
  }
});