const baseUrl = 'https://rktk.qidapp.com/';
//const baseUrl = 'https://rktk.statuspage.cn/';
//const baseUrl = 'http://192.168.0.159:8080/rktk/';

// GET 方法
function z_get(app, url, call) {
  var loading_timer;
  var loading_show = false;
  if (url.indexOf('noloading') == -1) {
    loading_timer = setTimeout(function () {
      wx.showLoading({
        title: '请稍后'
      });
      loading_show = true;
    }, 200);
  }

  let wxxuid = null;
  if (app && app.GLOBAL_DATA && app.GLOBAL_DATA.USER_INFO) {
    wxxuid = app.GLOBAL_DATA.USER_INFO.uid
  }

  wx.request({
    url: baseUrl + url,
    method: 'GET',
    header: { wxxuid: wxxuid },
    success: call || function (res) { },
    fail: function (res) {
      if (res.errMsg && res.errMsg.indexOf('timeout') > -1) {
        wx.showToast({
          icon: 'none',
          title: '请求超时，请检查网络'
        })
      }
      console.error('请求失败<GET:' + url + '> - ' + JSON.stringify(res || []));
    }, complete: function () {
      if (loading_timer) {
        clearTimeout(loading_timer);
        loading_timer = null;
      }
      if (loading_show == true) wx.hideLoading();
    }
  });
};

// POST 方法
function z_post(app, url, data, call) {
  if (!call && data && typeof data == 'function') {
    call = data;
    data = null;
  }

  var loading_timer;
  var loading_show = false;
  if (url.indexOf('noloading') == -1) {
    loading_timer = setTimeout(function () {
      wx.showLoading({
        title: '请稍后'
      });
      loading_show = true;
    }, 200);
  }

  let wxxuid = null;
  if (app && app.GLOBAL_DATA && app.GLOBAL_DATA.USER_INFO) {
    wxxuid = app.GLOBAL_DATA.USER_INFO.uid
  }

  wx.request({
    url: baseUrl + url,
    method: 'POST',
    header: { wxxuid: wxxuid },
    data: data,
    success: call || function (res) { },
    fail: function (res) {
      if (res.errMsg && res.errMsg.indexOf('timeout') > -1) {
        wx.showToast({
          icon: 'none',
          title: '请求超时，请检查网络'
        })
      }
      console.error('请求失败<POST:' + url + '> - ' + JSON.stringify(res || []));
    }, complete: function () {
      if (loading_timer) {
        clearTimeout(loading_timer);
        loading_timer = null;
      }
      if (loading_show == true) wx.hideLoading();
    }
  });
};

// 数组相关
var z_array = {
  in: function (array, item) {
    var i = array.length;
    while (i--) {
      if (array[i] === item) {
        return true;
      }
    }
    return false;
  },
  erase: function (array, item) {
    for (var i = array.length; i--;) {
      if (array[i] === item) array.splice(i, 1);
    }
    return array;
  },
  inAndErase: function (array, item) {
    var isIn = this.in(array, item);
    if (isIn) this.erase(array, item);
    return isIn;
  }
};

// 对象扩展
var z_extends = function (dest, source) {
  for (var prop in source) {
    if (prop.substr(0, 1) == '_') {
      // No copy
    } else {
      dest[prop] = source[prop];
    }
  }
  for (var prop in dest) console.log(prop);
  return dest;
};

// 日期格式
var z_date_format = function (format, date) {
  date = date || new Date();
  var o = {
    "M+": date.getMonth() + 1,
    "d+": date.getDate(),
    "h+": date.getHours(),
    "m+": date.getMinutes(),
    "s+": date.getSeconds(),
    "q+": Math.floor((date.getMonth() + 3) / 3),
    "S": date.getMilliseconds()
  };
  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
  }
  for (var k in o) {
    if (new RegExp("(" + k + ")").test(format)) {
      format = format.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    }
  }
  return format;
}

// API
module.exports = {
  get: z_get,
  post: z_post,
  baseUrl: baseUrl,
  array: z_array,
  extends: z_extends,
  formatDate: z_date_format
};