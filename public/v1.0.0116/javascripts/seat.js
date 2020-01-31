var selectedSeat = [];
var ticketNums = [];
var ticketType = null;
var selectedSeats = null; // siwper Dom

$(function () {
  // DOM
  var $selectedSeats = $("#selectedSeats"),
    $seatTicketList = $("#seatTicketList"),
    $seatTicketSelect = $("#seatTicketSelect"),
    $seats = $("#seats");
  $detailOrder = $("#detail-order");
  if ($seatTicketSelect.find(".tickets-list-item").size()) {
    var filterArray = seatsInfo.tickets.filter(function(item){
      return item.isAutoTicket === 'T'
    })
    ticketType = filterArray[0] 
  }

  // 已选座位展示
  var windowWidth = ($(window) || $(this)).width();
  var showNumber = (windowWidth / 640) * 5; // 四舍五入
  selectedSeats = new Swiper($selectedSeats, {
    slidesPerView: showNumber,
    spaceBetween: 10,
    pagination: {
      el: ".swiper-pagination",
      clickable: true
    }
  });

  $seats.seats({
    sessionAreaInfo: seatsInfo && seatsInfo.showResponseDto ? seatsInfo.showResponseDto.sessionAreaInfo : [],
    selected: selectedSeat,
    line: "#side ol",
    handle: function (seatsData, areaname, areacode) {
      if (!ticketType) return;
      selectSeat(seatsData, areaname, areacode);
      calTotal();
    }
  });

  // $seatTicketSelect.click(function () {
  //   var $this = $(this).parent(".detail-header-ticket-select");
  //   $this.hasClass("show") ? $this.removeClass("show") : $this.addClass("show");
  // });

  // 切换票型
  // $seatTicketList.find(".ticket-select-list-item").unbind("click").click(function () {
  //   var $this = $(this),
  //     thisText = $this.text(),
  //     ticketItem = $this.data("item");
  //   ticketType = ticketItem;
  //   $seatTicketSelect
  //     .find(".ticket-select-name")
  //     .addClass("active")
  //     .text(thisText);

  //   $seatTicketSelect
  //     .parent(".detail-header-ticket-select")
  //     .removeClass("show");
  // });


  var windowWidth = ($(window) || $(this)).width();
  var showNumber = Math.max( 2.2 , Math.round(windowWidth/640*3)); // 四舍五入
  var ticketsListSlide = new Swiper($seatTicketSelect, {
      slidesPerView: showNumber,
      spaceBetween: 10,
      pagination: {
          el: '.swiper-pagination',
          clickable: true,
      },
  });
  $seatTicketSelect.find('.tickets-list-item').on('tap',function(){
    var $this = $(this);
    $this.siblings().removeClass('active');
    $this.addClass('active');
    ticketType = $this.data('item');
    console.log(ticketType)
  })

  $selectedSeats.find("span.close-btn").live("click", function () {
    var $curItem = $(this).parents(".ticket-item");
    var id = $curItem.attr("id"),
      ticketId = $curItem.data("ticketid"),
      spliceNum = -1;
    for (var i = 0, les = selectedSeat.length; i < les; i++) {
      var _fid = selectedSeat[i].fid + '_' + selectedSeat[i].sRow + '_' + selectedSeat[i].sCol 
      if (_fid === id) {
        spliceNum = i;
        break;
      }
    }
    for (var j = 0, lengths = ticketNums.length; j < lengths; j++) {
      if (ticketNums[j].ttId === ticketId) {
        ticketNums[j].amount--;
        if (!ticketNums[j].amount) {
          ticketNums.splice(j, 1);
        }
        break;
      }
    }

    selectedSeat.splice(spliceNum, 1);
    selectedSeats.removeSlide(spliceNum);
    $seats.seats("unselect", id);
    calTotal();
  });

  //提交选座
  $detailOrder.click(function () {
    if (!$(this).hasClass("disabled-btn")) {
      var seatsList = $('#seatMove').find('tr');
      var isRightSeats = true,isNotALong = true;
      seatsList.each(function(){
        var $this = $(this);
        var $selectedSeats = $this.find('.selected');
        // var $soldSeats = $this.find('.sold');
        var $seats = $this.find('.seats')
        var seatsInfo = [];
        // var soldIds = [];
        if ($selectedSeats.size() < 2) return;

        $seats.each(function(){
          var itemSeats = {}
          var $this = $(this)
          var thisid = $this.attr('id')
          var thisInfoArray = thisid.split('_')
          
          itemSeats.id = thisid
          itemSeats.fid = thisInfoArray[1]
          itemSeats.rol = +thisInfoArray[2]
          itemSeats.col = +thisInfoArray[3]
          itemSeats.classStr = $this.attr('class')  
          seatsInfo.push(itemSeats)

        })
        var n = 0,open = false;
        for (var t=1;t<seatsInfo.length - 1;t++) {
          var curPoint = seatsInfo[t];
          if (curPoint.classStr === 'seats clicked selected') {
            if( open ) {
              if ( n === 1) {
                isRightSeats = false;
                break;
              } else if (n>0) {
                open = false;
                n=0;
              }  
            } else {
              open = true;
            }
              
          }
          if (open === true && curPoint.classStr === 'seats clicked') {
            n++
          };

          if (curPoint.classStr === 'seats clicked selected' && t !== 0 && t !== seatsInfo.length) {
            if (curPoint.classStr === 'seats sold') continue;
            var nextPoint = seatsInfo[t + 1];
            var prevPoint = seatsInfo[t - 1];
            if ((prevPoint.classStr === 'seats clicked' && nextPoint.classStr === 'seats clicked')) {
              isNotALong = false
              break
            }
          }

        }
        if (!isRightSeats || !isNotALong) return;
      }) 

      if (!isRightSeats) {
        $.alert('座位中间不要留空');
        return;
      }
      if (!isNotALong) {
        $.alert('座位旁边不要留空')
        return;
      } 

      var lockStcokData = null;
      var amounts = $("#num").text(),
        price = $("#totalPrice").text();
      lockStcokData = {
        ttlist: JSON.stringify(ticketNums),
        seats: JSON.stringify(selectedSeat),
        amounts: amounts,
        price: price
      };

      $.ajax({
        url: "/theater/lockStock?m_id=" + merchantInfoId,
        type: "POST",
        data: lockStcokData,
        beforeSend: function (xhr) {
          $.showLoading();
        },
        complete: function (xhr, status) {
          $.hideLoading();
        },
        success: function (body) {
          console.log(body);
          if (body.status === 200) {
            window.location.href = "/order/theater/" + merchantInfoId + "?m_id=" + merchantInfoId;
          }
          else if (body.status === 400) {
            $.alert({
              text: body.message,
              onOK: function () {
                window.location.href = '/login?m_id=' + merchantInfoId
              }
            })
          }
          else {
            $.alert({
              text: body.message,
            });
          }
        }
      });

    }
  });

  //显隐选中框
  (function () {
    var old_h = $(".select-seat").outerHeight(true);
    $(".select-seat .icon-arr-t").click(function () {
      var parent = $(this).parent();
      var select_list_h = parent.outerHeight(true);
      var foot_h = $(".total").outerHeight(true);
      var ul_h = $(this).next("ul").outerHeight(true);
      var toggle = $(this).data("toggle");
      if (toggle && toggle === "up") {
        parent.animate({ bottom: old_h - foot_h - 2 }, 200);
        $(this).data("toggle", "down");
        $(this).next("ul").height("auto");
      } else {
        parent.animate({ bottom: - select_list_h + foot_h }, 200);
        $(this).data("toggle", "up");
        $(this).next("ul").height(ul_h);
      }
    });

  })();

  //座位图高度
  (function () {
    var header = $(".header");
    var ticketPanel = $(".ticket-panel");
    var total = $(".total");
    var stage_head = $(".stage-tit");
    var wh = $(window).height();
    var wrapper = $(".wrapper");
    var detailHeader = $('.detail-header');
    var dHeight = detailHeader.outerHeight(true);
    wrapper.css('top', dHeight + 'px');
    var seatPanel = $(".seat-panel");
    var mH = wh - header.outerHeight(true) - ticketPanel.outerHeight(true) - total.outerHeight(true);
    // wrapper.height(mH);
    seatPanel.height(mH - stage_head.outerHeight(true));
  })();

  function selectSeat(seatsData, areaname, areacode) {
    var index = isinobj(seatsData, selectedSeat);
    if (index === -1) {
      var seatObj = $.extend(true, seatsData, {
        ticketType: ticketType.name,
        ticketId: ticketType.id,
        price: ticketType.price,
        status: seatsData.initSeatStatus,
        areaName: areaname,
        areaCode: areacode,
        isRetreat:ticketType.isRetreat
      })
      selectedSeats.appendSlide(selectedHtml([seatObj]));
      selectedSeat.push(seatObj); // 前插数组
      seatObj = null;
      if (ticketNums.length) {
        var hasTickets = false;
        $.each(ticketNums, function (j) {
          if (ticketNums[j].ttId === ticketType.id) {
            ticketNums[j].amount++;
            hasTickets = true;
            console.log(ticketNums[j]);
          }
        });
      }
      if (!hasTickets)
        ticketNums.push({ ttId: ticketType.id, name: ticketType.name, isNeedIdCard: ticketType.isNeedIdCard, amount: 1,isRetreat: ticketType.isRetreat });

      console.log(selectedSeat);
      console.log(ticketNums);
    } 
    else {
      selectedSeats.removeSlide(index);
      for (var n = 0; n < ticketNums.length; n++) {
        if (ticketNums[n].ttId === selectedSeat[index].ticketId) {
          ticketNums[n].amount--;
          if (!ticketNums[n].amount) {
            ticketNums.splice(n, 1);
          }
          break;
        }
      }
      selectedSeat.splice(index, 1);
      console.log(selectedSeat)
      $seats.seats("unselect", seatsData.fid +'_' + seatsData.sRow + '_'+ seatsData.sCol);
    }
  }
});

function selectedHtml(seatobj) {
  var html = "";
  $.each(seatobj, function (i) {
    var snCol = seatobj[i].seatName.length > 6 ? seatobj[i].seatName.substring(0, 4) + '...' : seatobj[i].seatName;
    html +=
      '<div class="swiper-slide ticket-item" id='
      +seatobj[i].fid + '_' + seatobj[i].sRow + '_'+seatobj[i].sCol +
      ' data-ticketid=' + seatobj[i].ticketId +
      ">" +
      '<div class="ticket-item-inner">' +
      "  <div>" +
      '    <p class="ticket-name">' +
      seatobj[i].snRow +
      "排" +
      snCol +
      "座</p>" +
      '    <div class="ticket-price">' +
      "      <div>" +
      seatobj[i].price +
      "元</div>" +
      "    </div>" +
      '    <i class="ticket-icon" />' +
      '    <span class="close-btn xx-icon icon-guanbi1" />' +
      "  </div>" +
      "</div></div>";
  });
  return html;
}
function isinobj(item, array) {
  // var minAbs = 3;  // 初始值设置为大于2就可以了 

  for (var i = 0, les = array.length; i < les; i++) {
    // var thisAbs = Math.abs((+array[i].sCol) - (+item.sCol));
    if (array[i].fid == item.fid) {
      return i;
    }
    // else if (array[i].sRow === item.sRow && thisAbs < minAbs) {
    //     minAbs = thisAbs;
    // }
  }
  return  -1; // -1 为选中座位，-2 为隔空座位
}
//计算数量和总价
function calTotal() {
  var price = 0;
  var lis = $("#selectedSeats").find(".ticket-item");
  var num = lis.length;

  lis.each(function () {
    var li_price = parseFloat(
      $(this).find(".ticket-price").find("div").text()
    );
    price = operation.accAdd(li_price, price);
  });
  console.log(lis.length);
  console.log(price);
  //控制提交按钮点击状态
  if (num > 0) {
    $("#detail-order").removeClass("disabled-btn");
  } else {
    $("#detail-order").addClass("disabled-btn");
  }
  $("#totalPrice").text(price);
  $("#num").text(num);
}
