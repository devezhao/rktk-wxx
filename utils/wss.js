const zutils = require('zutils.js');

var WSS = {

  wsUrl: null,
  reconnectTimes: 0,

  init: function (url, handle) {
    // let wsUrl = zutils.baseUrl.replace('https:', 'wss:');
    // if (zutils.baseUrl.substr(0, 5) == 'http:') wsUrl = zutils.baseUrl.replace('http:', 'ws:');
    // wsUrl += url;
    WSS.wsUrl = 'ws://192.168.0.159:8080/rktk/' + url;

    WSS.__connect();
    wx.onSocketOpen(function (res) {
      console.log('WSS onSocketOpen - ' + JSON.stringify(res))
    });
    wx.onSocketError(function (res) {
      console.log('WSS onSocketError - ' + JSON.stringify(res))
      WSS.__connect();
    });
    wx.onSocketClose(function (res) {
      console.log('WSS onSocketClose - ' + JSON.stringify(res))
      if (res.code != 1000) {
        WSS.__connect();
      }
    });
    wx.onSocketMessage(function (res) {
      console.log('WSS onSocketMessage - ' + JSON.stringify(res))
      let _data = JSON.parse(res.data);
      handle(_data);
    });
  },

  __connect: function () {
    WSS.reconnectTimes++;
    if (WSS.reconnectTimes % 12 == 0) {
      wx.showToast({
        icon: 'none',
        title: '当前网络较差'
      })
    };

    wx.connectSocket({
      url: WSS.wsUrl,
      header: {
        'content-type': 'application/json'
      },
      complete: function (res) {
        console.log('WSS connectSocket - ' + JSON.stringify(res))
      }
    });
  },
};

// API
module.exports = {
  init: WSS.init
};