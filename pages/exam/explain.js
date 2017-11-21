const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
    viewId: 'question'
  },

  onLoad: function (e) {
    console.log(e);
    this.questionId = e.q;
    this.answerKey = e.a;
    var that = this;
    app.getUserInfo(function () {
      that.__onLoad(e);
    });

    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          viewHeight: res.windowHeight - 40 - (!!that.answerKey ? 49 : 0)
        })
      }
    });
  },

  __onLoad: function (e) {
    var that = this;
    zutils.get(app, 'api/question/details?id=' + this.questionId, function (res) {
      var data = res.data.data;
      for (var i = 0; i < data.answer_list.length; i++) {
        var item = data.answer_list[i];
        var clazz = data.answer_key.indexOf(item[0]) > -1 ? 'right' : '';
        if (that.answerKey && that.answerKey.indexOf(item[0]) > -1) {
          clazz += ' selected';
        }
        item[10] = clazz;
        item[11] = item[0].substr(1);
        data.answer_list[i] = item;
      }

      if (that.answerKey) {
        data.rightAnswer = that.__formatAnswerKey(data.answer_key);
        data.yourAnswer = that.__formatAnswerKey(that.answerKey);
      }
      that.setData(data);
    });
  },

  __formatAnswerKey: function (ak) {
    var answer_key = ak.split('/');
    for (var i = 0; i < answer_key.length; i++) {
      var a = answer_key[i].substr(1);
      answer_key[i] = (a == 'X') ? '无' : a;
      if (a == 'ull') {  // null
        answer_key[i] = '未作答';
        answer_key[i] = '无';
      }
    }
    answer_key = answer_key.join(' / ');
    return answer_key;
  },

  fav: function (e) {
    var that = this;
    zutils.post(app, 'api/fav/toggle?question=' + this.questionId, function (res) {
      var data = res.data.data;
      that.setData({
        isFav: data.is_fav
      });
    });
  },

  position: function (e) {
    var vid = e.currentTarget.dataset.vid;
    this.setData({
      viewId: vid
    })
  },

  onShareAppMessage: function () {
    var s = app.shareData();
    s.title = '[考题解析]' + this.data.question.substr(0,10).replace('，', '') + '...';
    return s;
  }
});