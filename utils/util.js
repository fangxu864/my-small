function formatTime(date) {
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();

  var hour = date.getHours();
  var minute = date.getMinutes();
  var second = date.getSeconds();


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString();
  return n[1] ? n : '0' + n
}

/**
 * 混合
 * 
 * @param {any} to 
 * @param {any} from 
 * @returns 
 */
function mixin(to, from) {
  var toString = Object.prototype.toString;
  var isObject = function (obj) { return toString.call(obj) === "[object Object]" };
  var isArray = function (obj) { return toString.call(obj) === "[object Object]" };
  var isObjectOrArray = function (obj) { return (isObject(obj) || isArray(obj)) };
  var _mix = function (to, from) {
    if (!isObjectOrArray(to) || !isObjectOrArray(from)) return to;
    for (var i in from) {
      if (isObject(from[i])) {
        if (typeof to[i] === "undefined" || !isObject(to[i])) {
          to[i] = from[i];
        } else {
          _mix(to[i], from[i]);
        }
      } else if (isArray(from[i])) {
        for (var s = 0, len = from[i].length; s < len; s++) {
          _mix(to[i][s], from[i][s]);
        }
      } else {
        to[i] = from[i];
      }
    }
    return to;
  };
  return _mix(to, from);
}


module.exports = {
  formatTime: formatTime,
  mixin: mixin
};
