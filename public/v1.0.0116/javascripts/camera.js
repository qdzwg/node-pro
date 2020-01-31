
$(function () {
    var btn = document.querySelector('#J_btn');
    var img = document.querySelector('#J_img');
    if (isWx === 'T') {
        $.get("/group/wxshare", { url: location.href.split("#")[0] }, function (data) {
            if (data.msg === "unload") {
                window.location.href = "/login?m_id=" + merchantInfoId;
                return false;
            }
            wx.config({
                debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                appId: data.appid, // 必填，公众号的唯一标识
                timestamp: data.timestamp, // 必填，生成签名的时间戳
                nonceStr: data.nonceStr, // 必填，生成签名的随机串
                signature: data.signature,// 必填，签名，见附录1
                jsApiList: ["chooseImage"] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
            });
        }, 'json');

        if (typeof wx !== 'undefined') {
            wx.ready(function () {
                btn.addEventListener('click', function () { 
                    wx.chooseImage({
                        count: 1, // 默认9
                        sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
                        sourceType: ['camera'], // 可以指定来源是相册还是相机，默认二者都有
                        success: function (res) {
                            var localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
                        }
                    });
                });
                
            });
        }
    }
    else if (isAli === 'T') {
        btn.addEventListener('click', function () {
            ap.chooseImage({ count: 1, sourceType: ['camera'] }, function (res) {
                ap.alert(JSON.stringify(res));
                if (img instanceof HTMLImageElement) {
                    img.src = res.apFilePaths[0];
                }
            });
        });
    }
    else {

    }
})



