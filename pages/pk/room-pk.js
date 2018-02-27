const app = app || getApp();
const zutils = require('../../utils/zutils.js');
const wss = require('../../utils/wss.js');

Page({
  data: {
    showResult: false,
    fooScope: 0,
    barScope: 0,
  },
  roomId: null,
  questions: null,
  questionIdx: 0,
  sysInfo: null,

  onLoad: function (e) {
    this.roomId = e.id;
    if (!this.roomId || !app.GLOBAL_DATA.USER_INFO) {
      app.gotoPage('/pages/pk/start');
      return;
    }

    let that = this;
    zutils.get(app, 'api/pk/room-info?room=' + this.roomId, function (res) {
      let _data = res.data.data;
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
    });

    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          questionHeight: res.windowHeight - 510
        });
        that.sysInfo = res;
      },
    });

    this.__audioContext = wx.createInnerAudioContext();

    // this.setData({
    //   fooScope: 240,
    //   barScope: 140
    // })
    // this.__complete();
  },

  renderQuestion: function () {
    this.setData({
      question: '第' + (this.questionIdx + 1) + '题',
      questionClazz: 'animated fadeInDown',
      showClazz: '',
      answer: null
    });

    let that = this;
    setTimeout(function () {
      that.playAudio('pk_begindown.wav');
      that.__renderQuestion();
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
      barSelectKey: null,
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
    // 都回答了
    if (!!q.fooKey && !!q.barKey) {
      this.setData({
        rightKey: q.rightKey
      });

      let that = this;
      setTimeout(function () {
        if (that.questionIdx == 4) {
          that.__complete();
        } else {
          that.questionIdx++;
          that.renderQuestion();
        }
      }, 1000 * 50);
    }
  },

  __complete: function () {
    let total = this.data.fooScope + this.data.barScope;
    let fooScopeWidth = this.data.fooScope / total;
    let barScopeWidth = 100 - fooScopeWidth;
    let windowWidth = this.sysInfo.windowWidth;
    fooScopeWidth = windowWidth * fooScopeWidth;
    barScopeWidth = this.sysInfo.windowWidth - fooScopeWidth;
    let minWidth = 90;
    if (this.data.fooScope == 0 && this.data.barScope == 0) {
      fooScopeWidth = minWidth;
      barScopeWidth = minWidth;
    } else if (this.data.fooScope == 0) {
      fooScopeWidth = minWidth;
      barScopeWidth = windowWidth - fooScopeWidth;
    } else if (this.data.barScope == 0) {
      barScopeWidth = minWidth;
      fooScopeWidth = windowWidth - barScopeWidth;
    }
    if (fooScopeWidth < minWidth) {
      fooScopeWidth = minWidth;
      barScopeWidth = windowWidth - fooScopeWidth;
    } else if (barScopeWidth < minWidth) {
      barScopeWidth = minWidth;
      fooScopeWidth = windowWidth - barScopeWidth;
    }

    let isWin = this.data.fooScope > this.data.barScope;
    this.setData({
      showResult: true,
      fooScopeWidth: fooScopeWidth - 30,
      barScopeWidth: barScopeWidth - 30,
      isWin: isWin
    });
    this.playAudio(isWin ? 'win.mp3' : 'lost.wav');
    wss.close('PKEND');
  },

  selectAnswer: function (e) {
    let q = this.questions[this.questionIdx];
    if (!!q.fooKey) return;
    q.fooKey = !!e ? e.currentTarget.dataset.key : 'X';
    let scope = this.data.fooScope || 0;
    let scopeNew = scope;
    if (q.rightKey == q.fooKey) scopeNew += 20;

    if (this.__countdownTimer) clearInterval(this.__countdownTimer);
    this.setData({
      selectKey: q.fooKey,
      rightKey: q.fooKey == q.rightKey ? q.fooKey : null,
      fooScope: scopeNew,
      fooScopeClazz: scope == scopeNew ? '' : 'animated bounceIn',
      countdown: null
    });
    this.checkToNext();

    if (q.fooKey == q.rightKey) {
      this.playAudio('select_right.wav');
    } else {
      this.playAudio('select_wrong.wav');
    }

    let send = { qindex: this.questionIdx, scope: scopeNew, select: q.fooKey };
    wss.send(1100, send);
  },

  initSocket: function () {
    let url = 'ws/api/pk/room-echo?uid=' + app.GLOBAL_DATA.USER_INFO.uid + '&room=' + this.roomId;
    wss.init(url, this.handleMessage);
  },

  handleMessage: function (data) {
    let that = this;
    if (data.action == 1022 || data.action == 1023) {
      wx.showModal({
        title: '提示',
        content: '对手已放弃',
        showCancel: false,
        success: function () {
          that.__complete();
        }
      });
      return;
    }

    switch (data.action) {
      case 1021:  // BAR已回答
        that.setData({
          barScope: data.scope,
          barScopeClazz: data.scope == this.data.scope ? '' : 'animated bounceIn',
          barSelectKey: data.select
        });
        let q = this.questions[this.questionIdx];
        q.barKey = data.select;
        that.checkToNext();
        break;
      default:
        console.log('未知 Action ' + data.action);
    }
  },

  playAudio: function (file, loop) {
    this.__audioContext.stop();
    this.__audioContext.src = 'https://c.rktk.qidapp.com/a/wxx/pk/' + file;
    this.__audioContext.loop = loop == true ? true : false;
    this.__audioContext.play();
  },

  beginPk: function () {
    app.gotoPage('/pages/pk/start');
  },

  onShareAppMessage: function () {
    var d = app.warpShareData('/pages/pk/start');
    d.title = '快来参加软考PK赛';
    console.log(d);
    return d;
  },

  onUnload: function () {
    if (this.__countdownTimer) clearInterval(this.__countdownTimer);
    wss.close('PKING');
  }
})