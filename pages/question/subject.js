const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
  },

  onLoad: function () {
    var that = this;
    that.listSubject();
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

  onShareAppMessage: function () {
    return { title: '八分钟约会源于犹太人的传统习俗，年轻的单身男女在互不了解的情况下进行八分钟的交谈', path: '/pages/index/index' };
  }
});