const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
  },
  examId: null,

  onLoad: function (e) {
    console.log(e);
    var that = this;
    this.examId = e.exam;
    this.loadResult();
  },

  loadResult: function () {
  }
});