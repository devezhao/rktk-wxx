const baseUrl = 'https://rk.chinaruankao.com/';
//const baseUrl = 'http://192.168.0.159:8180/rktk/';
//const baseUrl = 'http://192.168.0.234:8080/rktk/';

// GET 方法
function z_get(app, url, call) {
  let loading_timer;
  let loading_show = false;
  if (url.indexOf('noloading') == -1) {
    loading_timer = setTimeout(function () {
      wx.showLoading({
        title: '请稍后'
      });
      loading_show = true;
    }, 600);
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
      if (res.errMsg) {
        wx.showToast({
          icon: 'none',
          duration: 5000,
          title: (res.errMsg.indexOf('timeout') > -1 ? '请求超时' : '请求失败') + '，请检查你的网络'
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

  let loading_timer;
  let loading_show = false;
  if (url.indexOf('noloading') == -1) {
    loading_timer = setTimeout(function () {
      wx.showLoading({
        title: '请稍后'
      });
      loading_show = true;
    }, 400);
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
    let i = array.length;
    while (i--) {
      if (array[i] === item) {
        return true;
      }
    }
    return false;
  },
  erase: function (array, item) {
    for (let i = array.length; i--;) {
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
  for (let prop in source) {
    if (prop.substr(0, 1) == '_') {
      // No copy
    } else {
      dest[prop] = source[prop];
    }
  }
  for (let prop in dest) console.log(prop);
  return dest;
};

// 日期格式
var z_date_format = function (format, date) {
  date = date || new Date();
  let o = {
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
  for (let k in o) {
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