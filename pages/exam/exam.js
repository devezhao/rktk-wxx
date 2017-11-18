const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
    seqCurrent: 1,
    seqTotal: 1,
    cardHide: true,
    isFirst: true,
    isLast: false,
  },
  examId: null,
  subjectId: null,
  questionList: null,
  dtcardAnimation: null,
  questionAnimation: null,
  favList: [],

  onLoad: function (e) {
    if (!e.exam || !e.subject) {
      wx.redirectTo({
        url: '../index/tips?msg=非法请求参数'
      });
      return;
    }

    this.examId = e.exam;
    this.subjectId = e.subject;

    this.dtcardAnimation = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease',
      delay: 50
    });
    this.questionAnimation = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease',
      delay: 50
    });

    var that = this;
    zutils.get(app, 'api/fav/ids?spec=' + this.subjectId, function (res) {
      that.favList = res.data.data;
    });
    this.loadQuestion();
  },

  onUnload: function () {
    this._clearCountdown();
  },

  _clearCountdown: function(){
    if (this._countdown) {
      clearInterval(this._countdown);
      this._countdown = null;
      wx.setNavigationBarTitle({
        title: '软考题库PRO'
      });
    }
  },

  loadQuestion: function () {
    var that = this;
    zutils.get(app, 'api/question/list?subject=' + that.subjectId, function (res) {
      var data = res.data.data;
      that.setData({
        subject: data.subject,
        seqTotal: data.total_result,
        seqCurrent: 1
      });

      that.questionList = {};
      for (var i = 0; i < data.result_list.length; i++) {
        var q = data.result_list[i];
        that.questionList[q.seq] = q;
      }
      that.renderQuestion();

      var time = 0;
      that._countdown = setInterval(function () {
        time++;
        var time_m = ~~(time / 60);
        var time_s = time % 60;
        time_m = time_m < 10 ? ('0' + time_m) : time_m;
        time_s = time_s < 10 ? ('0' + time_s) : time_s;
        wx.setNavigationBarTitle({
          title: '答题中 [' + (time_m + ':' + time_s) + ']'
        });
      }, 1000);
    });
  },

  renderQuestion: function (s) {
    var that = this;
    var seq = ~~this.data.seqCurrent + (s || 0);
    var q = that.questionList[seq];
    var answers_data = {
      seqCurrent: seq,
      question: q.question,
      answerList: q._answers,
      isFirst: seq == 1,
      isLast: seq == ~~this.data.seqTotal,
      isFav: zutils.array.in(this.favList, q.questionId)
    };
    console.log(JSON.stringify(answers_data));

    if (q._answers) {
      answers_data.keySelected = seq + '-' + (q._selected || '');
      that.setData(answers_data);
    } else {
      zutils.get(app, 'api/question/get-answers?question=' + q.questionId, function (res) {
        var data = res.data.data.result_list;
        for (var i = 0; i < data.length; i++) {
          var dd = data[i];
          dd.keyText = dd.key.substr(1);
        }
        q._answers = data;
        answers_data.answerList = q._answers;
        that.setData(answers_data);
      });
    }
  },

  prevQuestion: function () {
    if (this.data.seqCurrent == 1) return false;
    var that = this;
    setTimeout(function () {
      that.renderQuestion(-1);
    }, 0);

    //this.questionAnimation.translateX('120%').step().translateX(0).step()
    //this.setData({
    //  questionAnimation: this.questionAnimation.export()
    //});
  },

  nextQuestion: function () {
    if (this.data.seqCurrent == this.data.seqTotal) return false;
    var that = this;
    setTimeout(function () {
      that.renderQuestion(1);
    }, 0);

    //this.questionAnimation.translateX('-120%').step().translateX(0).step()
    //this.setData({
    //  questionAnimation: this.questionAnimation.export()
    //});
  },

  gotoQuestion: function (e) {
    var seq = ~~e.currentTarget.dataset.seq;
    this.dtcardAnimation.translateY('100%').step({ duration: 0 });
    this.setData({
      dtcardAnimation: this.dtcardAnimation.export(),
      seqCurrent: seq
    });
    this.renderQuestion();
  },

  showDtcard: function () {
    var that = this;
    var takes = [];
    for (var seq in this.questionList) {
      var q = this.questionList[seq];
      var clazz = q._selected && q._selected.length > 0 ? 'active' : '';
      if (!!clazz && ~~q.answerNum > q._selected.length) clazz += ' half';
      takes.push({ seq: q.seq, clazz: clazz });
    }
    //this.setData({
    //  questionTakes: takes
    //});

    this.dtcardAnimation.translateY(0).step();
    this.setData({
      questionTakes: takes,
      dtcardAnimation: this.dtcardAnimation.export()
    });
  },
  closeDtcard: function () {
    this.dtcardAnimation.translateY('100%').step();
    this.setData({
      dtcardAnimation: this.dtcardAnimation.export()
    });
  },

  fav: function (e) {
    var that = this;
    var q = that.questionList[this.data.seqCurrent];
    zutils.post(app, 'api/fav/toggle?question=' + q.questionId, function (res) {
      var data = res.data.data;
      that.setData({
        isFav: data.is_fav
      });
      if (data.is_fav) {
        that.favList.push(q.questionId);
      } else {
        zutils.array.erase(that.favList, q.questionId);
      }
    });
  },

  answer: function (e) {
    var that = this;
    var key = e.currentTarget.dataset.key;
    var key_prefix = key.charAt(0);
    var _selected = this.questionList[this.data.seqCurrent]._selected || [];
    var _selected_replace = false;
    for (var i = 0; i < _selected.length; i++) {
      var k = _selected[i];
      if (k.charAt(0) == key_prefix) {
        _selected[i] = key;
        _selected_replace = true;
        break;
      }
    }
    if (!_selected_replace) {
      _selected.push(key);
    }

    var q = that.questionList[this.data.seqCurrent];
    for (var i = 0; i < q._answers.length; i++) {
      q._answers[i].clazz = '';
      if (_selected.join(',').indexOf(q._answers[i].key) > -1) {
        q._answers[i].clazz = 'selected';
      }
    }
    this.setData({
      answerList: q._answers
    });

    console.log(_selected);
    this.questionList[this.data.seqCurrent]._selected = _selected;

    if (that.examId) {
      zutils.post(app, 'api/exam/record?exam=' + that.examId + '&question=' + q.itemId + '&answer=' + _selected.join('/'), function (res) {
        console.log(res);
      });
    } else {
      console.error('No exam?');
    }
  },

  finish: function () {
    var undo = 0;
    for (var k in this.questionList) {
      var q = this.questionList[k];
      if (!q._selected || q._selected.length < ~~q.answerNum) undo++;
    }

    var that= this;
    if (undo > 0) {
      wx.showModal({
        content: '还有' + undo + '道题没答，确认交卷吗？',
        success: function (res) {
          if (res.confirm) {
            that.finish2();
          }
        }
      })
    } else {
      wx.showModal({
        content: '确认交卷吗？',
        success: function (res) {
          if (res.confirm) {
            that.finish2();
          }
        }
      })
    }
  },
  finish2: function () {
    if (!this.examId) {
      console.error('No exam?');
      return;
    }

    var that = this;
    wx.showLoading({
      title: '正在交卷...'
    });
    zutils.post(app, 'api/exam/finish?noliading&exam=' + that.examId, function (res) {
      if (res.data.error_code == 0) {
        that._clearCountdown();
        wx.redirectTo({
          url: 'exam-result?redirect=1&exam=' + that.examId
        });
      } else {
        wx.showModal({
          title: '提示',
          showCancel: false,
          content: res.data.error_msg || '系统错误'
        })
      }
    });
  },

  onShareAppMessage: function () {
    return app.shareData('exam&id=' + this.subjectId);
  }
});