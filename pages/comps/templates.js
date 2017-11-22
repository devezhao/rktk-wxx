const app = app || getApp();
const zutils = require('../../utils/zutils.js');

var sharebox = {
  share_CopyLink: function () {
    wx.setClipboardData({
      data: '123',
      success: function () {
        wx.showToast({
          title: '链接已复制',
        })
      }
    })
  },

  share_QQ: function () {
    zutils.get(app, 'api/share/token-gen?id=', function(){
    });
  },

  share_Frined: function () {
    // open-type="share"
  },

  share_Close: function(){
  },

  share_Open: function(){
  }
};

export default sharebox;