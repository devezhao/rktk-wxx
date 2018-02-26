const app = app || getApp();
const zutils = require('../../utils/zutils.js');
const wss = require('../../utils/wss.js');

Page({
  data: {
    showResult: false
  },
  roomId: null,
  questions: null,
  questionIdx: 0,

  onLoad: function (e) {
    this.roomId = e.id;
    if (!this.roomId || !app.GLOBAL_DATA.USER_INFO) {
      app.gotoPage('/pages/pk/start');
      return;
    }

    let that = this;
    zutils.get(app, 'api/pk/room-info?room=' + this.roomId, function (res) {
      let _data = res.data;
      if (_data.error_code == 0) {
        _data = _data.data;
        that.questions = _data.questions;
        _data.questions = null;

        let u = app.GLOBAL_DATA.USER_INFO;
        let isFoo = u.nick == _data.fooNick;
        that.setData({
          fooHeadimg: u.headimgUrl,
          fooNick: u.nick,
          barHeadimg: isFoo ? _data.barHeadimg : _data.fooHeadimg,
          barNick: isFoo ? _data.barNick : _data.fooNick,
        });
        that.renderQuestion();
        that.initSocket();
      } else {
        wx.showModal({
          title: '提示',
          content: _data.error_msg,
          showCancel: false,
          success: function () {
            wx.navigateBack();
          }
        })
      }
    });

    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          questionHeight: res.windowHeight - 510
        })
      },
    });

    this.__audioContext = wx.createInnerAudioContext();
  },

  renderQuestion: function () {
    this.setData({
      question: '第' + (this.questionIdx + 1) + '题',
      questionClazz: 'animated zoomInDown',
      showClazz: ''
    });
    let that = this;
    setTimeout(function () {
      that.__renderQuestion();
      that.playAudio('pk_begindown.wav');
    }, 1500);
  },

  __renderQuestion: function () {
    let q = this.questions[this.questionIdx];
    let countdown = 30;
    this.setData({
      question: q.question,
      answer: q.answer,
      source_subject: q.source_subject,
      countdown: countdown,
      selectKey: null,
      rightKey: null,
      questionClazz: null,
      showClazz: 'animated fadeIn'
    });

    if (this.__countdownTimer) clearInterval(this.__countdownTimer);
    let that = this;
    this.__countdownTimer = setInterval(function () {
      countdown--;
      that.setData({
        countdown: countdown
      });
      if (countdown == 0) {
        clearInterval(that.__countdownTimer);
        that.selectAnswer();
      }
    }, 1000);
  },

  checkToNext: function () {
    let q = this.questions[this.questionIdx];
    if (q.__fooSelect == true && q.__barSelect == true) {
      let that = this;
      setTimeout(function () {
        if (this.questionIdx == 4) {
          that.__complete();
        } else {
          that.questionIdx++;
          that.renderQuestion();
        }
      }, 1000);
    }
  },

  __complete: function () {
    this.setData({
      showResult: true
    });
  },

  selectAnswer: function (e) {
    let q = this.questions[this.questionIdx];
    if (q.__fooSelect == true) return;
    q.__fooSelect = true;

    let selectKey = !!e ? e.currentTarget.dataset.key : 'X';
    let scope = this.data.fooScope || 0;
    if (q.rightKey == selectKey) scope += 20;
    let that = this;
    zutils.post(app, 'api/pk/pk-answer?scope=' + scope + '&room=' + this.roomId, function (res) {
      if (that.__countdownTimer) clearInterval(that.__countdownTimer);
      that.setData({
        selectKey: selectKey,
        rightKey: q.rightKey,
        fooScope: scope,
        countdown: null
      });
      that.checkToNext();
    });
  },

  initSocket: function () {
    let url = 'ws/api/pk/room-echo?uid=' + app.GLOBAL_DATA.USER_INFO.uid + '&room=' + this.roomId;
    wss.init(url, this.handleMessage);
  },

  handleMessage: function (data) {
    let that = this;
    // if (data.action == 1012 || data.action == 1013) {
    //   wx.showModal({
    //     title: '提示',
    //     content: '对手已放弃',
    //     showCancel: false,
    //     success: function () {
    //       wx.navigateBack();
    //     }
    //   });
    //   return;
    // }

    switch (data.action) {
      case 1020:  // Bar已回答
        that.setData({
          barScope: data.barScope
        });
        let q = this.questions[this.questionIdx];
        q.__barSelect = true;
        that.checkToNext();
        break;
      default:
        console.log('未知 action ' + data.action);
    }
  },

  playAudio: function (file, loop) {
    this.__audioContext.stop();
    this.__audioContext.src = 'https://c.rktk.qidapp.com/a/wxx/pk/' + file;
    this.__audioContext.loop = loop == true ? true : false;
    this.__audioContext.play();
  }
})