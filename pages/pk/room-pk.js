const app = app || getApp();
const zutils = require('../../utils/zutils.js');
const wss = require('../../utils/wss.js');

Page({
  data: {
  },
  roomId: null,

  onLoad: function (e) {
    this.roomId = e.id;
    if (!this.roomId) {
      // app.gotoPage('/pages/pk/start');
      // return;
    }

    let that = this;
    app.get(app, 'api/pk/room-info?room=' + this.roomId, function (res) {
      that.setData(res.data.data);
    });
  }
})