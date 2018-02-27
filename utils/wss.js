const zutils = require('zutils.js');

var WSS = {

  wsUrl: null,
  reconnectTimes: 0,

  init: function (url, handle) {
    let wsUrl = zutils.baseUrl.replace('https:', 'wss:');
    if (zutils.baseUrl.substr(0, 5) == 'http:') wsUrl = zutils.baseUrl.replace('http:', 'ws:');
    WSS.wsUrl = wsUrl + url;

    WSS.__connect();
    wx.onSocketOpen(function (res) {
      console.log('连接已建立 ... ' + JSON.stringify(res));
      WSS.__connectReady = true;
    });
    wx.onSocketError(function (res) {
      console.log('onSocketError - ' + JSON.stringify(res))
      WSS.__connectReady = false;
      WSS.__connect();
    });
    wx.onSocketClose(function (res) {
      console.log('连接已断开 ... ' + JSON.stringify(res))
      WSS.__connectReady = false;
      if (res.code != 1000) {
        WSS.__connect();
      }
    });
    wx.onSocketMessage(function (res) {
      console.log('收到消息 ... ' + JSON.stringify(res))
      let _data = JSON.parse(res.data);
      handle(_data);
    });
  },

  __connect: function () {
    WSS.__reconnect++;
    if (WSS.__reconnect > 3 && WSS.__reconnect % 12 == 0) {
      wx.showToast({
        icon: 'none',
        title: '当前网络不稳定'
      })
    };

    wx.connectSocket({
      url: WSS.wsUrl,
      header: {
        'content-type': 'application/json'
      }
    });
  },

  send: function (action, data) {
    if (!WSS.__connectReady || WSS.__connectReady == false) {
      console.warn('连接未就绪');
      return;
    }

    let json = { action: action, data: data || '' };
    json = JSON.stringify(json);
    wx.sendSocketMessage({
      data: json,
      complete: function (res) {
        console.log('sendSocketMessage - ' + json + ' >> ' + JSON.stringify(res));
      }
    })
  },

  close: function (reason) {
    if (WSS.__connectReady == true) {
      WSS.__connectReady = false;
      wx.closeSocket({
        reason: reason || ''
      });
    }
  }
};

// API
module.exports = {
  init: WSS.init,
  send: WSS.send,
  close: WSS.close
};