const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
    seqCurrent: 1,
    seqTotal: 1
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
      //wx.setNavigationBarTitle({
      //  title: data.subject
      //})
    });
  },

  renderQuestion: function () {
    var that = this;
    var q = that.questionList[this.data.seqCurrent];
    this.setData({
      question: q['questionId.question']
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

  showSeqs: function () {
    var that = this;
    wx.showModal({
      title: '答题卡',
      content: that.data.seqTotal + ''
    })
  },

  answer: function (e) {
    console.log(e);
    var that = this;
    var key = e.currentTarget.dataset.key;
    this.setData({
      keySelected: that.data.seqCurrent + '-' + key
    });
    this.questionList[this.data.seqCurrent].selected = key;
  },

  onShareAppMessage: function () {
    return { title: '这道题我不会啊，帮我看看', path: '/pages/index/index' };
  }
});