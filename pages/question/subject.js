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
      var _data = res.data.data;
      _data.pass_percent = _data.pass_percent.toFixed(1);
      that.setData(_data);
      that.fullName = _data.parent_name + _data.subject_name;
      wx.setNavigationBarTitle({
        title: _data.subject_name
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
              data2.error_msg = data2.error_msg || '错误'
              if (data2.error_msg.indexOf('好友') > -1) {
                wx.showModal({
                  title: '提示',
                  content: data2.error_msg,
                  confirmText: '立即邀请',
                  success: function(res3) {
                    if (res3.confirm) {
                      wx.navigateTo({
                        url: '/pages/index/share-guide'
                      })
                    }
                  }
                });
              } else {
                wx.showModal({
                  title: '提示',
                  content: data2.error_msg,
                  showCancel: false
                });
              }
            }
          });
        }
      }
    });
  },

  toExplain: function (e) {
    zutils.post(app, 'api/user/report-formid?formId=' + (e.detail.formId || ''));
    wx.showModal({
      title: '提示',
      content: '本功能暂未开放，你可在答题完成后查看解析',
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