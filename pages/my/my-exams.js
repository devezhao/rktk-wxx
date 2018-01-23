const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
    listData: []
  },
  pageNo: 1,

  onLoad: function (e) {
    var that = this;
    app.getUserInfo(function () {
      that.list();
    })
  },

  list: function () {
    var that = this;
    zutils.get(app, 'api/exam/exam-list?page=' + this.pageNo, function (res) {
      var _data = res.data.data || [];;
      var _listData = that.data.listData;
      if (that.pageNo == 1) _listData = [];
      if (_data && _data.length > 0) _listData = _listData.concat(_data);
      else that.pageNo = -1;

      that.setData({
        listData: _listData,
        nodata: _listData.length == 0
      });

    });
  },

  onReachBottom: function (e) {
    if (this.pageNo == -1) return;
    this.pageNo++;
    this.list();
  }
});