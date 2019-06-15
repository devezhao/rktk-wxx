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
        console.log(JSON.stringify(res));
        that.setData({ cacheSize: res.currentSize + 'KB' })
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
    let that = this;
    this.__showModal('确认清空本地缓存？', () => {
      wx.clearStorage();

      app.GLOBAL_DATA.FOLLOW_SUBJECT = [];
      app.GLOBAL_DATA.USER_INFO = null;
      // 缓存清空重登录
      app.getUserInfo(function (u) {
        that.setData({ cacheSize: '0KB' })
        app.getUserInfoForce(true)
      });
      // 刷新用户首页
      app.GLOBAL_DATA.RELOAD_VIP = ['Home'];
    })
  },

  cleanExam() {
    let that = this;
    this.__showModal('重置后你的答题纪录/错题/收藏等数据将被清空。确认吗？', () => {
      zutils.post(app, 'api/user/clean-datas', (res) => {
        if (res.data.error_code == 0) {
          app.GLOBAL_DATA.RELOAD_EXAM = ['Index'];
          app.GLOBAL_DATA.RELOAD_SUBJECT = ['Home', 'Subject', 'Index'];
          app.GLOBAL_DATA.FOLLOW_SUBJECT = []
          wx.removeStorage({
            key: 'FOLLOW_SUBJECT'
          })
          
          wx.showToast({
            title: '重置成功',
            icon: 'success'
          })
        }
      })
    })
  },

  __showModal(msg, call) {
    let that = this;
    wx.showModal({
      title: '提示',
      content: msg,
      success: function (res) {
        if (res.confirm) {
          call()
        }
      }
    })
  }
})