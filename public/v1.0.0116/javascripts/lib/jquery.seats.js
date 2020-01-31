(function ($) {
  $.fn.seats = function (method) {
    // 如果第一个参数是字符串, 就查找是否存在该方法, 找到就调用; 如果是object对象, 就调用init方法;.
    if (methods[method]) {
      // 如果存在该方法就调用该方法
      // apply 是吧 obj.method(arg1, arg2, arg3) 转换成 method(obj, [arg1, arg2, arg3]) 的过程.
      // Array.prototype.slice.call(arguments, 1) 是把方法的参数转换成数组.
      return methods[method].apply(
        this,
        Array.prototype.slice.call(arguments, 1)
      );
    } else if (typeof method === "object" || !method) {
      // 如果传进来的参数是"{...}", 就认为是初始化操作.
      return methods.init.apply(this, arguments);
    } else {
      $.error("Method " + method + " does not exist on jQuery.seats");
    }
  };

  // 不把方法扩展在 $.fn.seats 上. 在闭包内建个"methods"来保存方法, 类似共有方法.
  var methods = {
    /**
     * 初始化方法
     * @param _options
     * @return {*}
     */
    init: function (_options) {
      return this.each(function () {
        var $this = $(this);
        var opts = $.extend({}, $.fn.seats.defaults, _options);
        private_methods.init($this, opts);
      });
    },
    unselect: function (id) {
      private_methods.unselect(id);
    }
  };

  // 私有方法
  var private_methods = {
    opts: "",
    downx: "",
    downy: "",
    _move: true,
    _x: "",
    _y: "",
    init: function (obj, opts) {
      var _this = this;
      this.opts = opts;
      obj.html("").append(_this.seatsPanel(opts.sessionAreaInfo));
      $(opts.line).html(_this.seatLine(opts.sessionAreaInfo));

      var itemMove = false, startx, starty, endx, endy;
      $('#seatPanel').find('span.clicked')
        .on('touchstart', function (e) {
          startx = e.originalEvent.changedTouches[0].clientX;
          starty = e.originalEvent.changedTouches[0].clientY;
          itemMove = false;
        })
        .on('touchmove', function () {
          itemMove = true;
        })
        .on('touchend', function (e) {
          endx = e.originalEvent.changedTouches[0].clientX;
          endy = e.originalEvent.changedTouches[0].clientY;
          if (!itemMove || Math.abs(startx - endx) < 12 && Math.abs(starty - endy) < 12) {
            $(this).trigger('eventClick');
          }
        })
    },
    seatsPanel: function (data) {
      var _this = this;
      return $("<div>", { id: "seatMove" })
        .addClass("seat-move")
        .append(this.seatsGrid(data));
    },
    seatsGrid: function (data) {
      var touchEvents = {
        touchstart: "touchstart",
        touchmove: "touchmove",
        touchend: "touchend",

        /**
         * @desc:判断是否pc设备，若是pc，需要更改touch事件为鼠标事件，否则默认触摸事件
         */
        initTouchEvents: function () {
          if (isPC()) {
            this.touchstart = "mousedown";
            this.touchmove = "mousemove";
            this.touchend = "mouseup";
          }
        }
      };
      //var startTime = new Date();
      //var endTime = new Date();
      var table = $("<table>")
        .addClass("seat-table")
        .bind(touchEvents.touchstart, function (e) {
          //$("svg.clicked").bind(touchEvents.touchstart)
          //startTime = new Date();
          _this._move = true;
          // _this._x=e.pageX-parseInt($(this).css("left"));
          _this._x = e.originalEvent.changedTouches[0].pageX - parseInt($(this).css("left"));
          // _this._y=e.pageY-parseInt($(this).css("top"));
          _this._y = e.originalEvent.changedTouches[0].pageY - parseInt($(this).css("top"));
          this.setCapture && this.setCapture();
          _this.downx = e.originalEvent.changedTouches[0].clientX;
          _this.downy = e.originalEvent.changedTouches[0].clientY;
          $('#seatPanel').bind(touchEvents.touchmove, function (e) {
            if (_this._move) {
              // var x=e.pageX-_this._x;//移动时根据鼠标位置计算控件左上角的绝对位置
              var x = e.originalEvent.changedTouches[0].pageX - _this._x; //移动时根据鼠标位置计算控件左上角的绝对位置
              // var y=e.pageY-_this._y;
              var y = e.originalEvent.changedTouches[0].pageY - _this._y;
              $("#seatMove").find("table").css({ top: y, left: x }); //控件新位置
              $("#side").css({ top: y + 27 }); //控件新位置
            }
          });
          return false;
        })
        .bind(touchEvents.touchend, function (e) {
          //endTime = new Date();
          _this._move = false;
          var upx = e.originalEvent.changedTouches[0].clientX;
          var upy = e.originalEvent.changedTouches[0].clientY;
          $("#seatMove").find("table")[0].releaseCapture && $("#seatMove").find("table")[0].releaseCapture();
          //if((endTime - startTime) < 150){
          //}
        }),
        tableArray = [],
        _this = this;
      for (var i = 0; i < +data.rowCounts; i++) {
        var tr = $("<tr>");
        for (var j = 0; j < +data.colCounts; j++) {
          var td = $("<td>").append(_this.seatSvg(i, j, data));
          tr.append(td);
        }
        tableArray.push(tr);
      }
      table.append(tableArray);
      return table;
    },
    seatLine: function (data) {
      var line = "";
      for (var i = 0; i < +data.rowCounts; i++) {
        line += "<li>" + (i + 1) + "</li>";
      }
      return line;
    },
    seatSvg: function (row, col, data) {
      var svg = "",
        _this = this,
        seatdata = data.sessionAreaSeatStatusList.sessionAreaSeatStatus;
      $.each(seatdata, function (i) {
        if (+seatdata[i].sRow == row && +seatdata[i].sCol == col) {
          switch (parseInt(seatdata[i].seatStatus)) {
            case 1:
              var selected = _this.opts.selected,
                flag = true;
              if (selected.length > 0) {
                $.each(selected, function (j) {
                  if (selected[j].fid == seatdata[i].fid) {
                    flag = false;
                    return false;
                  }
                });
                if (flag) {
                  svg = $(
                    '<span class="seats clicked" id="seat_' + seatdata[i].fid + '_' + seatdata[i].sRow + '_'+seatdata[i].sCol+'"></span>'
                  ).bind('eventClick', function () {
                    if (seatsInfo && seatsInfo.tickets && seatsInfo.tickets.length > 0) {
                      this.className = "seats clicked selected";
                      _this.opts.handle(
                        seatdata[i],
                        data.areaName,
                        data.areaCode
                      );
                    }

                  });
                } else {
                  svg = $('<span class="seats clicked selected" id="seat_' +  seatdata[i].fid + '_' + seatdata[i].sRow + '_'+seatdata[i].sCol + '"></span>');
                }
              } else {
                svg = $('<span class="seats clicked" id="seat_' +  seatdata[i].fid + '_' + seatdata[i].sRow + '_'+seatdata[i].sCol + '"></span>').bind(
                  'eventClick',
                  function () {
                    if (seatsInfo && seatsInfo.tickets && seatsInfo.tickets.length > 0) {
                      this.className = "seats clicked selected";
                      _this.opts.handle(
                        seatdata[i],
                        data.areaName,
                        data.areaCode
                      );
                    }
                  }
                );
              }
              break;
            // case 1:
            //     svg=$('<svg class="seats sold"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-seat"></use><svg class="icon-selected"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-selected" ></use></svg></svg>');
            //     break;
            case 0:
              svg =
                '<span class="seats sold" id = "seat_' +
                seatdata[i].fid + '_' + seatdata[i].sRow + '_'+seatdata[i].sCol +
                '" ></span>';
              break;
          }
        }
      });
      return svg;
    },
    unselect: function (id) {
      $("#seat_" + id)[0].className = "seats clicked";
    },
    myclick: function () {
      alert(1);
    }
  };

  // 默认参数
  $.fn.seats.defaults = {
    url: "",
    selected: [],
    line: "",
    handle: function (row, col, id) { }
  };
})(jQuery);
