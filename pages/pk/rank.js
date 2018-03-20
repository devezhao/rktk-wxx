const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
  },

  onLoad: function (e) {
    let that = this;
    app.getUserInfo(function (u) {
      zutils.get(app, 'api/pkrank/rank-list?top=100', function (res) {
        that.setData({
          rankList: res.data
        })
      });
    });
  },

  onShareAppMessage: function (e) {
    var d = app.warpShareData('/pages/pk/start');
    d.title = '快来参加软考PK赛';
    return d;
  }
});