const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
    seqCurrent: 1,
    seqTotal: 1,
    cardHide: true,
  },
  subjectId: null,
  questionList: null,

  onLoad: function (e) {
    var that = this;
    this.subjectId = e.subject;
    this.loadQuestion();
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
      setInterval(function () {
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

  renderQuestion: function () {
    var that = this;
    var q = that.questionList[this.data.seqCurrent];
    var q_content = q['questionId.question'];
    q_content = q_content.replace(/\[\]/g, '（__）');
    this.setData({
      question: q_content
    });

    if (q.answers) {
      that.setData({
        answerList: q.answers,
        keySelected: q['questionId.seq'] + '-' + (q.selected || '')
      });
    } else {
      zutils.get(app, 'api/question/get-answers?question=' + q['questionId'], function (res) {
        var data = res.data.data.result_list;
        for (var i = 0; i < data.length; i++) {
          var dd = data[i];
          dd.keyText = dd.key.substr(1);
          dd.keyUnique = that.data.seqCurrent + '-' + dd.key;
        }
        q.answers = data;
        that.setData({
          answerList: q.answers
        });
      });
    }
  },

  prevQuestion: function () {
    if (this.data.seqCurrent == 1) return false;
    var that = this;
    that.setData({
      seqCurrent: that.data.seqCurrent - 1
    });
    that.renderQuestion();
  },

  nextQuestion: function () {
    if (this.data.seqCurrent == this.data.seqTotal) return false;
    var that = this;
    that.setData({
      seqCurrent: that.data.seqCurrent + 1
    });
    that.renderQuestion();
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
    console.log(e);
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
  },

  onShareAppMessage: function () {
    return { title: '帮忙看看这道题怎么破？', path: '/pages/index/go?source=exam' };
  }
});