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
      var _data = res.data;
      if (_data.error_code > 0) {
        wx.showModal({
          title: '提示',
          content: _data.error_msg,
          showCancel: false,
          success: function () {
            app.gotoPage('/pages/index/index');
          }
        });
        return;
      }

      _data = _data.data;
      _data.pass_percent = _data.pass_percent.toFixed(1);
      that.setData(_data);
      that.fullName = _data.parent_name + _data.subject_name;
      wx.setNavigationBarTitle({
        title: _data.subject_name
      });
    });
  },

  toExam: function (e) {
    if (this.data.subject_type == 2) {
      this.toExam_Type2(e);
      return;
    }

    var tips_content = '将进入答题页面，请做好准备';
    if (this.data.coin > 0) {
      tips_content = '本次答题将消耗' + this.data.coin + '学豆';
    }
    var that = this;
    wx.showModal({
      title: '提示',
      content: tips_content,
      confirmText: '开始答题',
      success: function (res) {
        if (res.confirm) {
          that.__toExam(that.subjectId, e);
        }
      }
    });
  },

  toExam_Type2: function (e) {
    var that = this;
    wx.showActionSheet({
      itemList: ['答10题', '答20题', '答30题'],
      success: function (res) {
        let tapIndex = res.tapIndex;
        var num = tapIndex == 0 ? 10 : 20;
        if (tapIndex == 2) num = 30;
        zutils.post(app, 'api/subject/gen-private?quote=' + that.subjectId + '&num=' + num, function (res) {
          var _data = res.data;
          if (_data.error_code == 0) {
            that.__toExam(_data.data, e);
          } else {
            let error_msg = _data.error_msg || '系统繁忙，请稍后重试';
            if (error_msg.indexOf('会员') > -1) {
              wx.showModal({
                title: '提示',
                content: error_msg,
                confirmText: '立即开通',
                success: function (res) {
                  if (res.confirm) {
                    wx.navigateTo({
                      url: '/pages/my/vip-buy'
                    })
                  }
                }
              });
            } else {
              wx.showModal({
                title: '提示',
                content: error_msg,
                showCancel: false
              });
            }
          }
        });
      }
    });
  },

  __toExam: function (subject, e) {
    var that = this;
    zutils.post(app, 'api/exam/start?subject=' + subject + '&formId=' + (e.detail.formId || ''), function (res) {
      var _data = res.data;
      if (_data.error_code == 0) {
        wx.redirectTo({
          url: '../exam/exam?subject=' + subject + '&exam=' + _data.data.exam_id
        });
      } else {
        let error_msg = _data.error_msg || '系统繁忙，请稍后重试';
        if (error_msg.indexOf('好友') > -1) {
          wx.showModal({
            title: '提示',
            content: error_msg,
            confirmText: '立即邀请',
            success: function (res) {
              if (res.confirm) {
                wx.navigateTo({
                  url: '/pages/index/share-guide'
                })
              }
            }
          });
        } else {
          wx.showModal({
            title: '提示',
            content: error_msg,
            showCancel: false
          });
        }
      }
    });
  },

  toExplain: function (e) {
    zutils.post(app, 'api/user/report-formid?formId=' + (e.detail.formId || ''));
    wx.redirectTo({
      url: '../exam/explain?id=' + this.subjectId
    });
    // wx.showModal({
    //   title: '提示',
    //   content: '本功能暂未开放，你可在答题完成后查看解析',
    //   showCancel: false
    // })
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