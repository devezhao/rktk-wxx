const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
    seqCurrent: 1,
    seqTotal: 1,
    cardHide: true,
  },
  examId: null,
  subjectId: null,
  questionList: null,

  onLoad: function (e) {
    var that = this;
    this.subjectId = e.subject;
    zutils.post(app, 'api/exam/start?subject=' + that.subjectId, function (res) {
      that.examId = res.data.data.exam_id;
      that.loadQuestion();
    });
  },

  onUnload: function () {
    if (this._countdown) {
      clearInterval(this._countdown);
      this._countdown = null;
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
        that.questionList[q['questionId.seq']] = q;
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
    var q_seq = this.data.seqCurrent + (s || 0);
    var q = that.questionList[q_seq];
    var q_content = q['questionId.question'];
    q_content = q_content.replace(/\[\]/g, '（__）');
    q_content = q['questionId.seq'] + '. ' + q_content;

    if (q.answers) {
      that.setData({
        seqCurrent: q_seq,
        question: q_content,
        answerList: q.answers,
        keySelected: q['questionId.seq'] + '-' + (q.selected || '')
      });
    } else {
      zutils.get(app, 'api/question/get-answers?question=' + q['questionId'], function (res) {
        var data = res.data.data.result_list;
        for (var i = 0; i < data.length; i++) {
          var dd = data[i];
          dd.keyText = dd.key.substr(1);
        }
        q.answers = data;
        that.setData({
          seqCurrent: q_seq,
          question: q_content,
          answerList: q.answers
        });
      });
    }
  },

  prevQuestion: function () {
    if (this.data.seqCurrent == 1) return false;
    this.renderQuestion(-1);
  },

  nextQuestion: function () {
    if (this.data.seqCurrent == this.data.seqTotal) return false;
    this.renderQuestion(1);
  },

  gotoQuestion: function (e) {
    console.log(e);
    var seq = ~~e.currentTarget.dataset.seq;
    this.setData({
      cardHide: true,
      seqCurrent: seq
    });
    this.renderQuestion();
  },

  showDtcard: function () {
    var that = this;
    var takes = [];
    for (var k in this.questionList) {
      var q = this.questionList[k];
      takes.push({ seq: q['questionId.seq'], clazz: (q.selected && q.selected.length > 0 ? 'active' : '') });
    }

    this.setData({
      questionTakes: takes,
      cardHide: false
    })
  },
  closeDtcard: function () {
    this.setData({
      cardHide: true
    })
  },

  answer: function (e) {
    var that = this;
    var key = e.currentTarget.dataset.key;
    var key_prefix = key.charAt(0);
    var _selected = this.questionList[this.data.seqCurrent].selected || [];
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
    for (var i = 0; i < q.answers.length; i++) {
      q.answers[i].clazz = '';
      if (_selected.join(',').indexOf(q.answers[i].key) > -1) {
        q.answers[i].clazz = 'selected';
      }
    }
    this.setData({
      answerList: q.answers
    });

    console.log(_selected);
    this.questionList[this.data.seqCurrent].selected = _selected;

    zutils.post(app, 'api/exam/record?exam=' + that.examId + '&question=' + q.questionId + '&answer=' + _selected.join(','), function (res) {
      console.log(res);
    });
  },

  finish: function () {
    var undo = 0;
    for (var k in this.questionList) {
      var q = this.questionList[k];
      if (!q.selected || q.selected.length == 0) undo++;
    }

    var that = this;
    wx.showModal({
      title: '提示',
      content: '有一些题目还没做完，确认要交卷吗？',
      confirmText: '交卷',
      success: function (res) {
        if (res.confirm) {
          zutils.post(app, 'api/exam/finish?exam=' + that.examId, function (res) {
            if (res.data.error_code == 0) {
              if (that._countdown) {
                clearInterval(that._countdown);
                that._countdown = null;
              }
              wx.redirectTo({
                url: 'result?exam=' + that.examId
              });
            } else {
              wx.showModal({
                title: '提示',
                showCancel: false,
                content: res.data.error_msg || '错误'
              })
            }
          });
        } else {
          // TODO
        }
      }
    });
  },

  onShareAppMessage: function () {
    return { title: '帮忙看看这道题怎么破？', path: '/pages/index/go?source=exam' };
  }
});