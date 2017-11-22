const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {},

  onLoad: function () {
    console.log('Index onLoad');
    var that = this;
    app.getUserInfo(function () {
      zutils.get(app, 'api/home/recent-exams', function (res) {
        that.setData(res.data.data);
      });
    });

    zutils.get(app, 'api/home/banners', function (res) {
      that.setData({
        banners: res.data.data
      })
    });
  },

  onShow: function () {
    if (zutils.array.in(app.GLOBAL_DATA.RELOAD_EXAM, 'Index')) {
      zutils.array.erase(app.GLOBAL_DATA.RELOAD_EXAM, 'Index');
      var that = this;
      zutils.get(app, 'api/home/recent-exams', function (res) {
        that.setData(res.data.data);
      });
    }
  },

  todayExam: function () {
    var that = this;
    zutils.post(app, 'api/exam/today-exam', function (res) {
      if (res.data.error_code == 0) {
        var data = res.data.data;
        wx.redirectTo({
          url: '../exam/exam?subject=' + data.subject_id + '&exam=' + data.exam_id
        });
      } else {
        var error_msg = res.data.error_msg || '系统错误';
        if (error_msg.indexOf('考试类型') > -1 || error_msg.indexOf('尚未选择') > -1) {
          wx.navigateTo({
            url: '../question/subject-choice?back=1'
          });
        } else {
          wx.showModal({
            content: error_msg,
            showCancel: false
          });
        }
      }
    });
  },

  signin: function () {
    zutils.post(app, 'api/home/signin?noloading', function (res) {
      if (res.data.error_code == 0) {
        app.GLOBAL_DATA.RELOAD_COIN = ['Home'];
        wx.showToast({
          title: '签到成功',
          icon: 'success',
          duration: 2000
        });
      } else {
        wx.showModal({
          title: '提示',
          content: res.data.error_msg || '系统错误',
          showCancel: false
        })
      }
    });
  },

  onShareAppMessage: function () {
    return app.getBaseShareData();
  }
})