const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
    examAutoNext: false,
    tipsSubjectUpdate: true,
    tipsStudy: true,
  },

  onLoad: function (options) {
    let that = this;
    let keys = ['examAutoNext', 'tipsSubjectUpdate', 'tipsStudy'];
    zutils.post(app, 'api/user/settings?key=' + keys.join(','), function (res) {
      let _data = res.data.data;
      if (_data.examAutoNext != null) {
        that.setData({ examAutoNext: _data.examAutoNext == 'true' });
      }
      if (_data.tipsSubjectUpdate != null) {
        that.setData({ tipsSubjectUpdate: _data.tipsSubjectUpdate == 'true' });
      }
      if (_data.tipsStudy != null) {
        that.setData({ tipsStudy: _data.tipsStudy == 'true' });
      }
    });

    wx.getStorageInfo({
      success: function (res) {
        that.setData({
          cacheSize: res.currentSize + 'KB'
        })
      },
    });
  },

  setting: function (e) {
    let key = e.currentTarget.dataset.id;
    let chk = e.detail.value;
    zutils.post(app, 'api/user/settings?key=' + key + '&value=' + chk, function (res) {
      console.log(key + ' > ' + chk + ' > ' + JSON.stringify(res.data));
    });
  },

  cleanCache: function () {
    wx.showModal({
      content: '确认清空缓存？',
      success: function (res) {
        if (res.confirm) {
          wx.clearStorage();
          wx.showToast({
            title: '缓存已清空'
          });
        }
      }
    })
  }
})