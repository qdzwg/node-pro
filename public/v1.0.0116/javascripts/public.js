$(function () {
	// 响应式布局
	var winWidth = $(window).width();
	$("html").css("fontSize", (winWidth / 640) * 40 + "px");

	// 不知道什么鬼
	if ($('#details-tab').size() > 0) {
		tab("details-tab");
	}

    //获取推广code存入cookie，后台处理
    var spread_code= GetQueryString('spread_code');
    if(spread_code){
        document.cookie="promote_code="+ spread_code+ ';path=/';
    }
	// 轮播
	if ($('#rec_slider').size() > 0) {
		$('#rec_slider').flexslider({
			animation: 'slide',
			controlNav: true,
			directionNav: true,
			animationLoop: true,
			useCSS: false,
			slideshow: true,
			slideshowSpeed: 3500
		});
	}
	if ($('#tab').size() > 0) {
		tabs.init("tab");
	}
	if ($('.number').size() > 0) {
		if ($("#route-list").length > 0) {
			var totalp = 0;
			$(".route-price").each(function () {
				var price = $(this).find("strong").text();
				totalp = operation.accAdd(totalprice, price);
			});
			$("#totalprice").text(totalp);
			$('input[name=totalPrice]').val(totalp);
		} else {
			totalprice(1);
		}
		$(".number").numSpinner({
			min: 1,
			max: $(".number").data("max"),
			onChange: function (evl, value) {
				if ($("#route-list").length > 0) {
					routetotalprice();
				} else {
					totalprice(value);
				}
			}
		});
	}
	$("#mask").height($(document).height());
	$(".tips-wrapper").css("min-height", $(window).height());

	// pop tips
	$('.tips a').on('click', function () {
		$('.mask,.tips').hide();
		if ($(".tips").data("reload")) {
			window.location.reload();
		}
	});

	// var _hmt = _hmt || [];
	// (function () {
	// 	var hm = document.createElement("script");
	// 	hm.src = "https://hm.baidu.com/hm.js?7c770bf53ba5139839ca96c69f3bc0f0";
	// 	var s = document.getElementsByTagName("script")[0];
	// 	s.parentNode.insertBefore(hm, s);
	// })();
	

	//访问统计
	// $.get('/main/saveVisitRecord?m_id=' + merchantInfoId);

	//登录全员操作
	$('#becomeSales').click(function () {
		var $this = $(this);
		var isQy = $this.data('isqy');
        checkUserPromoter(function (data) {
            if(data){
                //判断是否为全员推广员
                if( data.binded ){
                    //是-往全员跳转
                    window.location.href = '/member/salesPromotion?m_id=' + merchantInfoId + '&isQy=' + isQy;
                }else{
                    //否-判断是否允许注册||绑定全员
                    getCorpConfig();
                }
            }
        });
	});


    var $marketingClose=$('.mkt-close');
    if($marketingClose.length){
        var $becomePromoter= $('#becomePromoter');
        $becomePromoter.on('tap',function () {
            ///请求成为推广员
            $.post('/createUserAuth',function (data,status,xhr) {
                // console.log(data);
                // debugger;
                if(status==='success' ){
                    if(data[0].status===200){
                        window.location.href = '/member/salesPromotion?m_id=' + merchantInfoId ;
                    }else if(data[0].status===400){
                        window.location.href = '/login/?m_id=' + merchantInfoId + '&redir=' + location.href;
                    }else{
                        Msg.open(data[0].message||'出错了')
                    }
                }else{
                    Msg.open(data[0].message||'出错了')
                }
            })
        });

        $marketingClose.on('tap',function () {
            $('.marketing-com,.marketing-mask').hide();
        })
    }


	if (showNewUserSpecialOffer === "true") newPreferential();

	//自定义首页跳转到中控平台
	if ($('.gotoPublic').length > 0) {
		$('.gotoPublic').click(function () {
			$.get('/gotoPublic?m_id=' + merchantInfoId)
				.success(function (data) {
					if (data[0].status == 200 && data[0].data.guide) {
						$.get('/realgotoPublic?merchantId=' + merchantInfoId)
							.success(function (datas) {
								if (datas[0].status == 200) {
									// window.location.href = '//pubswap.zhiyoubao.com/publicMap/index/?acc='+datas[0].message;
									window.location.href = 'http://pubswap.zhiyoubao.com/publicMap/index/?acc=' + datas[0].message;
								} else {
									alert(datas[0].message);
								}
							})
					} else {
						alert('你还没有购买此服务或者你购买的此服务已过期');
					}
				})
		})
	}
	//跳转公园年卡判断服务是否过期
	if ($('.gotoyearcard').length > 0) {
		$('.gotoyearcard').click(function () {
			$.get('/gotoyearcard?m_id=' + merchantInfoId)
				.success(function (data) {
					if (data[0].status == 200 && data[0].data.gynk == true) {
						window.location.href = '/list/yearcard?m_id=' + merchantInfoId
					} else {
						alert('你还没有购买此服务或者你购买的此服务已过期');
					}
				})
		})
	}   

	//跳转剧院判断服务是否过期
	if($('.gototheater').length>0){
		$('.gototheater').click(function(){
			$.get('/gototheater?m_id=' + merchantInfoId)
				.success(function(data){
					if (data[0].status == 200&&data[0].data.theater == true) {
						window.location.href = '/list/theater?m_id='+merchantInfoId
					}else{
						alert('你还没有购买此服务或者你购买的此服务已过期');
					}
				})
		})
	}   
});


var tabs = {
	init: function (divid) {
		$("#" + divid).find("a").click(function (e) {
			var itmeId = $(this).attr("href");
			if (itmeId.substr(0, 1) == "#") {
				e.preventDefault();
			}
			$(itmeId).addClass('active').siblings().removeClass("active");
			$(this).parent().addClass('active').siblings().removeClass("active");
		});
	}
};

var Msg = {
	open: function (masg) {
		$('body').append(
			$('<div>', {
				class: 'auto-hide-msg',
				id: 'autoHideMsg',
				html: masg || '注意检查信息'
			})
		).ready(function () {
			console.log(this)
			console.log($('#autoHideMsg'))
			var $autoHideMsg = $('#autoHideMsg');
			var w = $autoHideMsg.width();
			$autoHideMsg.css('left', '50%');
			$autoHideMsg.css('marginLeft', - ((w / 2) + 10) + 'px');
			$autoHideMsg.fadeIn(500);

		})
		setTimeout(function () {
			$('#autoHideMsg').fadeOut(500).remove();
		}, 2000);
	}
}


/**
 *计算购买支付价格
 * @param {*购买数量} num 
 * @param {*优惠券满减限制} fullCat 
 * @param {*优惠券类型} couponType
 * @param {*优惠券券值} couponValue
 */
function totalprice(num) {
	var price = $("#price").text();
	var payPrice = $('#payPrice');
	var couponInfo = $('#couponInfo');
	var cutPrice = (+couponInfo.data('cut'));

	var _totalPrice = '',
		_handledPrice = '';

	if (!!num) {
		_totalPrice = parseFloat(operation.accMul(price, num).toFixed(2));
		$("#totalprice").text(_totalPrice);
	} else {
		_totalPrice = parseFloat($('#totalprice').text()).toFixed(2);
	};
	$('#cost-dialog .cost-dialog-explian strong').text(_totalPrice);
	if (!!cutPrice) {
		_handledPrice = (_totalPrice - cutPrice).toFixed(2);
		payPrice.html(_handledPrice);
		$('input[name=totalPrice]').val(_handledPrice);
		return 1; //优惠券有效处理了价格
	} else {
		$('input[name=totalPrice]').val(_totalPrice);
		payPrice.html('');
		return 0; //没有用优惠券处理价格
	}
}

function routetotalprice() {
	var totalprice = 0;
	$(".number").each(function () {
		var val = $(this).val();
		var price = $(this).parent().next().find("strong").text();
		totalprice = operation.accAdd(totalprice, operation.accMul(val, price));
	});
	$("#totalprice").text(totalprice);
	$('input[name=totalPrice]').val(totalprice);
}

//四则运算
var operation = {
	accMul: function (arg1, arg2) {
		var m = 0,
			s1 = arg1.toString(),
			s2 = arg2.toString();
		try {
			m += s1.split(".")[1].length
		} catch (e) { }
		try {
			m += s2.split(".")[1].length
		} catch (e) { }
		return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
	},
	accDiv: function (arg1, arg2) {
		var t1 = 0,
			t2 = 0,
			r1, r2;
		try {
			t1 = arg1.toString().split(".")[1].length
		} catch (e) { }
		try {
			t2 = arg2.toString().split(".")[1].length
		} catch (e) { }
		with (Math) {
			r1 = Number(arg1.toString().replace(".", ""));
			r2 = Number(arg2.toString().replace(".", ""));
			return (r1 / r2) * pow(10, t2 - t1);
		}
	},
	accAdd: function (arg1, arg2) {
		var r1, r2, m, c;
		try {
			r1 = arg1.toString().split(".")[1].length;
		}
		catch (e) {
			r1 = 0;
		}
		try {
			r2 = arg2.toString().split(".")[1].length;
		}
		catch (e) {
			r2 = 0;
		}
		c = Math.abs(r1 - r2);
		m = Math.pow(10, Math.max(r1, r2));
		if (c > 0) {
			var cm = Math.pow(10, c);
			if (r1 > r2) {
				arg1 = Number(arg1.toString().replace(".", ""));
				arg2 = Number(arg2.toString().replace(".", "")) * cm;
			} else {
				arg1 = Number(arg1.toString().replace(".", "")) * cm;
				arg2 = Number(arg2.toString().replace(".", ""));
			}
		} else {
			arg1 = Number(arg1.toString().replace(".", ""));
			arg2 = Number(arg2.toString().replace(".", ""));
		}
		return (arg1 + arg2) / m;
	},
	accSub: function (arg1, arg2) {
		var r1, r2, m, n;
		try {
			r1 = arg1.toString().split(".")[1].length;
		} catch (e) {
			r1 = 0;
		}
		try {
			r2 = arg2.toString().split(".")[1].length;
		} catch (e) {
			r2 = 0;
		}
		m = Math.pow(10, Math.max(r1, r2));
		//last modify by deeka
		//动态控制精度长度
		n = (r1 >= r2) ? r1 : r2;
		return ((arg2 * m - arg1 * m) / m).toFixed(n);
	}

};

function tab(id) {
	var touchObj = $("#" + id).find("a");
	$("#tab-panel").find(".details-tab-item:eq(0)").css("height", "auto");
	touch.on(touchObj, 'tap', function () {
		var index = $(this).parent().index(),
			divid = $(this).data("div");
		touchObj.removeClass("active");
		$(this).addClass("active");
		$("#tab-panel").css("margin-left", -(Math.round(index * 10000) / 100).toFixed(2) + '%').find(".details-tab-item").removeAttr("style");
		$("#" + divid).css("height", "auto");
	});
}

//  业务类型
function getModule(module) {
	var title = "";
	switch (module) {
		case "ticket":
			title = "景区";
			break;
		case "hotel":
			title = "酒店";
			break;
		case "route":
			title = "跟团游";
			break;
		case "line":
			title = "自由行";
			break;
		case "cate":
			title = "餐饮";
			break;
		case "goods":
			title = "商品";
			break;
		case "raiders":
			title = "攻略";
			break;
		case "guide":
			title = "导游";
			break;
	}
	return title;
}

// 业务类型图标
function getIcon(m) {
	switch (m) {
		case 'park':
			return '<span class="order-info"><i class="xx-icon icon-iconfont-menpiao"></i>' +
				'<em>景区';
			break;
		case 'hotel':
			return '<span class="order-info"><i class="xx-icon icon-iconfont-jiudian"></i>' +
				'<em>酒店';
			break;
		case 'combo':
			return '<span class="order-info"><i class="xx-icon icon-iconfont-ziyouxing"></i>' +
				'<em>自由行';
			break;
		case 'mdse':
			return '<span class="order-info"><i class="xx-icon icon-tec"></i>' +
				'<em>商品';
			break;
		case 'eatery':
			return '<span class="order-info"><i class="xx-icon icon-meis"></i>' +
				'<em>餐饮';
			break;
		case 'amuse':
			return '<span class="order-info"><i class="xx-icon icon-iconfont-amuse"></i>' +
				'<em>娱乐';
			break;
		case 'traffic':
			return '<span class="order-info"><i class="xx-icon icon-jiaotonggongjiaochekanfangtuandabamianxing"></i>' +
				'<em>小交通';
			break;
		case 'route':
			return '<span class="order-info"><i class="xx-icon icon-genty"></i>' +
				'<em>跟团游';
			break;
		case 'theater_ticket':
			return '<span class="order-info"><i class="xx-icon icon-genty"></i>' +
				'<em>演出';
			break;
		case 'guide':
			return '<span class="order-info"><i class="xx-icon icon-genty"></i>' +
				'<em>导游';
			break;
		case 'pms_hotel':
			return '<span class="order-info"><i class="xx-icon icon-iconfont-jiudian"></i>' +
				'<em>云PMS酒店';
			break;
		case 'family':
			return '<span class="order-info order-info-family"><img src="'+lbaseUrl+'/images/common/icon-family.png">' +
			'<em>套票';
			break;
		case 'cloud_repast':
			return '<span class="order-info"><i class="xx-icon icon-meis"></i>' +
				'<em>云餐饮';
			break;
		default:
			return '<span class="order-info"><i class="xx-icon icon-iconfont-menpiao"></i><em>';
			break;
	}
}

//  导游等级
function guideLevel(level) {
	switch (level) {
		case '铜牌':
			return '<i class="icon-guide-level3"></i>';
			break;
		case '银牌':
			return '<i class="icon-guide-level2"></i>';
			break;
		case '金牌':
			return '<i class="icon-guide-level"></i>';
			break;
	}
}

// 检测终端,map.js中使用
function ispc() {
	var flag = true;
	var system = {
		win: false,
		mac: false,
		xll: false,
		ipad: false
	};
	//检测平台
	var p = navigator.platform;
	system.win = p.indexOf("Win") == 0;
	system.mac = p.indexOf("Mac") == 0;
	system.x11 = (p == "X11") || (p.indexOf("Linux") == 0);
	system.ipad = (navigator.userAgent.match(/iPad/i) != null) ? true : false;
	//跳转语句，如果是手机访问就自动跳转到wap.baidu.com页面
	if (system.win || system.mac || system.xll || system.ipad) {
		flag = true;
	} else {
		flag = false;
	}
	return flag;
}

// 判断是否为ios
function isIos() {
	var u = navigator.userAgent, app = navigator.appVersion;
	var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
	return isIOS;
}

//  床型
function isBed(bed) {
	switch (bed) {
		case 0:
			return '大床';
			break;
		case 1:
			return '大床';
			break;
		case 2:
			return '大床';
			break;
	}
}

//  早餐
function isBreakfast(Breakfast) {
	switch (Breakfast) {
		case 0:
			return '单早';
			break;
		case 1:
			return '单早';
			break;
		case 2:
			return '单早';
			break;
	}
}

// 检测终端
function ispc() {
	var flag = true;
	var system = {
		win: false,
		mac: false,
		xll: false,
		ipad: false
	};
	//检测平台
	var p = navigator.platform;
	system.win = p.indexOf("Win") == 0;
	system.mac = p.indexOf("Mac") == 0;
	system.x11 = (p == "X11") || (p.indexOf("Linux") == 0);
	system.ipad = navigator.userAgent.match(/iPad/i) != null;
	//跳转语句，如果是手机访问就自动跳转到wap.baidu.com页面
	if (system.win || system.mac || system.xll || system.ipad) {
		flag = true;
	} else {
		flag = false;
	}
	return flag;
}

//  跳转错误页面
function error() {
	window.location.href = '/error';
}
/**
 * 取localStorage
 * 
 * @param {any} key 
 * @returns 
 */
function getItem(key) {
	var value;
	try {
		value = localStorage.getItem(key)
	} catch (ex) {
		console.error('localStorage.getItem报错, ', ex.message)
	} finally {
		return value
	}
}
/**
 * 储存localStorage
 * 
 * @param {any} key 
 * @param {any} value 
 */
function setItem(key, value) {
	try {
		localStorage.setItem(key, value)
	} catch (ex) {
		console.error('localStorage.setItem报错, ', ex.message)
	}
}
// 订单状态
function orderStatus(s, m) {
	s = typeof s === 'string' ? parseInt(s) : s;
	switch (s) {
		case 0:
			return '待支付';
			break;
		case 1:
			return m === 'goods' ? '待发货' : '待消费';
			break;
		case 2:
			return '待收货';
			break;
		case 3:
			return '待消费';
			break;
		case 4:
			return '已完成';
			break;
		case 5:
			return '已关闭';
			break;
		case 6:
			return '退款中';
			break;
		case 7:
			return '已退款';
			break;
		case 8:
			return '订单异常';
			break;
		case 9:
			return '订单待确认';
			break;
		// 云PMS状态新增	
		case 10:
			return '部分入住';
			break;
		case 11:
			return '部分退房';
			break;
		case 12:
			return '已取消';
			break;
		case 13:
			return 'Noshow';
			break;
		case 14:
			return '预订成功';
			break;
		case 15:
			return '已拒绝';
			break;
		case 16:
			return '全部入住';
			break;
		case 17:
			return '待接单';
			break;
		case 18:
			return '已接单';
			break;
		case 19:
			return '已拒接';
			break;
		case 20:
			return '退款中';
			break;
		case 22:
			return '交易成功';
			break;
		case 23:
			return '交易失败';
			break;
		case 24:
			return '服务中';
			break;
		default:
			return '';
			break;
	}
}
// 支付状态
function payStatus(s, m) {
	s = typeof s === 'string' ? parseInt(s) : s;
	switch (s) {
		case 0:
			return '待支付';
			break;
		case 1:
			return '已支付';
			break;
		case 2:
			return '支付过期';
			break;
		case 4:
			return '待支付';
			break;
		case 5:
			return '支付关闭';
			break;
		case 8:
			return '订单异常';
			break;
		case 9:
			return '订单待确认';
			break;
		default:
			return '';
			break;
	}
}

/**
 * 去除日历数据中的时间，保留日期
 * @param date (eg:2017-10-17 12:05:05)
 */
function dealTimeDate(date) {
	var dateArray = date.split(' ');
	return dateArray[0];
}

/**
 * 订单使用状态
 * @param t
 * @returns {*}
 */
function useStatus(t) {
	switch (t) {
		case '0':
			return '未使用';
			break;
		case '1':
			return '使用中';
			break;
		case '2':
			return '已使用';
			break;
		default:
			break;

	}
}

// New user special offer
function newPreferential() {
	$.get('/member/newPreferential?m_id=' + merchantInfoId)
		.success(function (body) {
			if (body && body.status === 200 && body.data && body.data.total > 0) {
				var conponsList = body.data.rows, codes = [];
				var templateHtml = '<div id="newUserSpecialOfferWin"><div style="position: fixed;z-index: 99;top: 0;right: 0;left: 0;bottom: 0;background: rgba(0, 0, 0, 0.6)"></div><div class="exclusive">'
					+ '<div class="exclusive-warp" >'
					+ '	<div class="exclusive-warp-title">新用户专享</div>'
					+ '	<div class="exclusive-warp-list">';

				for (var i = 0; i < body.data.total; i++) {
					var item = conponsList[i];
					codes.push(item.code);
					templateHtml += '<div class="exclusive-coupons-item">'
						+ '	<div class="exclusive-coupons-item-info">'
						+ '		<div class="exclusive-coupons-info-value">'
						+ '			<span class="unit">￥</span>'
						+ '			<span class="value">' + item.amount + '</span>'
						+ '		</div>'
						+ '		<p class="exclusive-coupons-info-conditions">' + (item.useThreshold === 'T' ? ('满' + item.targetAmout + '元可用') : '任意金额可用') + '</p>'
						+ '	</div>'
						+ '	<div class="exclusive-coupons-item-desc">'
						+ '		<div class="exclusive-coupons-content">'
						+ '			<p class="exclusive-coupons-content-title">' + item.name + '</p>'
						+ '			<p class="exclusive-coupons-content-ableTime">'

					switch (item.validityDateType) {
						case 'fixed':
							templateHtml += '有效期：' + item.validStartDate + ' 至 ' + item.validEndDate;
							break;
						case 'relative':
							templateHtml += '有效期：领取当日起 ' + item.relativeDay + '天后失效';
							break;
						default:
							break;
					}

					var moduleName = {
						'park': 'ticket',
						'hotel': 'hotel',
						'mdse': 'shop',
						'route': 'route',
						'repast': 'repast',
						'eatery': 'repast'
					}
					var href = '';
					switch (item.applyType) {
						case 'used':
							var productInfos = item.productInfos;
							if (productInfos && productInfos.length > 0) {
								if (productInfos.length > 1) {
									href = '/?m_id=' + merchantInfoId;
								} else {
									if (typeof productInfos[0].productId !== 'undefined')
										href = '/detail/' + moduleName[productInfos[0].type] + '/' + productInfos[0].productId + '/' + productInfos[0].productCode + '/?m_id=' + merchantInfoId;

								}
							}
							break;
						case 'type':
							item.useProductType.indexOf(',') !== -1
								? href = '/?m_id=' + merchantInfoId
								: href = '/list/' + moduleName[item.useProductType] + '/?m_id=' + merchantInfoId;
							break;
						case 'all':
							href = '/?m_id=' + merchantInfoId;
							break;
						default:
							href = '/?m_id=' + merchantInfoId;
							break;
					}

					templateHtml += '</p></div></div>'
						+ '	<div class="exclusive-coupons-item-btn">'
						+ '		<a href=' + href + ' class="exclusive-coupons-use">立即使用</a>'
						+ '	</div></div>';
				}

				templateHtml += '</div><div class="exclusive-warp-btns" id="exclusiveWarpBtns">'
					+ '<span class="exclusive-btn exclusive-btn-get" id="getCouponsNow">立即领取</span>'
					+ '<span class="exclusive-btn exclusive-btn-giveUp" id="closeNUSOWin">不需要</span>'
					+ '</div>'
					+ '<div class="exclusive-warp-result" id="exclusiveWarpResult">'
					+ '	<p class="exclusive-coupons-success-one">领取成功，快去使用吧</p>'
					+ '	<p class="exclusive-coupons-success-two">领取后请至个人中心-我的优惠券查看</p>'
					+ '	<i class="xx-icon icon-cha"></i>'
					+ '</div></div></div></div>';

				$('body').append(templateHtml);
				codes = codes.join(',');
				if ($('#newUserSpecialOfferWin').size()) {
					bindSpecialOfferTap(codes)
				} else {
					setTimeout(function () {
						bindSpecialOfferTap(codes)
					}, 500);
				}
			}
		})
		.error(function (err) {
			console.log(err)
		})
}


function bindSpecialOfferTap(codes) {
	var $getCouponsNow = $('#getCouponsNow')
		, $closeNUSOWin = $('#closeNUSOWin')
		, $newUserSpecialOfferWin = $('#newUserSpecialOfferWin')
		, $exclusiveCoupons = $('.exclusive-coupons-item')
		, $exclusiveWarpResult = $('#exclusiveWarpResult')
		, $exclusiveWarpBtns = $('#exclusiveWarpBtns')
		;

	// 一键领取
	$getCouponsNow.unbind('click').click(function () {
		$.ajax({
			url: '/member/getNewUserCoupons?codes=' + codes,
			type: 'GET',
			beforeSend: function (xhr) {
				$.showLoading();
			},
			complete: function (xhr, status) {
				$.hideLoading();
			},
			success: function (body) {
				if (body.status === 200) {
					$exclusiveCoupons.addClass('has');
					$exclusiveWarpBtns.hide();
					$exclusiveWarpResult.show();
				}
				else {
					$.alert({
						text: body.message,
						onOK: function () {
							$newUserSpecialOfferWin.remove();
						}
					})
				}
			}
		})
	})

	// 不需要
	$closeNUSOWin.unbind('click').click(function () {
		$newUserSpecialOfferWin.remove();
	})

	$exclusiveWarpResult.find(".icon-cha").unbind('click').click(function () {
		$newUserSpecialOfferWin.remove();
	});
}

function replacePhone(num) {
	return num.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

function replaceCertNo(cardNumber) {
	return cardNumber.replace(/^(.{6})(?:\d+)(.{4})$/, "$1****$2");
}


function replaceName(name) {
	return name.length > 2 ? name.replace(/^(.).+(.)$/g, "$1*$2") : name.replace(/^(.)(.)$/g, "$1*");
}

function countDown(times, nowTimes, dom, style) {
	style = style || 1;
	console.log('获取时间：', times);
	console.log('本地时间：', nowTimes);
	times = ((Math.abs(times - nowTimes)) / 1000) + 50; //+50为延时时间
	var timer = null;
	timer = setInterval(function () {
		var day = 0,
			hour = 0,
			minute = 0,
			second = 0; //时间默认值
		if (times > 0) {
			day = Math.floor(times / (60 * 60 * 24));
			hour = Math.floor(times / (60 * 60)) - (day * 24);
			minute = Math.floor(times / 60) - (day * 24 * 60) - (hour * 60);
			second = Math.floor(times) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
		}
		if (day <= 9) day = '0' + day;
		if (hour <= 9) hour = '0' + hour;
		if (minute <= 9) minute = '0' + minute;
		if (second <= 9) second = '0' + second;
		//
		var html1 = "<span class='timeStyle1'><i>" + day + "</i>天<i>" + hour + "</i>时<i>" + minute + "</i>分<i>" + second + "</i>秒" + "</span>";
		var html2 = day === '00'
			? hour + ":" + minute + ":" + second
			: day + "天" + hour + ":" + minute + ":" + second;
		var html = '';
		switch (style) {
			case 1:
				html = html1;
				break;
			case 2:
				html = html2;
				break;
		}
		$(dom).html(html);
		times--;
		if (times <= 0) {
			clearInterval(timer);
			window.location.reload();
		}
	}, 1000);
}

function replaceStr(str) {
	return str.replace(/{/g, "[").replace(/}/g, "]").replace(/'/g, "")
}

/**
 * 如果没有企业码就不启动分销
 */
if (marketDisAccount) {
	(function () {
		var hm = document.createElement("script");
		hm.id = "statis-qyyx";
		hm.src = qyyxUrl + "/static/h-ui/js/pro.js?" + marketDisAccount;
		var s = document.getElementsByTagName("script")[0];
		s.parentNode.insertBefore(hm, s);
	})();
}

//重定义alert
window.alert = function (name) {
	var iframe = document.createElement("IFRAME");
	iframe.style.display = "none";
	iframe.setAttribute("src", 'data:text/plain,');
	document.documentElement.appendChild(iframe);
	window.frames[0].window.alert(name);
	iframe.parentNode.removeChild(iframe);
};
//重定义confirm
window.confirm = function (message) {
	var iframe = document.createElement("IFRAME");
	iframe.style.display = "none";
	iframe.setAttribute("src", 'data:text/plain,');
	document.documentElement.appendChild(iframe);
	var alertFrame = window.frames[0];
	var result = alertFrame.window.confirm(message);
	iframe.parentNode.removeChild(iframe);
	return result;
};

//判断当前账号是否有全员账号。
function checkUserPromoter(cb) {
    $.showLoading('加载中');
    $.post('/checkUserPromoter', function (data,status,xhr) {
        console.log(data);
        $.hideLoading();
        if(status==='success'){
            if(data[0].status===200){
                cb(data[0].data);
            }else if( data[0].status===400){
                cb(null);
                //未登录-去登录。
                window.location.href = '/login/?m_id=' + merchantInfoId + '&redir=' + location.href;
            }else{
                cb(null);
                //错误
                Msg.open(data[0].message||'出错了')
            }
        }else{
            cb(null);
            Msg.open(data[0].message||'出错了')
        }
    });
}

//二级分销商判断，是否允许注册与绑定
function getCorpConfig() {
    var market_a=$('.marketing-com').find('.mkt-main a');
    $.showLoading('加载中');
    $.post('/getCorpConfig', function (data,status,xhr) {
        console.log(data);
        $.hideLoading();
        if(status==='success'){
            if (data[0].status === 200) {
                var datas = data[0],
                    bindPro= datas.data.corpAllowBindPromoter,//是否允许绑定
                    upPro = datas.data.corpAllowUpPromoter;  //是否允许注册
                if(upPro && bindPro){
                    market_a.show();
                }else if(upPro && !bindPro){
                    //走直接注册
                    // market_a.eq(0).show();
                    // market_a.eq(1).hide();
                    ///请求成为推广员
                    $.showLoading('一键注册中');
                    $.post('/createUserAuth',function (data,status,xhr) {
                        // console.log(data);
                        // debugger;
                        $.hideLoading();
                        if(status==='success' ){
                            if(data[0].status===200){
                                window.location.href = '/member/salesPromotion?m_id=' + merchantInfoId ;
                            }else if(data[0].status===400){
                                window.location.href = '/login/?m_id=' + merchantInfoId + '&redir=' + location.href;
                            }else{
                                Msg.open(data[0].message||'出错了')
                            }
                        }else{
                            Msg.open(data[0].message||'出错了')
                        }
                    });
                    return false;
                }else if(!upPro && bindPro){
                    market_a.eq(0).hide();
                    market_a.eq(1).show();
                }else{
                    // market_a.hide();
                    Msg.open('未拥有全员营销账号，当前店铺不允许注册与绑定全员营销');
                    return false;
                }
                $('.marketing-com,.marketing-mask').show();

            }else if( data[0].status===400){
                //未登录-去登录。
                window.location.href = '/login/?m_id=' + merchantInfoId + '&redir=' + location.href;
            }else{
                //错误
                Msg.open(data[0].message||'出错了')
            }
        }else{
            Msg.open(data[0].message||'出错了')
        }
    });
}

function GetQueryString(name) {
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if(r!=null)return  unescape(r[2]); return null;
}