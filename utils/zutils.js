const baseUrl = 'https://rktk.qidapp.com/';
//const baseUrl = 'http://192.168.0.159:8080/rktk/';

function __url_wrap(app, url) {
  // if (app && app.GLOBAL_DATA && app.GLOBAL_DATA.USER_INFO) {
  //   if (url.indexOf('?') == -1) url += '?';
  //   else url += '&';
  //   url += 'wxxuid=' + app.GLOBAL_DATA.USER_INFO.uid
  // }
  return url;
};

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
    url: baseUrl + __url_wrap(app, url),
    method: 'GET',
    header: { wxxuid: wxxuid },
    success: call || function (res) { },
    fail: function (res) {
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
    url: baseUrl + __url_wrap(app, url),
    method: 'POST',
    header: { wxxuid: wxxuid },
    data: data,
    success: call || function (res) { },
    fail: function (res) {
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

var z_tipsbar = function (o, tips) {
  o.setData({
    tips: tips || '提示',
    tipsbarHide: false
  });
  setTimeout(function () {
    o.setData({
      tipsbarHide: true
    });
  }, 3000);
};

// API
module.exports = {
  get: z_get,
  post: z_post,
  baseUrl: baseUrl,
  array: z_array,
  extends: z_extends,
  tipsbar: z_tipsbar
};