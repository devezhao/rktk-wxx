const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
  },
  pageNo: 1,

  onLoad: function (e) {
    this.list();
  },

  list: function () {
    var that = this;
    zutils.get(app, 'api/fav/incorrect-list?page=' + this.pageNo, function (res) {
      var data = res.data.data;
      that.setData({
        in_list: data,
        nodata: that.pageNo == 1 && data.length == 0
      });
    });
  }
});