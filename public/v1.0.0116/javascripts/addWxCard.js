$(function () {
  var $addWxCardPack = $('#addWxCardPack');
  var cardList = []
  $addWxCardPack.unbind('click').click(function () {
    cardList = [];
    var $this = $(this);
    if ($this.hasClass('background-gray')) return;
    $this.addClass('background-gray');
    var packObj = $this.data('pack');
    var checkNo = $this.data('checkdata');
    var checkNoArray = checkNo.split(',');

    if (packObj) return initWx(packObj);

    for (var n = 0; n < checkNoArray.length; n++) {
      if (checkNoArray[n] && checkNoArray[n].indexOf('null') !== -1) {
        $.alert('暂未获取到核销二维码，请稍后重试');
        return;
      }
    }

    // /payPlat/getCardId
    $.ajax({
      url: '/payPlat/getCardId?checkNo=' + checkNo,
      type: 'GET',
      dataType: 'json',
      beforeSend: function (xhr) {
        $.showLoading();
      },
      complete: function (xhr, status) {
        $.hideLoading();
      },
      success: function (data) {
        console.log(data)
        if (data && data.status === 200) {
          initWx(data.data);
        } else {
          $.alert(data.message);
        }
      },
      error: function (err) {
        console.log(err)
      }
    })
  })

  // 绑定域名
  function initWx(packObj) {
    var code = [],
      cardId = [];
    for (var i = 0, les = packObj.length; i < les; i++) {
      if (packObj[i].checkNo && packObj[i].card_id && packObj[i].checkNo !== 'null') {
        code.push(packObj[i].checkNo);
        cardId.push(packObj[i].card_id);
      }
      else {
        $.alert('正在处理中，请稍后重试...');
        $('#addWxCardPack').removeClass('background-gray');
        return false;
      }
    }


    $.ajax({
      url: '/group/wxCard',
      data: {
        url: location.href.split("#")[0],
        code: code.join(','),
        cardId: cardId.join(',')
      },
      type: 'GET',
      dataType: 'json',
      beforeSend: function (xhr) {
        $.showLoading();
      },
      complete: function (xhr, status) {
        $.hideLoading();
        $('#addWxCardPack').removeClass('background-gray');
      },
      success: function (data) {
        if (data.msg === "unload") {
          window.location.href = "/login?m_id=" + merchantInfoId;
          return false;
        }
        // addWxCardPackObj = data;

        for (var j = 0, lens = code.length; j < lens; j++) {
          var obj = {
            cardId: cardId[j],
            cardExt: '{"code":"' + code[j] + '","openid":"' + data.openid + '","timestamp":"' + data.timestamp + '","nonce_str":"' + data.nonceStr + '","signature":"' + data.cardSignature[j] + '"}'
          }
          cardList.push(obj)
        }

        wx.config({
          debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
          appId: data.appid, // 必填，公众号的唯一标识
          timestamp: data.timestamp, // 必填，生成签名的时间戳
          nonceStr: data.nonceStr, // 必填，生成签名的随机串
          signature: data.signature, // 必填，签名，见附录1
          jsApiList: ["addCard"] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
        });

        if (typeof wx !== 'undefined') {
          wx.ready(function () {
            wx.addCard({
              cardList: cardList, // 需要添加的卡券列表
              success: function (res) {
                console.log(res)
                // var cardList = res.cardList; // 添加的卡券列表信息
                // $.alert('添加成功')
              }
            });
          });
        }
      },
      error: function (err) {
        console.log(err)
      }
    })
  }
})