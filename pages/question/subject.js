const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
  },

  onLoad: function () {
    var that = this;
    app.getUserInfo(function () {
      that.listSubject();
    })
  },

  onShow: function () {
    if (zutils.array.in(app.GLOBAL_DATA.RELOAD_SUBJECT, 'Subject')) {
      zutils.array.erase(app.GLOBAL_DATA.RELOAD_SUBJECT, 'Subject');
      this.listSubject();
    }
  },

  listSubject: function () {
    var that = this;
    zutils.post(app, 'api/subject/list', function (res) {
      var data = res.data.data;
      that.setData({
        subjectList: data.result_list,
        mainSubject: data.main_name
      });
    });
  },

  onShareAppMessage: function (e) {
    return app.shareData(e);
  }
});