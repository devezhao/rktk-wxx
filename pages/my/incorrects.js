const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
    listData: []
  },
  pageNo: 1,

  onLoad: function (e) {
    let that = this;
    app.getUserInfo(function () {
      that.list();
    })
  },

  list: function () {
    let that = this;
    zutils.get(app, 'api/fav/incorrect-list?page=' + this.pageNo, function (res) {
      let _data = res.data.data || [];;
      let _listData = that.data.listData;
      if (that.pageNo == 1) _listData = [];
      if (_data && _data.length > 0) _listData = _listData.concat(_data);
      else that.pageNo = -1;

      that.setData({
        listData: _listData,
        nodata: _listData.length == 0
      });
    });
  },

  moreAction: function (e) {
    let _id = e.currentTarget.dataset.qid;
    let that = this;
    wx.showActionSheet({
      itemList: ['忽略此题', '加入收藏'],
      success: function (res) {
        if (res.tapIndex == 1) {
          zutils.post(app, 'api/fav/toggle?force=1&question=' + _id, function (res) {
            wx.showToast({
              title: '已加入收藏'
            });
          });
        } else if (res.tapIndex == 0) {
          zutils.post(app, 'api/fav/incorrect-ignore?question=' + _id, function (res) {
            wx.showToast({
              title: '错题已忽略'
            });
            that.pageNo = 1;
            that.list();
          });
        }
      }
    });
  },

  onReachBottom: function (e) {
    if (this.pageNo == -1) return;
    this.pageNo++;
    this.list();
  },

  explainAll: function () {
    let subjectId = '110-000000000000FA01';
    app.reportKpi('EXPLAIN', subjectId);
    // wx.navigateTo({ url: '../exam/explain?interactive=1&id=' + subjectId });
    
    zutils.get(app, 'api/user/isvip', function (res) {
      let _data = res.data.data || res.data;
      if (_data.isVip == true) {
        wx.navigateTo({ url: '../exam/explain?interactive=1&id=' + subjectId });
      } else {
        wx.showModal({
          title: '提示',
          content: '本功能为VIP专享，开通VIP会员可立即使用',
          confirmText: '立即开通',
          success: function (res) {
            if (res.confirm) {
              app.gotoPage('/pages/my/vip-buy')
            }
          }
        });
      }
    });
  }
});