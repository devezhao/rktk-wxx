// 分享组件
const app = app || getApp();
const zutils = require('../../utils/zutils.js');
var z_sharebox = {
  data: {
    shareboxHide: true,
    dialogHide: true,
    typeName: '考题',
    typeTokenText: 'Token'
  },

  shareboxOpen: function (page) {
    this.data.shareboxHide = false;
    page.setData({
      shareboxData: this.data
    })
  },

  shareboxClose: function (page) {
    this.data.shareboxHide = true;
    page.setData({
      shareboxData: this.data
    })
  },

  dialogOpen: function (page) {
    this.data.dialogHide = false;
    page.setData({
      shareboxData: this.data
    });
  },

  dialogClose: function (page) {
    this.data.dialogHide = true;
    page.setData({
      shareboxData: this.data
    })
  },

  share2Frined: function (page) {
    this.shareboxClose(page);
  },

  share2QQ: function (page) {
    var that = this;
    zutils.get(app, 'api/share/token-gen?id=' + (page.subjectId || page.questionId), function (res) {
      var text = res.data.data;
      that.data.shareboxHide = true;
      that.data.dialogHide = false;
      that.data.typeTokenText = text;
      page.setData({
        shareboxData: that.data
      });
      wx.setClipboardData({
        data: text
      });
      app.GLOBAL_DATA.KT_TOKENS.push(text);
    });
  },

  share2CopyLink: function (page) {
    var that = this;
    zutils.get(app, 'api/share/short-url?id=' + (page.subjectId || page.questionId), function (res) {
      var text = res.data.data;
      wx.setClipboardData({
        data: text,
        success: function () {
          that.shareboxClose(page);
          wx.showToast({
            title: '链接已复制'
          });
        }
      });
    });
  }
};

module.exports = {
  zsharebox: z_sharebox
};