const app = app || getApp();
const zutils = require('../../utils/zutils.js');
import {
  zsharebox
} from '../comps/z-sharebox.js';

Page({
  data: {
    shareboxData: zsharebox.data,
  },
  subjectId: null,

  onLoad: function (e) {
    let that = this;
    app.getUserInfo(function (u) {
      that.__onLoad(e);
    });
  },

  __onLoad: function (e) {
    let that = this;
    that.subjectId = e.id;
    zutils.get(app, 'api/subject/details?id=' + that.subjectId, function (res) {
      let _data = res.data;
      if (_data.error_code > 0) {
        app.alert(_data.error_msg, function () {
          app.gotoPage('/pages/index/index');
        })
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
    if (this.data.subject_type == 11) {
      app.alert('本题库不支持答题');
      return;
    }
    if (this.data.subject_type == 2) {
      this.toExam_Type2(e);
      return;
    }

    let tips_content = '将进入答题页面，请做好准备';
    if (this.data.vip_free == false) {
      if (this.data.coin == -2) {
        app.gotoVipBuy('本题库为VIP专享，开通VIP会员可立即答题');
        return;
      } else if (this.data.coin > 0) {
        tips_content = '本次答题将消耗' + this.data.coin + '学豆';
      }
    }

    let that = this;
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

  // 知识点答题
  toExam_Type2: function (e) {
    let that = this;
    wx.showActionSheet({
      itemList: ['答10题', '答20题', '答30题'],
      success: function (res) {
        let tapIndex = res.tapIndex;
        let num = tapIndex == 0 ? 10 : 20;
        if (tapIndex == 2) num = 30;
        let coin = ~~(num / (10 / that.data.coin));
        let tips_content = '将进入答题页面，请做好准备';
        if (that.data.coin > 0 && that.data.vip_free == false) {
          tips_content = '本次答题将消耗' + coin + '学豆';
        }

        wx.showModal({
          title: '提示',
          content: tips_content,
          confirmText: '开始答题',
          success: function (res) {
            if (res.confirm) {
              zutils.post(app, 'api/subject/gen-private?quote=' + that.subjectId + '&num=' + num + '&formId=' + (e.detail.formId || ''), function (res) {
                let _data = res.data;
                if (_data.error_code == 0) {
                  that.__toExam(_data.data, null);
                } else {
                  that.__examErrorMsg(_data.error_msg);
                }
              });
            }
          }
        });
      }
    });
  },

  __toExam: function (subject, e) {
    let that = this;
    zutils.post(app, 'api/exam/start?subject=' + subject + '&formId=' + (!!e ? (e.detail.formId || '') : ''), function (res) {
      app.followSubject(that.subjectId);
      let _data = res.data;
      if (_data.error_code == 0) {
        wx.redirectTo({
          url: '../exam/exam?subject=' + subject + '&exam=' + _data.data.exam_id
        });
      } else {
        that.__examErrorMsg(_data.error_msg);
      }
    });
  },

  __examErrorMsg: function (error_msg) {
    error_msg = error_msg || '系统繁忙，请稍后重试';
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
    } else if (error_msg.indexOf('好友') > -1) {
      wx.showModal({
        title: '提示',
        content: error_msg,
        confirmText: '立即邀请',
        success: function (res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/acts/share-guide'
            })
          }
        }
      });
    } else {
      app.alert(error_msg);
    }
  },

  toExplain: function (e) {
    // zutils.post(app, 'api/user/report-formid?formId=' + (e.detail.formId || ''));

    if (this.data.vip_free == false && this.data.coin == -2) {
      app.gotoVipBuy('本题库为VIP专享，开通VIP会员可立即免费使用');
      return;
    }
    if (this.data.vip_free == false && this.data.explain_free == false) {
      app.gotoVipBuy('本题库解析仅对VIP会员开放，开通VIP可立即免费使用');
      return;
    }

    app.reportKpi('EXPLAIN', this.subjectId);
    app.followSubject(this.subjectId);

    let _url = '../exam/explain?id=' + this.subjectId;
    if (this.data.subject_type == 11) _url = '../exam/explain-rich?id=' + this.subjectId;
    wx.redirectTo({
      url: _url
    });
  },

  onShareAppMessage: function () {
    let d = app.warpShareData('/pages/question/subject?id=' + this.subjectId);
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