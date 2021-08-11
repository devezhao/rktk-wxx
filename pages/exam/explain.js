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
    hideInteractiveMode: true,
    interactiveMode: false
  },
  questionId: null, // for share
  qcached: {},
  qosid: null,
  answerKey: null,
  canInteractive: false,

  onLoad: function (e) {
    this.answerKey = e.a;
    this.qosid = e.id;

    let that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          viewHeight: res.windowHeight - 40,
        });
      }
    });

    this.setData({
      isFullScreen: app.GLOBAL_DATA.IS_FULLSCREEN
    })

    // 从题库解析
    let viewSubject = this.qosid.substr(0, 3) == '110';
    if (viewSubject == true) {
      // 强制练习模式
      if (e.interactive == 1) {
        this.canInteractive = true;
        this.setData({
          hideInteractiveMode: false,
          interactiveMode: true
        });
      } else {
        this.setData({
          hideInteractiveMode: false
        });
        wx.getStorage({
          key: 'ExplainInteractiveMode',
          success: function (res) {
            that.setData({
              interactiveMode: res.data == true
            });
          }
        });
        zutils.get(app, 'api/user/can-interactive?subject=' + this.qosid, function (res) {
          that.canInteractive = res.data.data != 'NO';
          if (that.data.interactiveMode == true && that.canInteractive == false) {
            that.setData({
              interactiveMode: false
            });
          }
        });
      }
    }

    if (!!this.answerKey || viewSubject == true) {
      this.setData({
        pageClazz: 'has-btm'
      });
    }

    app.getUserInfo(function (u) {
      that.setData({
        user: u.uid
      });

      if (viewSubject == false) {
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
          } catch (e) {
            console.error(e);
          }

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
    this.__selectAnswer = null;
    this.questionId = this.data.currentQuestionId;
    if (idx && typeof idx == 'number') {
      wx.setStorage({
        key: 'ExplainPageNo' + this.qosid,
        data: idx
      });
    }

    let _data = this.qcached[this.data.currentQuestionId];
    if (_data) {
      this.__loadQuestionAfter(_data);
      return;
    }

    let that = this;
    zutils.get(app, 'api/question/details?id=' + this.data.currentQuestionId, function (res) {
      let _data = res.data.data;
      that.qcached[that.data.currentQuestionId] = _data;
      that.__loadQuestionAfter(_data);
    });
  },

  __loadQuestionAfter: function (_data) {
    _data.viewId = 'question';
    if (this.data.interactiveMode == true) _data.showExplain = false;
    else _data.showExplain = true;

    for (let i = 0; i < _data.answer_list.length; i++) {
      let item = _data.answer_list[i];
      let clazz = _data.answer_key.indexOf(item[0]) > -1 ? 'right' : '';
      if (this.answerKey && this.answerKey.indexOf(item[0]) > -1) clazz += ' selected';
      item[10] = clazz;
      if (this.data.interactiveMode == true) item[10] = null;
      item[11] = item[0].substr(1);
      _data.answer_list[i] = item;
    }

    if (this.answerKey) {
      _data.rightAnswer = this.__formatAnswerKey(_data.answer_key);
      _data.yourAnswer = this.__formatAnswerKey(this.answerKey);
    }
    this.setData(_data);
  },

  __checkExplainShow: function () {
    return; // 暂时不用
    if (this.data.explain_freedom != 'LIMIT') return;
    let that = this;
    that.setData({
      hideGradual: false
    })
    setTimeout(() => {
      wx.createSelectorQuery().select('.explain-content').fields({
        size: true,
      }, function (res) {
        that.setData({
          hideGradual: res.height > 0 && res.height < 190
        })
      }).exec();
    }, 100);
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

  // 练习模式
  interactiveAnswer: function (res) {
    if (this.data.interactiveMode == false) return;
    let key = res.currentTarget.dataset.key;
    let keyIndex = key.substr(0, 1);
    if (this.__selectAnswer && zutils.array.in(this.__selectAnswer, keyIndex)) {
      return;
    }
    this.__selectAnswer = this.__selectAnswer || [];
    this.__selectAnswer.push(keyIndex);

    let answer_list = this.data.answer_list;
    let answer_key = this.data.answer_key;
    for (let i = 0; i < answer_list.length; i++) {
      let ak = answer_list[i][0];
      if (ak.substr(0, 1) != keyIndex) continue;
      let clazz = '';
      if (ak == key) clazz = 'selected';
      if (answer_key.indexOf(ak) > -1) clazz += ' right';
      if (clazz != '') {
        answer_list[i][10] = clazz;
      }
    }
    this.setData({
      answer_list: answer_list,
      showExplain: this.__selectAnswer.length == answer_list.length / 4, // 显示解析
    });
  },

  toggleInteractive: function () {
    if (this.canInteractive == false) {
      app.gotoVipBuy('非VIP会员仅可对免费题库启用练习模式', true);
      return;
    }

    let toggle = this.data.interactiveMode == false;
    this.setData({
      interactiveMode: toggle
    });
    wx.setStorage({
      key: 'ExplainInteractiveMode',
      data: toggle
    });
    wx.showToast({
      icon: 'none',
      title: '练习模式已' + (toggle ? '开启' : '关闭')
    });
    this.__loadQuestion(this.data.qidsNo);
  },

  __formatAnswerKey: function (ak) {
    var answer_key = ak.split('/');
    for (var i = 0; i < answer_key.length; i++) {
      var a = answer_key[i].substr(1);
      answer_key[i] = (a == 'X') ? '无' : a;
      if (a == 'ull') { // null
        answer_key[i] = '未作答';
        answer_key[i] = '无';
      }
    }
    answer_key = answer_key.join(' / ');
    return answer_key;
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
    let d = app.warpShareData('/pages/exam/explain?id=' + this.data.currentQuestionId);
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

  gotoVipBuy: function () {
    app.gotoVipBuy();
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