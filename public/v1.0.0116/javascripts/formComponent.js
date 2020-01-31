$(function () {
    if ($('.formComponent').size()) init();
})
function init() {
    var $formList = $('.formComponent');
    var formString = $formList.data('str');
    var formArray = typeof formString === 'string' ? JSON.parse(formString) : formString;
    var $targetBtn = null //上传图片按钮
    formValidate($('#form'), formArray);

    // 图片上传
    $formList.find('.updataImg').click(function () {
        $targetBtn = $(this);
        if (typeof isAli !== 'undefined' && isAli === 'T') { // 支付宝环境打开页面
            ap.chooseImage({ count: 1, sourceType:  ['camera', 'album'] , publicDomain: false, useFrontCamera: false, allowEdit: true }, function (result) {
                var apFilePath = result.apFilePathsV2 || result.apFilePaths || [];
                if (typeof apFilePath === 'string') {
                    try {
                        apFilePath = JSON.parse(apFilePath);
                    } catch (e) { }
                }
    
                if (!apFilePath.length || !/^https?:/.test(apFilePath[0])) {
                    return;
                }
    
                var image = new Image();
                image.crossOrigin = 'anonymous';
                image.src = apFilePath[0];
                image.onload = function () {
                    resetImg($targetBtn,image);
                }
                
            });
        }
        else {
            $targetBtn.next().trigger('click');
        }
        // $('#selectImageFile').unbind('click').click()
        
    })

    touch.on('.img-item','hold','img',function(){   
        var $targetList = $(this).parents('li');
        $(this).remove()
        $targetList.find('.updataImg').show();
        var $imgs = $targetList.find('.img-item img');
        
        if ($imgs.length < 1) {
            $targetList.find('.img-item-notice').hide()
            $targetList.find('.order-faceUrl').val('')
        } else {
            var curUrlArray = []
            $imgs.each(function(){
                curUrlArray.push($(this).attr('src'));
            })
            $targetList.find('.order-faceUrl').val(curUrlArray.join(','))
        }
    })

    touch.on('#calendar-box','swiperight',function(){
        $("#calendar-box").removeClass("calendar-show");
    })

    touch.on('.order-item .icon-iconfont-pxchaxian','tap',function(){
        $(this).prev('input').val('')
    })



    touch.on('.img-item .icon-guanbi1','tap',function(){
        $(this).parents('.img-item-notice').hide()
    })

    var $files = $formList.find('.updataImgFile');
    $files.change(function (event) {
        var file = event.target.files[0];
        var Orientation = null;
        if (file.type && !/image\/\w+/.test(file.type)) {
            alert("请确保文件为图像类型");
            return false;
        }
        EXIF.getData(file, function () {
            EXIF.getAllTags(this);
            Orientation = EXIF.getTag(this, 'Orientation');
            //return;  
        });
        
        if (window.FileReader) {
            var reader = new FileReader();
            reader.onloadstart = function (e) {
                console.log('开始读取图片');
                console.log(e);
            }
            reader.readAsDataURL(file);
            reader.onload = function (e) {
                var image = new Image();
                image.src = e.target.result;
                image.onload = function () {
                    resetImg($targetBtn, image, file, Orientation);
                }
                
            }
        }

    })

    // 时间选择
    $formList.find('.lvGetTime').each(function () {
        var thisTitle = $(this).parent('.order-item').data('title');
        // var nowTimes = $thisInput.val();
        $(this).datetimePicker({
            title: thisTitle,
            // min:nowTimes
        });
    })

    var $targetCalendar = null;
    $formList.find('.lvGetCalendar').on('tap', function () {
        $targetCalendar = $(this);
        $("#calendar-box").addClass("calendar-show");
    })

    $('#lvcalendar').calendar({
        multipleMonth: 4,
        multipleSelect: false,
        click: function (datas) {
            $targetCalendar.val(datas[0]);
            $("#calendar-box").removeClass("calendar-show");
        }
    })
   
}

function uploadImg($dom, base64) {
    $.ajax({
        url: '/order/updata/imgFile',
        type: 'POST',
        data: { photo: base64.split(',')[1] },
        beforeSend: function (xhr) {
            $.showLoading();
        },
        complete: function (xhr, status) {
            $.hideLoading();
        },
        success: function (data) {
            $thisMmoule = $dom.parents('li')
            $thisMmoule.find('.img-item').append('<img src=' + data.message + '>')
            $imgs = $thisMmoule.find('.img-item').find('img')

            if ($imgs.length === 1) {
                $thisMmoule.find('.img-item-notice').show()
            } else if ($imgs.length > 4) {
                $thisMmoule.find('.updataImg').hide()
            }
            
            var curUrlArray = []
            $imgs.each(function(){
                curUrlArray.push($(this).attr('src'));
            })
            $thisMmoule.find('.order-faceUrl').val(curUrlArray.join(','))
        },
        error: function (err) {
            console.log(err)
        }
    })
}



//重置图片
function resetImg($dom,source_img, file, Orientation) {
    var quality = 0.7;
    var newImgData = compress(source_img, quality, file, Orientation);
    
    uploadImg($dom, newImgData)
}
//压缩图片,若压缩后失真严重，可以把此函数换成压缩包里的本地图片压缩插件
function compress(source_img, quality, file, Orientation) {
    var MaxW = 1200, MaxH = 1200;
    if (source_img.width > source_img.height) {
        imageWidth = MaxW;
        imageHeight = Math.round(MaxH * (source_img.height / source_img.width));
    } else if (source_img.width < source_img.height) {
        imageHeight = MaxH;
        imageWidth = Math.round(MaxW * (source_img.width / source_img.height));
    } else {
        imageWidth = MaxW;
        imageHeight = MaxH;
    }
   
    quality = imageWidth / source_img.width;
    //quality = quality<0.6?quality+0.4:quality;

    var canvas = document.createElement('canvas');
    canvas.width = imageWidth;
    canvas.height = imageHeight;
    var con = canvas.getContext('2d');
    con.clearRect(0, 0, canvas.width, canvas.height);
    con.drawImage(source_img, 0, 0, canvas.width, canvas.height);
    // alert(imageWidth)
 
    if (navigator.userAgent.match(/(iphone)|(mi\s)|(sm-)/i)) {
        //alert(expectWidth + ',' + expectHeight);  
        //如果方向角不为1，都需要进行旋转 added by lzk  

        if (Orientation != "" && Orientation != 1) {

            switch (Orientation) {
                case 6://需要顺时针（向左）90度旋转    
                    rotateImg(source_img, 'left', canvas);
                    break;
                case 8://需要逆时针（向右）90度旋转  
                    rotateImg(source_img, 'right', canvas);
                    break;
                case 3://需要180度旋转  
                    rotateImg(source_img, 'right', canvas);//转两次  
                    rotateImg(source_img, 'right', canvas);
                    break;
            }
        }

        base64 = canvas.toDataURL("image/jpeg", quality);
    } else if (navigator.userAgent.match(/Android/i)) {
        // 修复android  
        base64 = canvas.toDataURL("image/jpeg", quality);
    } else {
        //alert(Orientation);  
        if (Orientation != "" && Orientation != 1) {
            //alert('旋转处理');  
            switch (Orientation) {
                case 6://需要顺时针（向左）90度旋转  
                    rotateImg(source_img, 'left', canvas);
                    break;
                case 8://需要逆时针（向右）90度旋转  
                    rotateImg(source_img, 'right', canvas);
                    break;
                case 3://需要180度旋转  
                    rotateImg(source_img, 'right', canvas);//转两次  
                    rotateImg(source_img, 'right', canvas);
                    break;
            }
        } else {

        }
        base64 = canvas.toDataURL("image/jpeg", quality);
    }
    canvas = null;
    return base64;
}

// 转向
function rotateImg(img, direction, canvas) {
    //alert(img);  
    //最小与最大旋转方向，图片旋转4次后回到原方向    
    var min_step = 0;
    var max_step = 3;
    //var img = document.getElementById(pid);    
    if (img == null) return;
    //img的高度和宽度不能在img元素隐藏后获取，否则会出错    
    var height = canvas.height;
    var width = canvas.width;
    //var step = img.getAttribute('step');    
    var step = 2;
    if (step == null) {
        step = min_step;
    }
    if (direction == 'right') {
        step++;
        //旋转到原位置，即超过最大值    
        step > max_step && (step = min_step);
    } else {
        step--;
        step < min_step && (step = max_step);
    }

    //旋转角度以弧度值为参数    
    var degree = step * 90 * Math.PI / 180;
    var ctx = canvas.getContext('2d');
    switch (step) {
        case 0:
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            break;
        case 1:
            canvas.width = height;
            canvas.height = width;
            ctx.rotate(degree);
            ctx.drawImage(img, 0, -height, width, height);
            break;
        case 2:
            canvas.width = width;
            canvas.height = height;
            ctx.rotate(degree);
            ctx.drawImage(img, -width, -height, width, height);
            break;
        case 3:
            canvas.width = height;
            canvas.height = width;
            ctx.rotate(degree);
            ctx.drawImage(img, -width, 0, width, height);
            break;
    }
}


/**
 * 表单验证
 */
function formValidate($dom, formArray) {
    var rules = {};
    formArray.forEach(function (item, index) {
        var itemName = item.name
        switch (item.type) {
            case 'buyerName':
                rules[itemName] = {
                    required: item.isRequired,
                    maxlength: 10
                }
                break;
            case 'buyerMobile':
                rules[itemName] = {
                    required: item.isRequired,
                    isMobile: true
                }
                break;
            case 'lvMobile':
                rules[itemName + '_' + index] = {
                    required: item.isRequired,
                    isMobile: true
                }
                break;
            case 'buyerIdNo':
                rules[itemName] = {
                    required: item.isRequired,
                    isIdCardNo: true
                }
                break;
            case 'lvIdCard':
                rules[itemName + '_' + index] = {
                    required: item.isRequired,
                    isIdCardNo: true
                }
                break;
            case 'lvOneText':
                rules[itemName + '_' + index] = {
                    required: item.isRequired,
                    maxlength: 50
                }
                break;
            case 'lvManyText':
                rules[itemName + '_' + index] = {
                    required: item.isRequired,
                    maxlength: 200
                }
                break;
            case 'lvMumber':
                rules[itemName + '_' + index] = {
                    required: item.isRequired,
                    number: true,
                    maxlength: 50
                }
                break;
            case 'lvEmail':
                rules[itemName + '_' + index] = {
                    required: item.isRequired,
                    isMail: true
                }
                break;
            case 'lvPic':
                rules[itemName + '_' + index] = {
                    required: item.isRequired,
                }
                break;
            case 'lvTime':
                rules[itemName + '_' + index] = {
                    required: item.isRequired,
                }
                break;
            case 'lvDate':
                rules[itemName + '_' + index] = {
                    required: item.isRequired,
                }
                break;

        }
    })

    window.validator = $dom.validate({
        ignore: ":hidden",
        rules: rules
    });

}
