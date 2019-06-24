// 分享组件
const app = app || getApp();
const zutils = require('../../utils/zutils.js');
var z_sharebox = {
  data: {
    shareboxHide: true,
    dialogHide: true,
    typeTokenText: 'Token'
  },

  shareboxOpen: function (page) {
    if (!this.shareboxAnimation) {
      this.shareboxAnimation = wx.createAnimation({
        duration: 160,
        timingFunction: 'ease',
        delay: 50
      });
    }

    this.data.shareboxHide = false;
    this.shareboxAnimation.translateY(0).step();
    this.data.shareboxAnimation = this.shareboxAnimation.export();
    page.setData({
      shareboxData: this.data
    });
  },

  shareboxClose: function (page) {
    this.data.shareboxHide = true;
    this.shareboxAnimation.translateY('100%').step({ duration: 100 });
    this.data.shareboxAnimation = this.shareboxAnimation.export();
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
    // this.shareboxClose(page);
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
        data: text,
        success: function () {
          wx.hideToast()
          that.shareboxClose(page);
        }
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
          wx.hideToast()
          wx.showToast({
            icon: 'none',
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