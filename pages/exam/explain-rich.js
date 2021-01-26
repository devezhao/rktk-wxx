const app = app || getApp();
const zutils = require('../../utils/zutils.js');

import {
  zsharebox
} from '../comps/z-sharebox.js';

Page({
  data: {
    shareboxData: zsharebox.data,
    viewId: 'question',
    currentQuestionId: null,
    hideNos: true,
    isIOS: false
  },
  questionId: null, // for share
  qcached: {},
  qosid: null,

  onLoad: function (e) {
    this.qosid = e.id;

    let that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          viewHeight: res.windowHeight - 40
        });
      }
    });

    app.getUserInfo(function (u) {
      that.setData({
        user: u.uid
      });

      if (that.qosid.substr(0, 3) == '112') {
        that.setData({
          currentQuestionId: that.qosid
        });
        that.__loadQuestion(e);
      } else {
        zutils.get(app, 'api/subject/subject-qids?subject=' + that.qosid, function (res) {
          that.__qids = res.data.data;
          let idx = 1;
          try {
            idx = wx.getStorageSync('ExplainPageNo' + that.qosid);
            if (idx) {
              idx = ~~idx;
              if (idx < 1 || idx > that.__qids.length) {
                idx = 1;
              }
            } else {
              idx = 1;
            }
          } catch (e) {}

          that.setData({
            hideNos: false,
            qidsTotal: that.__qids.length,
            qidsNo: idx,
            currentQuestionId: that.__qids[idx - 1]
          });
          that.__loadQuestion();
        });
      }
    });

    this.turningAnimation = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease',
      transformOrigin: '50% 50% 0'
    });
  },

  __loadQuestion: function (idx) {
    this.questionId = this.data.currentQuestionId;
    if (idx && typeof idx == 'number') {
      wx.setStorage({
        key: 'ExplainPageNo' + this.qosid,
        data: idx
      })
    }

    if (this.qcached[this.data.currentQuestionId]) {
      this.setData(this.qcached[this.data.currentQuestionId]);
      return;
    }

    var that = this;
    zutils.get(app, 'api/question/details?id=' + this.data.currentQuestionId, function (res) {
      var _data = res.data.data;
      _data.viewId = 'question';
      let nos = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
      for (let i = 0; i < _data.answer_list.length; i++) {
        _data.answer_list[i].no = nos[i];
      }

      if (app.GLOBAL_DATA.IS_IOS === true) {
        _data.explain_adtxt = '你还不是VIP会员';
        _data.isIOS = true;
      }

      that.setData(_data);
      that.qcached[that.data.currentQuestionId] = _data;
    });
  },

  goPrev: function (e) {
    if (!this.__qids) return;
    let idx = this.data.qidsNo;
    if (idx <= 1) idx = this.__qids.length + 1;
    idx -= 1;
    this.setData({
      qidsNo: idx,
      currentQuestionId: this.__qids[idx - 1]
    });
    this.__loadQuestion(idx);
  },

  goNext: function (e) {
    if (!this.__qids) return;
    let idx = this.data.qidsNo;
    if (idx >= this.__qids.length) idx = 0;
    idx += 1;
    this.setData({
      qidsNo: idx,
      currentQuestionId: this.__qids[idx - 1]
    });
    this.__loadQuestion(idx);
  },

  fav: function (e) {
    let that = this;
    let formId = (e && e.detail) ? (e.detail.formId || '') : '';
    zutils.post(app, 'api/fav/toggle?question=' + this.data.currentQuestionId + '&formId=' + formId, function (res) {
      let _data = res.data.data;
      that.qcached[that.data.currentQuestionId].isFav = _data.is_fav;
      that.setData({
        isFav: _data.is_fav
      });
      if (_data.is_fav) wx.showToast({
        title: '已加入收藏'
      });
    });
  },

  position: function (e) {
    let vid = e.currentTarget.dataset.vid;
    this.setData({
      viewId: vid,
    })
  },

  onShareAppMessage: function () {
    let d = app.warpShareData('/pages/exam/explain-rich?id=' + this.data.currentQuestionId);
    d.title = '#考题解析#' + this.data.question.replace('，', '').replace('（', '').replace('）', '').trim().substr(0, 30) + '...';
    return d;
  },

  shareboxOpen: function (e) {
    // let formId = (e && e.detail) ? (e.detail.formId || '') : '';
    // zutils.post(app, 'api/user/report-formid?formId=' + formId);
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
  },

  gotoPage: function (e) {
    app.gotoPage(e);
  },

  // 翻页

  turningStart: function (e) {
    if (!this.__qids) return;
    this.__turning_CX = e.touches[0].clientX;
    this.__turning_CY = e.touches[0].clientY;
    this.turningAnimation.opacity(0.666).step();
    this.setData({
      turningData: this.turningAnimation.export()
    });
  },

  turningMove: function (e) {
    if (!this.__turning_CX || this.__turning_CX == -9999) return;
    let isX = e.touches[0].clientX - this.__turning_CX;
    let isY = e.touches[0].clientY - this.__turning_CY;
    if (Math.abs(isX) > 30 && Math.abs(isX) > Math.abs(isY)) {
      this.__turning = true;
      this.__turningLeft = isX;
    }
  },

  turningEnd: function (e) {
    if (!this.__turning_CX) return;
    this.__turning_CX = -9999;
    if (this.__turning !== true) {
      this.turningAnimation.opacity(1).step({
        duration: 100
      });
      this.setData({
        turningData: this.turningAnimation.export()
      });
      return;
    }
    this.__turning = false;

    if (this.__turningLeft < 0) {
      this.turningAnimation.translateX('-100%').step().translateX(0).opacity(1).step({
        duration: 100
      });
      this.goNext();
    } else {
      this.turningAnimation.translateX('100%').step().translateX(0).opacity(1).step({
        duration: 100
      });
      this.goPrev();
    }
    this.setData({
      turningData: this.turningAnimation.export()
    });
  },
});