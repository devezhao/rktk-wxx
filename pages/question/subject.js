const app = app || getApp();
const zutils = require('../../utils/zutils.js');

import { zsharebox } from '../comps/z-sharebox.js';
zsharebox.data.typeName = '题库';

Page({
  data: {
    shareboxData: zsharebox.data
  },
  subjectId: null,

  onLoad: function (e) {
    var that = this;
    app.getUserInfo(function () {
      that.__onLoad(e);
    });
  },

  __onLoad: function (e) {
    var that = this;
    that.subjectId = e.id;
    zutils.get(app, 'api/subject/details?id=' + that.subjectId, function (res) {
      var data = res.data.data;
      var pp = data.answer_pass / data.answer_num;
      if (isNaN(pp)) {
        data.answer_pass = '0.0%';
      } else {
        data.answer_pass = pp.toFixed(1) + '%';
      }
      that.setData(data);
      that.fullName = data.parent_name + data.subject_name;
      wx.setNavigationBarTitle({
        title: data.subject_name
      });
    });
  },

  toExam: function (e) {
    var that = this;
    var tips_content = '将进入答题页面，请做好准备';
    if (this.data.coin > 0) {
      tips_content = '本次答题将消耗' + this.data.coin + '学豆';
    }

    wx.showModal({
      title: '提示',
      content: tips_content,
      confirmText: '开始答题',
      success: function (res) {
        if (res.confirm) {
          zutils.post(app, 'api/exam/start?subject=' + that.subjectId + '&formId=' + (e.detail.formId || ''), function (res2) {
            var data2 = res2.data;
            if (data2.error_code == 0) {
              wx.redirectTo({
                url: '../exam/exam?subject=' + that.subjectId + '&exam=' + data2.data.exam_id
              });
            } else {
              wx.showModal({
                title: '提示',
                content: data2.error_msg || '错误',
                showCancel: false
              });
            }
          });
        }
      }
    });
  },

  toExplain: function () {
    wx.showModal({
      title: '提示',
      content: '即将开放',
      showCancel: false
    })
  },

  onShareAppMessage: function () {
    var d = app.warpShareData('/pages/question/subject?id=' + this.subjectId);
    if (this.fullName) d.title = this.fullName;
    console.log(d);
    return d;
  },

  shareboxOpen: function () {
    zsharebox.shareboxOpen(this);
  },
  shareboxClose: function () {
    zsharebox.shareboxClose(this);
  },
  dialogOpen: function () {
    zsharebox.dialogOpen(this);
  },
  dialogClose: function () {
    zsharebox.dialogClose(this);
  },
  share2Frined: function () {
    zsharebox.share2Frined(this);
  },
  share2QQ: function () {
    zsharebox.share2QQ(this);
  },
  share2CopyLink: function () {
    zsharebox.share2CopyLink(this);
  }
});

//zutils.extends(PageHandler, zsharebox.methods);
//PageHandler.shareboxOpen = function(){
//  zsharebox.methods.shareboxOpen(this);
//}
//Page(PageHandler);