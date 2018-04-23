const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
  },

  onLoad: function (e) {
    let that = this;
    zutils.get(app, 'api/share/gen-texts', function (res) {
      that.setData(res.data.data)
    });

    // wx.showShareMenu({
    //   withShareTicket: true
    // });
  },

  ccopy: function (e) {
    let ccdata = this.data.text;
    wx.setClipboardData({
      data: ccdata,
      success: function () {
        wx.showToast({
          title: '已复制'
        })
      }
    })
  },

  csave: function (e) {
    if (this.__inProgress && this.__inProgress == true) return;
    this.__inProgress = true;
    wx.showLoading({ title: '请稍后' });

    let that = this;
    zutils.get(app, 'api/acts/aqrcode?noloading', function (res) {
      if (res.data.data) {
        wx.downloadFile({
          url: res.data.data,
          success: function (res) {
            that.__inProgress = false;
            wx.hideLoading();
            that.__saveImageToPhotosAlbum(res.tempFilePath)
          }
        })
      }
    });
  },

  // 保存图片至相册
  __saveImageToPhotosAlbum: function (path) {
    let that = this;
    wx.saveImageToPhotosAlbum({
      filePath: path,
      success: function (res) {
        wx.showToast({
          title: '已保存到相册'
        })
      }, fail: function (res) {
        if (res.errMsg && res.errMsg.indexOf('fail auth deny') > -1) {
          wx.showModal({
            title: '提示',
            content: '请允许小程序保存图片到相册',
            success: function (res) {
              if (res.confirm) {
                wx.openSetting({
                  success: function (res) {
                    console.log(JSON.stringify(res));
                    that.__saveImageToPhotosAlbum(path);
                  }
                });
              }
            }
          });
        }
      }
    })
  },

  inviteList: function () {
    wx.navigateTo({
      url: '../my/coin-records?type=invite'
    })
  },

  onShareAppMessage: function () {
    let d = app.warpShareData();
    d.imageUrl = 'https://c.rktk.qidapp.com/a/wxx/share-img.png?v2';
    return d;
  }
})