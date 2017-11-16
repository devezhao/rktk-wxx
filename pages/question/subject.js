const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
  },
  subjectId: null,

  onLoad: function (e) {
    var that = this;
    that.subjectId = e.id;
    zutils.get(app, 'api/subject/details?id=' + that.subjectId, function (res) {
      var data = res.data.data;
      var pp = data.answer_pass / data.answer_num;
      if (isNaN(pp)) {
        data.answer_pass = '0.0%';
      } else {
        data.answer_pass = pp.toFixed(1) + '%';
      }
      that.setData(data);
      that.fullName = data.parent_name + data.subject_name;
      wx.setNavigationBarTitle({
        title: data.subject_name
      });
    });
  },

  exam: function () {
    var that = this;
    var tips_content = '将进入答题页面，请做好准备';
    if (this.data.coin > 0) {
      tips_content = '本次答题将消耗' + this.data.coin + '学豆';
    }

    wx.showModal({
      title: '提示',
      content: tips_content,
      confirmText: '开始答题',
      success: function (res) {
        if (res.confirm) {
          zutils.post(app, 'api/exam/start?subject=' + that.subjectId, function (res2) {
            var data2 = res2.data;
            if (data2.error_code == 0) {
              wx.redirectTo({
                url: '../exam/exam?subject=' + that.subjectId + '&exam=' + data2.data.exam_id
              })
            } else {
              wx.showModal({
                content: data2.error_msg || '错误',
                showCancel: false
              });
            }
          });
        }
      }
    });
  },

  explain: function () {
    //wx.navigateTo({
    //  url: '../exam/explain?subject=' + this.subjectId
    //})
    wx.showModal({
      content: '即将开放',
      showCancel: false
    })
  },

  onShareAppMessage: function (e) {
    var d = app.shareData(e);
    d.title = this.fullName;
    return d;
  }
});