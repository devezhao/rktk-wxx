const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
    headimgUrl: '../../images/nohead2.png',
    nick: '访客',
    subjectList: ['系统架构设计师', '信息系统项目管理师', '网络工程师' ],
    subject: 0
  },

  onLoad: function (e) {
    
    var that = this;

    app.getUserInfo(function(res){
      console.log(res);
      that.setData({
        headimgUrl: res.headimgUrl,
        nick: res.nick
      });
    })

  },

  changeSubject: function(e){
    console.log(e);
  }
});