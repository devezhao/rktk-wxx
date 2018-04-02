const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  onLoad: function (e) {
    if (e.bgcolor) {
      wx.setNavigationBarColor({
        frontColor: (e.bgcolor == 'fff' || e.bgcolor == 'ffffff') ? '#000000' : '#ffffff',
        backgroundColor: '#' + e.bgcolor
      })
    }

    let url = decodeURIComponent(e.url);
    if (url.substr(0, 4) != 'http') url = zutils.baseUrl + url;

    let that = this;
    wx.getSystemInfo({
      success: function (res) {
        let ua = JSON.stringify(res);
        url += ((url.indexOf('?') > -1 ? '&' : '?') + '_ua=' + encodeURIComponent(ua));
        console.log('H5 加载: ' + url);
        that.setData({ url: url });
      },
    })
  },

  h5Message: function (e) {
    console.log('On H5 Message - ' + JSON.stringify(e));
  },

  onShareAppMessage: function (e) {
    let h5Url = e.webViewUrl || this.data.url;
    let h5Url_s = h5Url.split('?');
    let h5Url_s2 = h5Url_s[1].split('&');
    h5Url = h5Url_s[0] + '?';
    for (let i = 0; i < h5Url_s2.length; i++) {
      let p = h5Url_s2[i];
      if (p.substr(0, 2) == 'u=' || p.substr(0, 5) == 'user=' || p.substr(0, 4) == '_ua=') {
        // 去除当前用户参数
      } else {
        h5Url += p + '&';
      }
    }
    return app.warpShareData('/pages/index/h5?url=' + encodeURIComponent(h5Url));
  }
})