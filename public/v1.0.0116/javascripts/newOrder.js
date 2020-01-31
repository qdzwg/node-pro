var realNameObj = []; //实名制信息

$(function () {
    /**
     *  新订单页dom绑定
     */
    var $newOrder = {
        openLinkBooks: $('.openLinkBook'),
        openCardCameras: $('openCardCamera'),
        mask: $('#mask'),
        userEditer: $('#userEditer'),
        tikcetOrderList: $('#tikcetOrderList'),
        linksForm: $('#linksForm'),
        userInfolists: $('#userInfolists'),
        userEditerInput: $('#userEditerInput')
    }

    var $orderRealnameList = $('.order-realName-lists') // 实名制输入列表

    var $faceTarget = null; // 出发实名制人脸的目标dom
    var $linksTarget = null;
    var addLinksValidate = null; // 添加实名制信息校验
    
    var w = $(window).width();
    var h = $(window).height();


    var EditerHeight = $newOrder.userEditer.height(); // 获取用户信息展示框的高度
    console.log(EditerHeight)
    $newOrder.userEditer.css('bottom', - EditerHeight + 'px');

    var tprice = 0;
    var $ticketLists = $newOrder.tikcetOrderList.find(".persion-order-item");
    if ($ticketLists.length > 0) {
        $ticketLists.each(function () {
            tprice = operation.accAdd(tprice, operation.accMul($(this).find(".product-price").text(), $(this).find(".product-num").text()));
            tprice = tprice < 0 ? 0 : tprice;
        });
        $("#totalprice").text(tprice.toFixed(2));
        $("#paySum").val(tprice.toFixed(2));
    }

    // 展示常用联系人
    $('body').on('tap','.openLinkBook',function(e){
        e.stopPropagation();
        var $this = $(this);
        $faceTarget = $this.parents('.order-input-list'); // ul
        $newOrder.mask.fadeIn(100);
        $newOrder.userEditer.css('bottom', 0);
    })

    // 收起常用联系人
    touch.on($newOrder.mask, 'tap', function (e) {
        e.stopPropagation();
        EditerHeight = $newOrder.userEditer.height()
        $newOrder.mask.fadeOut(300);
        $newOrder.userEditer.css('bottom', - EditerHeight + 'px');
    })

    // 收起常用联系人
    touch.on('#userEditerClose', 'tap', function (e) {
        e.stopPropagation();
        EditerHeight = $newOrder.userEditer.height()
        $newOrder.mask.hide();
        $newOrder.userEditer.css('bottom', - EditerHeight + 'px');
    })

    // 选择常用联系人
    $newOrder.userEditer.on('tap','.user-info-detail',function () {
        var itemData = $(this).data('item');
        setUpLinksInfo(itemData);
    })

    // 实名制人脸
    $newOrder.userInfolists.on('tap','.completeInfo', function () {
        var $this = $(this);
        cameraType = 'face';
        $linksTarget = ($this.hasClass('completeInfo') ? $this : $this.parents('.completeInfo'));
        var oldInfo = $this.parents('.user-info-item').find('.user-info-detail').data('item');
        if (oldInfo) {
            if (oldInfo === 'string') oldInfo = JSON.parse(oldInfo);
            $newOrder.userEditerInput.find('input').val('');
            if ($newOrder.userEditerInput.find('#addUserEditerFace img').size()) {
                $newOrder.userEditerInput.find('#addUserEditerFace').html('<div class="order-face-icon"><i class="xx-icon icon-camera"></i></div> <span>人脸图片用于入园对比</span>')
            }
            $newOrder.userEditerInput.find('input[name=name]').val(oldInfo.name);
            $newOrder.userEditerInput.find('input[name=id]').val(oldInfo.id);
            $newOrder.userEditerInput.find('input[name=phone]').val(oldInfo.phone);
            $newOrder.userEditerInput.find('input[name=certNo]').val(oldInfo.certNo);
            if (oldInfo.faceUrl) {
                $newOrder.userEditerInput.find('#addUserEditerFace').html('<img src = ' + oldInfo.faceUrl + ' />');
                $newOrder.userEditerInput.find('input[name=faceUrl]').val(oldInfo.faceUrl);
            }
            $newOrder.userEditerInput.addClass('show');
        }
    })

    function setUpLinksInfo(itemData, keepMask, noFace) {
        if (typeof itemData === 'string') {
            try {
                itemData = JSON.parse(itemData);
            } catch (error) {
                itemData = {};
            }
        }

        if ($faceTarget && !$faceTarget.find('.changeInput').size()) {
            $faceTarget.find('input.order-name').val(itemData.name).trigger('change');
            if (itemData.certNo) {
                $faceTarget.find('.input_select').text('身份证');
                $faceTarget.find('.realNameFace').parents('li').show();
                $faceTarget.find('.typeName').val('id').trigger('change');
                $faceTarget.find('.buyerIdNo__oc').hide().next('label.error').remove();
                $faceTarget.find('.buyerIdNo__id').show().val(itemData.certNo).trigger('change');
            }
            if ($faceTarget.find('input.order-faceUrl').size() && !noFace) {
                if (itemData.faceUrl) {
                    $faceTarget.find('.realNameFace').html('<img src=' + itemData.faceUrl + ' />')
                    $faceTarget.find('input.order-faceUrl').val(itemData.faceUrl).trigger('change');
                } else {
                    $faceTarget.find('.realNameFace').html('<div class="order-face-icon"><i class="xx-icon icon-camera"></i></div> <span>人脸图片用于入园对比（必传）</span>');
                    $faceTarget.find('input.order-faceUrl').val('');
                }

            }
        } else {
            $('.changeInput,.order-item .icon-iconfont-xie').trigger('click');
            $('input[name=buyerName]').val(itemData.name);
            $('input[name=buyerMobile]').val(itemData.phone);
            $('input[name=buyerIdNo]').val(itemData.certNo || '').blur();
            if (itemData.faceUrl) {
                $('#view').html('<img src=' + itemData.faceUrl + ' />');
                $('#imagePath').val(itemData.faceUrl);
            } else {
                $('#view').html('<div class="order-face-icon"><i class="xx-icon icon-camera"></i></div> <span>人脸图片用于入园对比（必传）</span>');
                $('#imagePath').val('');
            }

        }
        if (keepMask) return;
        $newOrder.mask.hide();
        EditerHeight = $newOrder.userEditer.height();
        $newOrder.userEditer.css('bottom', - EditerHeight + 'px');
    }

    // 添加联系人信息
    touch.on('#addUserLinks', 'tap', function () {
        $newOrder.userEditerInput.find('input').val('');
        if ($newOrder.userEditerInput.find('#addUserEditerFace img').size()) {
            $newOrder.userEditerInput.find('#addUserEditerFace').html('<div class="order-face-icon"><i class="xx-icon icon-camera"></i></div> <span>人脸图片用于入园对比（必传）</span>')
        }
        $newOrder.userEditerInput.addClass('show');
    })

    touch.on('#addUserEditerClose', 'tap', function () {
        $newOrder.userEditerInput.removeClass('show');
    })

    //拍照调用
    jQuery.support.cors = true;
    $("#view").click(function () {
        $faceTarget = $("#view");
        cameraType = 'face'
        $("#select_btn").trigger('click');
        // $("#clipArea,#closeClip,#edit_finished,#select_btn").show();
        // $("#clipArea").show();
    });

    // 实名制部分人脸录入 
    $newOrder.tikcetOrderList.on('click', '.realNameFace', function (e) {
        cameraType = 'face';
        $faceTarget = $(this).hasClass('realNameFace') ? $(this) : $(this).parents('.realNameFace');
        $("#select_btn").trigger('click');
    });

    // 实名制身份证识别
    $newOrder.tikcetOrderList.on('click', '.openCardCamera', function (e) {
        cameraType = 'card';
        $faceTarget = $(this).parents('.order-input-list');
        $("#select_btn").trigger('click');
    });

    // 新增联系人人脸录入
    touch.on('#addUserEditerFace', 'click', function () {
        $faceTarget = $("#addUserEditerFace");
        $("#select_btn").trigger('click');
    })

    $("#closeClip").click(function () {
        // $("#clipArea,#closeClip,#edit_finished,#select_btn").hide();
        $("#clipArea").hide();
    })

    $('#clipArea').crop({
        w: w > h ? h : w,
        h: h,
        r: (w - 30) * 0.5,
        res: '',
        callback: function (ret) {
            if (!ret) return;
            $("#videoArea").hide();
            if (cameraType === 'face') { // 人脸识别
                $.ajax({
                    url: '/order/updata/aiBeeFace',
                    data: {
                        photo: ret.replace(/^data:image\/\w+;base64,/, "")
                    },
                    type: 'POST',
                    beforeSend: function (xhr) {
                        $.showLoading();
                    },
                    complete: function (xhr, status) {
                        $.hideLoading();
                    },
                    success: function (data) {
                        if (data.status !== 200) {
                            $("#mask").show();
                            $(".tips").show().find("p").text(data.message);
                        } else {
                            $.toast("上传成功");
                            $faceTarget.html('<img src=' + data.message + '>');
                            $faceTarget.next('input').val(data.message).trigger('change');
                            $faceTarget = null // 置空
                        }
                        if ($('#openCamera').size()) $('#openCamera').val(''); // 清空
                    },
                    error: function (err) {
                        console.log(err)
                    }
                })
            }
            else {
                $.ajax({  // 身份证识别
                    url: '/order/updata/idcard',
                    data: {
                        photo: ret.replace(/^data:image\/\w+;base64,/, "")
                    },
                    type: 'POST',
                    beforeSend: function (xhr) {
                        $.showLoading();
                    },
                    complete: function (xhr, status) {
                        $.hideLoading();
                    },
                    success: function (data) {
                        console.log(data)
                        
                        if (data.status === 200) {
                            var userInfo = null;
                            if (data.data && typeof data.data === 'string') userInfo = JSON.parse(data.data);
                            if (userInfo) {
                                userInfo = {
                                    name: userInfo.words_result['姓名'].words,
                                    certNo: userInfo.words_result['公民身份号码'].words
                                }
                                Msg.open('身份证识别成功')
                                setUpLinksInfo(userInfo,0,1)
                            }
                        }
                        else {
                            console.log(data)
                            if (data && data.message) {
                                $.alert(data.message);
                            }
                        }
                        if ($('#selectImageFile').size()) $('#selectImageFile').val(''); // 清空
                    },
                    error: function (err) {
                        console.log(err)
                    }
                })
            }
            
        }
    });

    if ($orderRealnameList.length > 0) {
        var extendRules = {}; // 新增验证规则

        $orderRealnameList.each(function (index) {
            var $this = $(this)
                , thisCode = $this.data('code')
                , $inputList = $this.find('.order-input-list')
                , thisObj = {}; // 数据对象

            thisObj = {
                code: thisCode,
                list: []
            }

            $inputList.each(function (_index) {
                extendRules['realName_' + index + '_' + _index] = {
                    required: true,
                    maxlength: 10
                }
                extendRules['idCard_' + index + '_' + _index] = {
                    required: true,
                    isIdCardNo: true,

                }
                extendRules['idCard_' + index + '_' + _index + '_oc'] = {
                    required: true,
                    maxlength: 17
                }

                thisObj.list.push({
                    name: '',
                    idNo: '',
                    faceUrl: '',
                    idcardType: 'id' // 默认
                })
            })
            realNameObj.push(thisObj);
        })

        // 动态监听
        $orderRealnameList.find('input.order-text').live('change', function () {
            var $this = $(this)
                , thisText = $this.val()
                , thisName = $this.attr('name')
                , thisNameArray = thisName.split('_')
                , thisType = thisNameArray[0] // [String] name or idNo
                , thisTicketIndex = +thisNameArray[1]  // [Number] 
                , thisUsrInfoIndex = +thisNameArray[2] // [Number]
                ;

            if (thisText) {
                if (thisType === 'realName') {
                    realNameObj[thisTicketIndex].list[thisUsrInfoIndex].name = thisText;
                } else if (thisType === 'idcardType') {
                    console.log(thisType, thisText)
                    realNameObj[thisTicketIndex].list[thisUsrInfoIndex].idcardType = thisText;
                    realNameObj[thisTicketIndex].list[thisUsrInfoIndex].idNo = '';
                    // if (thisText === 'passport') {

                    // }
                } else if (thisType === 'faceUrl') {
                    realNameObj[thisTicketIndex].list[thisUsrInfoIndex].faceUrl = thisText;
                }
                else {
                    var hasCode = false;
                    var thisList = realNameObj[thisTicketIndex].list;
                    for (var i = 0; i < thisList.length; i++) {
                        if (i !== thisUsrInfoIndex && thisList[i].idNo === thisText) {
                            if ($this.siblings('label').length > 0) {
                                $this.siblings('label').text('同一票型不能重复使用证件号').show();
                            } else {
                                $this.after('<label id="' + thisName + '-error" class="error" for=' + thisName + '>同一票型不能重复使用证件号</label>')
                            }
                            hasCode = true;
                            break;
                        }
                    }

                    if (!hasCode) {
                        realNameObj[thisTicketIndex].list[thisUsrInfoIndex].idNo = thisText;
                        $('#' + thisName + '-error').remove();
                    } else {
                        $this.val('');
                    }
                }
            }
            console.log(realNameObj);
            $('input[name=realNames]').val(JSON.stringify(realNameObj))
        })

        formValidate(false, extendRules);
    } else {
        formValidate()
    }

    /**
     * 表单验证
     */
    function formValidate(goodsWayType, extendRules) {
        var rules = {
            realNames: {
                required: true,
                maxlength: 10
            },
            realIds: {
                required: true
            },
            //提货人
            buyerName: {
                required: true,
                maxlength: 10
            },
            //提货手机号
            buyerMobile: {
                required: true,
                isMobile: true
            },
            //身份证
            buyerIdNo: {
                required: typeof isNeedIdCard !== 'undefined' && isNeedIdCard === 'T',
                isIdCardNo: true
            },
            //自提地址
            buyerAddr: {
                required: goodsWayType,
            },
            realName: {
                required: true,
                maxlength: 10
            },
            idCard: {
                required: true,
                isIdCardNo: true
            }
        }
        rules = $.extend(false, rules, extendRules)  // 合并规则

        validator = $('#form').validate({
            ignore: ":hidden",
            rules: rules
        });

    }

    // 添加联系人校验
    addLinksValidate = $newOrder.linksForm.validate({
        ignore: ":hidden",
        rules: {
            name: {
                required: true,
                maxlength: 10
            },
            phone: {
                required: true,
                isMobile: true
            },
            certNo: {
                isIdCardNo: true
            }
        }
    });

    touch.on('#submitUserInfoForm', 'tap', function (e) {
        // var orderId = $(this).data('orderid');
        // var url = $(this).data('url');
        if (addLinksValidate.form()) {
            $.ajax({
                url: '/member/links/linksUserInfoSave',
                type: 'POST',
                data: $newOrder.linksForm.serialize(),
                beforeSend: function (xhr) {
                    $.showLoading();
                },
                complete: function (xhr, status) {
                    $.hideLoading();
                },
                success: function (res) {
                    if (res) {
                        if (res.status === 200) {
                            Msg.open('保存成功');
                            var linksInfo = res.data;

                            if (linksInfo.ifNew === 'F') {
                                var $thisLinksDetail = $linksTarget.parents('li.user-info-item').find('.user-info-detail');
                                $thisLinksDetail.data('item', linksInfo);
                                $thisLinksDetail.find('.user-info-detail__name').text(linksInfo.name);
                                $thisLinksDetail.find('.user-info-detail__phone em').text(linksInfo.phone);
                                $thisLinksDetail.find('.user-info-detail__idcard em').text(linksInfo.certNo);
                                $newOrder.userEditerInput.removeClass('show');
                                return false;
                            }

                            var isNoData = !!$newOrder.userInfolists.find('.nodata').size();

                            linksInfo.createTime = ''; // 影响了转译，先去掉；
                            linksInfo.modifyTime = ''; // 影响了转译，先去掉；
                            // setUpLinksInfo(linksInfo, 1); //自动填充

                            var linkList = '<li class="user-info-item">'
                                + '<div class="user-info-content" >'
                                + '    <div class="user-info-detail" data-item=' + JSON.stringify(linksInfo) + '>'
                                + '        <p class="user-info-detail__name">' + linksInfo.name + '</p>'
                                + '        <p class="user-info-detail__phone"><i class="xx-icon icon-shouji"></i><em>' + linksInfo.phone + '</em></p>';

                            if (linksInfo.certNo) {
                                linkList += '<p class="user-info-detail__idcard"><i class="xx-icon icon-shenfenzheng1"></i><em>' + linksInfo.certNo + '</em>';
                            } else {
                                linkList += '<p class="user-info-detail__idcard"><strong>信息不全,点击补充 </strong></p>';
                            }

                            linkList += '</p></div>'
                                + '    <div class="user-info-btns"><span data-id=' + linksInfo.id + ' class="xx-icon icon-yijianfankui completeInfo"></span><span class="xx-icon icon-shanchu"></span></div>'
                                + '</div >'
                                + '<div data-id="' + linksInfo.id + '" class="user-info-delete">删除</div>'
                                + '</li>';

                            if (isNoData) {
                                $newOrder.userInfolists.find('.nodata').remove();
                                $newOrder.userInfolists.append(linkList);
                            } else {
                                $newOrder.userInfolists.prepend(linkList);
                            }
                            $newOrder.userEditerInput.removeClass('show');

                            // 点击图标展示删除按钮
                            touch.on($newOrder.userInfolists.find('.icon-shanchu'), 'tap', function () {
                                $newOrder.userInfolists.find('.user-info-delete.show').removeClass('show');
                                $(this).parents('.user-info-item')
                                    .find('.user-info-delete')
                                    .addClass('show');
                            });

                            // 左滑打开删除按钮
                            touch.on('.user-info-item', 'swipeleft', function () {
                                var $this = $(this);
                                $newOrder.userInfolists.find('.user-info-delete.show').removeClass('show');

                                $this = $this.hasClass('user-info-item')
                                    ? $this
                                    : $this.parents('.user-info-item');
                                $this.find('.user-info-delete')
                                    .addClass('show');
                            });

                            // 右滑关闭删除按钮
                            touch.on('.user-info-item', 'swiperight', function () {
                                var $this = $(this);
                                $this = $this.hasClass('user-info-item')
                                    ? $this
                                    : $this.parents('.user-info-item');
                                $this.find('.user-info-delete')
                                    .removeClass('show');
                            });

                        } else {
                            Msg.open(res.message);
                        }
                    } else {
                        Msg.open('保存失败');
                    }
                },
                error: function (err) {
                    console.log(err)
                }
            })

        }
    })

})

