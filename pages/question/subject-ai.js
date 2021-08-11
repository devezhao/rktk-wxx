const app = app || getApp()
const zutils = require('../../utils/zutils.js')
import {
  zsharebox
} from '../comps/z-sharebox.js'

Page({
  data: {
    shareboxData: zsharebox.data
  },
  subjectId: null,

  onLoad: function (e) {
    this.subjectId = e.id
    app.getUserInfo((u) => {
      this.__onLoad(e)
    })

    this.setData({
      isFullScreen: app.GLOBAL_DATA.IS_FULLSCREEN
    })
  },

  __onLoad: function (e) {
    zutils.get(app, 'api/subject-ai/details?id=' + this.subjectId, (res) => {
      let _data = res.data
      if (_data.error_code > 0) {
        if (_data.error_msg.indexOf('未设置') > -1) {
          wx.navigateTo({
            url: 'subject-choice?source=first'
          })
        } else {
          app.alert(_data.error_msg, function () {
            app.gotoPage('/pages/index/index')
          })
        }
        return
      }

      this.setData(_data.data)
      wx.setNavigationBarTitle({
        title: _data.data.subject_name
      })
    })
  },

  toExam: function (e) {
    if (this.data.vip_free == false && this.data.coin == -2) {
      app.gotoVipBuy('本题库为VIP专享，开通VIP会员可免费答题')
      return
    }

    let that = this
    wx.showActionSheet({
      itemList: ['答10题', '答20题', '答30题'],
      success: function (res) {
        let tapIndex = res.tapIndex
        let num = tapIndex == 0 ? 10 : (tapIndex == 2 ? 30 : 20)
        let tips_content = '将进入答题页面，请做好准备'
        wx.showModal({
          title: '提示',
          content: tips_content,
          confirmText: '开始答题',
          success: function (res) {
            if (res.confirm) {
              zutils.post(app, 'api/subject-ai/gen?quote=' + that.subjectId + '&num=' + num + '&formId=' + (e.detail.formId || ''), function (res) {
                let _data = res.data;
                if (_data.error_code == 0) {
                  that.__toExam(_data.data, null);
                } else {
                  that.__examErrorMsg(_data.error_msg);
                }
              })
            }
          }
        })
      }
    })
  },

  __toExam: function (subject) {
    let that = this;
    zutils.post(app, 'api/exam/start?subject=' + subject, function (res) {
      let _data = res.data
      if (_data.error_code == 0) {
        wx.redirectTo({
          url: '../exam/exam?subject=' + subject + '&exam=' + _data.data.exam_id
        });
      } else {
        that.__examErrorMsg(_data.error_msg)
      }
    })
  },

  __examErrorMsg: function (error_msg) {
    error_msg = error_msg || '系统繁忙，请稍后重试'
    if (error_msg.indexOf('会员') > -1) {
      wx.showModal({
        title: '提示',
        content: error_msg,
        confirmText: '立即开通',
        success: function (res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/my/vip-buy'
            })
          }
        }
      })
    } else {
      app.alert(error_msg)
    }
  },

  toExplain: function (e) {
    zutils.post(app, 'api/user/report-formid?formId=' + (e.detail.formId || ''))
    app.alert('本题库暂不支持解析')
  },

  onShareAppMessage: function () {
    let d = app.warpShareData('/pages/question/subject-ai?id=' + this.subjectId)
    if (this.fullName) d.title = this.fullName
    return d
  },

  shareboxOpen: function () {
    zsharebox.shareboxOpen(this)
  },
  shareboxClose: function () {
    zsharebox.shareboxClose(this)
  },
  dialogOpen: function () {
    zsharebox.dialogOpen(this)
  },
  dialogClose: function () {
    zsharebox.dialogClose(this)
  },
  share2Frined: function () {
    zsharebox.share2Frined(this)
  },
  share2QQ: function () {
    zsharebox.share2QQ(this)
  },
  share2CopyLink: function () {
    zsharebox.share2CopyLink(this)
  }
})