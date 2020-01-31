$(function () {
    var w = $(window).width();
    var h = $(window).height();
    var payOrderNo = '';
    var $target = null;
    var $realNameAddFace = $('#realNameAddFace'); // payresult.jade
    var $realNameFace = $('#realNameFace'); // member/order/detail.jade
    var $view = $('#view');
    var $mask = $('#mask');
    var $showFace = $('#showFace');
    var realNameFaceUrl =  'F'; // 实名制人脸
    var addFaceBtnType = 'F';
    var orderNoType = 'payOrderNo';

    if ($realNameAddFace.size()) {
        realNameFaceUrl = $view.data('realnameface') || 'F'
        allNeedFace = $view.data('allface')
        var $height = $realNameAddFace.height();
        $realNameAddFace.on('click', '.add-face-btn', function (e) {
            $target = $(this);
            $("#select_btn").click();
            // payOrderNo = $target.data('no');
            addFaceBtnType = $target.parents('li').data('allface');
        })

        // 关闭弹框
        touch.on('#mask', 'tap',  function () {
            $(this).hide();
            $realNameAddFace.css('bottom', - $height + 'px');
        })

        // 关闭弹框
        touch.on($realNameAddFace.find('#userEditerClose'),'tap',function(){
            $mask.hide();
            $realNameAddFace.css('bottom', - $height + 'px');
        })

        // 关闭弹框
        touch.on($realNameAddFace.find('.user-editer-btn'),'tap',function(){
            $mask.hide();
            $realNameAddFace.css('bottom', - $height + 'px');
        })

        // $('.pay-result-btn').on('tap','.goDetail',function() {
        //     window.location.href = '/list/order?orderStatus=0&m_id=' + merchantInfoId
        // })
    }

    if ($realNameFace.size()) {
        realNameFaceUrl = $realNameFace.data('realnameface') || 'F';
        orderNoType = 'orderNo';

        $('.add-face').on('click',function(){
            $target = $(this);
            $("#select_btn").click();
            payOrderNo = $(this).data('no');
        })
        
    }

    $("#view").click(function () {
        if (realNameFaceUrl === 'T') {
            $realNameAddFace.css('bottom', 0);
            $('#mask').fadeIn(100);
        }
        else {
            $("#select_btn").click();
            payOrderNo = $(this).data('no');
        }
        // $("#clipArea,#closeClip,#edit_finished,#select_btn").show();
        // $("#clipArea").show();
    });


    $('#clipArea').crop({
        w: w > h ? h : w,
        h: h,
        r: (w - 30) * 0.5,
        res: '',
        callback: function (ret) {
            if (!ret) return;
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
                    // $.hideLoading();
                },
                success: function (data) {
                    if (data.status !== 200) {
                        $.alert(data.message)
                        $.hideLoading();
                    } else {
                        
                        if (realNameFaceUrl === 'T' && addFaceBtnType === 'F') {
                            var $targetLi = $target.parents('li');
                            var thisOrderNo = $targetLi.data('orderno');   
                            var thisIdCard = $targetLi.data('idcard');      
                            $.ajax({
                                url: '/order/updata/realname',
                                data: {
                                    idcard: thisIdCard ,
                                    faceUrlPath: data.message,
                                    orderNo: thisOrderNo,
                                    type:orderNoType,
                                    m_id: merchantInfoId
                                },
                                type: 'POST',
                                success: function (res) {
                                    $.hideLoading();
                                    console.log(res)
                                    if (res.status === 200) {
                                        if (orderNoType === 'payOrderNo') {
                                            $target.removeClass('able').addClass('disabled').unbind('click').text('录入完成');
                                            $target.parents('li').clone().appendTo("ul.user-info-lists");
                                            $target.parents('li').remove();
                                            if (!$('.able').size()) {
                                                $.alert('补录完成');
                                                $mask.hide();
                                                $realNameAddFace.css('bottom', - $height + 'px');
                                                $view.unbind('click').addClass('background-gray').text('人脸补录完成');
                                                $('a.goqr').text('查看详情');
                                            }
                                        }
                                        else {
                                            $target.html('<img src=' + data.message + '>').removeClass('add-face');
                                        }
                                        
                                    } 
                                    else {
                                        $.alert(res.message)
                                    }
                                }
                            })
                            
                            return;
                        } else {
                            if (addFaceBtnType === 'T') {
                                payOrderNo = $target.parents('li').data('payorderno')
                            }
                            $.ajax({
                                url: '/order/updata/reAddAiBeeFace',
                                data: {
                                    payOrderNo: payOrderNo,
                                    faceUrl: data.message,
                                    m_id: merchantInfoId
                                },
                                type: 'POST',
                                success: function (res) {
                                    $.hideLoading();
                                    if (res.status === 200) {
                                        $.toast(res.message);
                                        if (typeof curPage !== 'undefined' && curPage === 'payResult') {
                                            if (addFaceBtnType === 'T') {
                                                $target.removeClass('able').addClass('disabled').unbind('click').text('录入完成');
                                                $target.parents('li').clone().appendTo("ul.user-info-lists");
                                                $target.parents('li').remove();
                                                if (!$('.able').size()) {
                                                    $.alert('补录完成');
                                                    $mask.hide();
                                                    $realNameAddFace.css('bottom', - $height + 'px');
                                                    $view.unbind('click').addClass('background-gray').text('人脸补录完成');
                                                    // $('a.goqr').text('查看详情').attr('href', '/list/order?m_id=' + merchantInfoId)
                                                }
                                            }
                                            else {
                                                $showFace.show();
                                                $mask.show();
                                                $showFace.find('.show-face-image img').attr('src', data.message);
                                                $('#faceCancel').unbind('click').click(function () {
                                                    $mask.hide();
                                                    $showFace.hide();
                                                })
                                                var orderId = $view.data('id');
                                                $view.addClass('background-gray').unbind('click').text('人脸录入完成');
                                                $('#goDetail').unbind('click').click(function () {
                                                    window.location.href = '/member/myTicket?id=' + orderId + '&from=pay&m_id=' + merchantInfoId
                                                })
                                            }
                                            

                                        }
                                        else {
                                            $view.html('<img src=' + data.message + '>');
                                            $view.unbind('click');
                                        }


                                    } else {
                                        $.alert(res.message);
                                    }
                                }
                            })

                        }
                        
                    }
                    // $("#clipArea,#closeClip,#edit_finished,#select_btn").hide();
                    $("#videoArea").hide();
                },
                error: function (err) {
                    $.hideLoading();
                    console.log(err)
                }

            })

        }
    });

})


