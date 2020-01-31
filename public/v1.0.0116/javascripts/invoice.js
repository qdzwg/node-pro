$(function () {

    var $dropBox = $("#dropBox"), // 列表页下拉加载
        $invoiceType = $('#invoiceType'); // 申请页抬头类型

    if ($dropBox.length > 0) {
        ; (function () {
            var pageSize = 6, // 每页数据条数
                filterObj = {
                    flag: 0, //传入选择列表类型 {0:未开 || 1:已开} 
                    currPage: 1,
                    pageSize: pageSize
                }; // 定义一个对象用于存储筛选条件,默认筛选为翻页第一页

            var $searchTab = $('#search_tab').find('li');
            filterObj.flag = parseInt($('#search_tab').find('li.on').data('type')); //初始列表类型

            /**
             * 初始化下拉加载插件；
             */
            var dropload = $dropBox.dropload({
                scrollArea: window,
                loadDownFn: filterFn
            });

            /**
             * 切换列表的模式
             */

            $searchTab.on('click', function (e) {
                e.stopPropagation();
                var _this = $(this);
                _this.addClass('on').siblings().removeClass('on');
                filterObj.flag = parseInt(_this.data('type'));
                init() //重置列表数据
            });

            var $inoiveLayer = $('#inoiveLayer'),
                $inoiveLayerShow = $('#inoiveLayerShow'),
                $inoiveLayerCancel = $('#inoiveLayerCancel'),
                $whiteMask = $('#whiteMask');

            touch.on($inoiveLayerShow, 'tap', function () {
                if (!$inoiveLayer.hasClass('show')) {
                    $whiteMask.fadeIn(300);
                    $inoiveLayer.addClass('show');
                } else {
                    $inoiveLayer.removeClass('show');
                    $whiteMask.fadeOut(300);
                }
            })

            touch.on($inoiveLayerCancel, 'tap', function (event) {
                event.stopPropagation();
                $inoiveLayer.removeClass('show');
                $whiteMask.fadeOut(300);
            })

            function init() {
                filterObj.currPage = 1;
                $dropBox.find('ul').empty();
                unLockDropload();
                filterFn(dropload, 1);
            }

            /**
             * 获取当前页的数据
             * @param startPage
             */
            function filterFn(dropload, startPage) {
                console.log(filterObj)
                $.ajax({
                    type: 'POST',
                    url: '/invoice/pageList?m_id=' + merchantInfoId,
                    data: filterObj,
                    dataType: 'json',
                    success: function (data) {
                        console.log(data);
                        if (data !== 'error') {
                            //检测登录状态
                            if (data.status === 400) {
                                window.location.href = '/login?m_id=' + merchantInfoId;
                            }
                            var results = data.data;
                            console.log(results);
                            console.log(results.rows);

                            if (filterObj.currPage == 1) {
                                $dropBox.find('ul').html(listDom(results.rows, filterObj.flag));
                            } else {
                                $dropBox.find('ul').append(listDom(results.rows, filterObj.flag));
                            }
                            //filterObj.currPage = +(results.curPage) + 1;
                            filterObj.currPage += 1;

                            if (filterObj.currPage > results.pages) {
                                dropload.lock();
                                dropload.noData();
                            }
                        } else {
                            dropload.lock();
                            dropload.noData();
                        }
                        // 每次数据加载完，必须重置
                        dropload.resetload();
                    },
                    error: function (xhr, type) {
                        // 即使加载出错，也得重置
                        dropload.resetload();
                    }
                });
            }

            /**
             * 解锁dropload
             */
            function unLockDropload() {
                //dropload.resetload();
                dropload.unlock();
                //dropload.noData(false);
                dropload.isData = true;
            }
        })()
    } else if ($invoiceType.length > 0) {
        ; (function () {
            var $typeChoices = $invoiceType.find('.xx-icon'), flag = 0, validator = {};
            var $componyInfo = $('#componyInfo')
                , $persionInfo = $('#persionInfo')
                , $invoiceOtherText = $('#invoiceOtherText')
                , $componyForm = $('#componyform')
                , $persionForm = $('#persionform');
            formValidate($componyForm, true);
            // 切换发票模式
            touch.on($typeChoices, 'tap', function (e) {
                e.stopPropagation();
                var $this = $(this);
                flag = parseInt($this.data('index'));
                if ($this.hasClass('icon-yuanxingxuanzhongfill')) {
                    return;
                } else {
                    $typeChoices
                        .filter('.icon-yuanxingxuanzhongfill')
                        .removeClass('icon-yuanxingxuanzhongfill')
                        .addClass('icon-yuanxingweixuanzhong');

                    $this.addClass('icon-yuanxingxuanzhongfill')
                        .prev()
                        .prop('checked', true);

                    if (flag === 0) {
                        $componyInfo.show();
                        $persionInfo.hide();
                        $invoiceOtherText.hide();
                        formValidate($componyForm, true);
                    } else {
                        formValidate($persionForm, false);
                        $componyInfo.hide();
                        $invoiceOtherText.show();
                        $persionInfo.show();
                    };
                }
            })

            // t
            touch.on('#formBtn', 'tap', function (e) {
                e.stopPropagation();
                var curForm = flag === 0
                    ? $componyForm
                    : $persionForm,
                    payOrderNo = $(this).data('code');
                if (validator.form()) {
                    $.get('/invoice/saveInoviceFrom?' + curForm.serialize()
                        + '&m_id=' + merchantInfoId
                        + '&buyCategory=' + flag
                        + '&payOrderNo=' + payOrderNo)
                        .success(function (res) {
                            if (res.status == "200") {
                                if (res.data.code === 0) {
                                    if (res.data.invoiceResponse.resultCode === 0) {
                                        alert('开票申请提交成功');
                                        window.location.href = '/invoice/list?flag=1&m_id=' + merchantInfoId;
                                    } else if (res.data.invoiceResponse.resultCode === 6) {
                                        Msg.open(res.data.invoiceResponse.desc);
                                    }
                                } else {
                                    Msg.open(res.data.description);
                                }
                            }
                            else if (res.status == "400") {
                                window.location.href = '/login?m_id=' + merchantInfoId;
                            }
                            else {
                                res && res.message
                                    ? Msg.open(res.message)
                                    : Msg.open('提交失败')
                            }
                        })
                        .fail(function (err) {
                            console.log(err)
                        });

                }
            });
            /**
             * 表单验证
             * @param {DOM} $form 
             * @param {boolean} type 
             */
            function formValidate($form, type) {
                validator = $form.validate({
                    ignore: ":hidden",
                    rules: {
                        // 名称
                        buyDutyName: {
                            required: true,
                            maxlength: 48
                        },
                        // 手机号
                        receiveMobile: {
                            required: true,
                            isMobile: true
                        },
                        // 邮箱
                        receiveEmail: {
                            isMail: true,
                            maxlength: 50,
                        },
                        // 税号
                        buyDutyNo: {
                            required: type,
                            maxlength: 20,
                            minlength: 6
                        },
                        // 地址
                        buyAddress: {
                            required: false,
                            maxlength: 40
                        },
                        // 电话
                        buyTel: {
                            maxlength: 15
                        },
                        // 银行账号
                        buyBankNo: {
                            required: false,
                            isBankNo: true
                        },
                    }
                });
            }
        })()
    }
})

/**
 * 发票列表
 * @param {Array} rows 
 * @param {Boolean} flag 
 */
function listDom(rows, flag) {
    var dom = '';
    if (!(rows instanceof Array)) return dom;

    var len = rows.length,
        list = rows.reverse();
    if (!flag) {
        while (len--) {
            dom += '<li class="able">'
                + '    <div class="invoice-list-item invoice-list-info">'
                + '        <p class="invoice-orderNo">支付订单号：' + list[len].payOrderNo + ' </p>'

            if (typeof list[len].infoList !== 'undefined' && list[len].infoList.length > 0) {
                for (var i = 0; i < list[len].infoList.length; i++) {
                    dom += '<p class="invoice-info-detail">消费明细：' + list[len].infoList[i].orderInfo + ' * ' + list[len].infoList[i].num + '</p>'
                }
            }

            dom += '        <p class="invoice-info-detail">消费时间：' + list[len].payTime + '</p>'
                + '        <p class="invoice-info-detail">订单总额：' + list[len].paySum + '元</p>'
                + '        <p class="invoice-info-detail">可开总额：' + list[len].checkSum + '元</p>'
                + '    </div>'
                + '    <div class="invoice-list-item invoice-list-btn">'
                + '  <a href="/invoice/submitInfo/' + list[len].payOrderNo + '?m_id=' + merchantInfoId + '" title="title">开票 </a>'
                + '</div></li>'
        }
    } else {
        while (len--) {
            dom += '<li class="unable"><a class="class" href="#" title="title">'
                + '<div class="invoice-list-item invoice-list-info" >'
                + '    <p class="invoice-info-orderNo">订单号：' + list[len].payOrderNo + ' </p>'
                + '    <p class="invoice-info-detail">开票时间：' + list[len].invoiceTime + '</p>'
                + '    <p class="invoice-info-detail">开票状态：' + list[len].status + '</p>'
                + '    <p class="invoice-info-price">开票金额：' + list[len].nontaxAmount + '元</p></div>'
                + '<div class="invoice-list-item invoice-list-btn">'
                + '<a href="/invoice/detail/' + list[len].payOrderNo + '?m_id=' + merchantInfoId + '" class="inovice-price">查看详情</a></li>'
        }
    }

    return dom;
}