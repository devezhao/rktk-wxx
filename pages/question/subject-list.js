const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
  },

  onLoad: function () {
    var that = this;
    app.getUserInfo(function () {
      that.listSubject();
    });
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
      console.log(res);
      if (res.data.error_code > 0) {
        wx.redirectTo({
          url: 'subject-choice?source=first'
        });
        return;
      }

      var data = res.data.data;
      wx.setNavigationBarTitle({
        title: data.subject
      });
      that.setData(data);
    });
  },

  onShareAppMessage: function (e) {
    return app.shareData(e);
  }
});