//const baseUrl = 'https://rktk.qidapp.com/';
const baseUrl = 'http://192.168.0.159:8080/rktk/';

function __url_wrap(app, url) {
  if (app && app.GLOBAL_DATA && app.GLOBAL_DATA.USER_INFO) {
    if (url.indexOf('?') == -1) url += '?';
    else url += '&';
    url += 'wxxuid=' + app.GLOBAL_DATA.USER_INFO.uid
  }
  return url;
}

// GET 方法
function z_get(app, url, call) {
  var loading_timer;
  var loading_show = false;
  if (url.indexOf('noloading') == -1) {
    loading_timer = setTimeout(function () {
      console.log('showLoading')
      wx.showLoading({
        title: '请稍后'
      });
      loading_show = true;
    }, 300);
  }
  wx.request({
    url: baseUrl + __url_wrap(app, url),
    method: 'GET',
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
  })
}

// POST 方法
function z_post(app, url, data, call) {
  if (!call && data && typeof data == 'function') {
    call = data;
    data = null;
  }
  var req_timer;
  if (url.indexOf('noloading') == -1) {
    req_timer = setTimeout(function () {
      wx.showLoading({
        title: '请稍后'
      });
    }, 200);
  }
  wx.request({
    url: baseUrl + __url_wrap(app, url),
    method: 'POST',
    data: data,
    success: call || function (res) { },
    fail: function (res) {
      console.error('请求失败<POST:' + url + '> - ' + JSON.stringify(res || []));
    }, complete: function () {
      if (req_timer) clearTimeout(req_timer)
      if (url.indexOf('noloading') == -1) wx.hideLoading();
    }
  })
}

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
  }
}

// API
module.exports = {
  get: z_get,
  post: z_post,
  baseUrl: baseUrl,
  array: z_array
};