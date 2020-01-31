$(function () {
    if (window.navigator.geolocation && !ispc()) {
        var options = {
            enableHighAccuracy: true,
        };
        window.navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);
    } else {
        handleSuccess();
    }
    $("#allmap").height($(window).height());
    var slidTag = true;

    $('#btn').on('click', function () {
        var _a = slidTag ? '-4.3rem' : '0';

        // $('.map-footer').animate({bottom: _a},1000,'swing',function (){
        //     slidTag = !slidTag;
        // });
        $('.map-footer').animate({ bottom: _a }, 'linear', function () {
            slidTag = !slidTag;
        });
    });
});

function line(map, mold, starting, ending) {
    map.clearOverlays();
    var time = 0, transit_distance = 0, walking_distance = 0, transitWalk = "";
    switch (mold) {
        case "transit":
            var transit = new BMap.TransitRoute(map, {
                renderOptions: { map: map },
                onSearchComplete: function (result) {
                    if (transit.getStatus() != BMAP_STATUS_SUCCESS) {
                        return;
                    }
                    if (result.getPlan(0)) {
                        var plan = result.getPlan(0);
                        var transitWalk = 0;
                        for (var i = 0; i < plan.getNumRoutes(); i++) {
                            transitWalk += plan.getRoute(i).getDistance(false);
                        }
                        $("#time").text(plan.getDuration(true));
                        $("#transit").text(plan.getDistance(true));
                        $("#walking").text("步行" + transitWalk+'米');
                    }else {
                        $("#time").text('');
                        $("#transit").text('没有相关公交线路');
                    }

                }
            });
            transit.search(starting, ending);
            break;
        case "drive":
            var driving = new BMap.DrivingRoute(map, {
                renderOptions: { map: map, autoViewport: true },
                onSearchComplete: function (result) {
                    if (driving.getStatus() != BMAP_STATUS_SUCCESS) {
                        return;
                    }
                    var plan = result.getPlan(0);
                    $("#time").text(plan.getDuration(true));
                    $("#transit").text(plan.getDistance(true));
                    $("#walking").text("");
                }
            });
            driving.search(starting, ending);
            break;
        case "walk":
            var walking = new BMap.WalkingRoute(map, {
                renderOptions: { map: map, autoViewport: true },
                onSearchComplete: function (result) {
                    if (walking.getStatus() != BMAP_STATUS_SUCCESS) {
                        return;
                    }
                    var plan = result.getPlan(0);
                    $("#time").text(plan.getDuration(true));
                    $("#transit").text(plan.getDistance(true));
                    $("#walking").text("");
                }
            });
            walking.search(starting, ending);
            break;
    }
}


//解析定位错误信息
function onError(data) {
    //document.getElementById('tip').innerHTML = '定位失败';
}

//秒转时分秒
function formatSeconds(value) {
    var theTime = parseInt(value);// 秒
    var theTime1 = 0;// 分
    var theTime2 = 0;// 小时
    // alert(theTime);
    if (theTime > 60) {
        theTime1 = parseInt(theTime / 60);
        theTime = parseInt(theTime % 60);
        // alert(theTime1+"-"+theTime);
        if (theTime1 > 60) {
            theTime2 = parseInt(theTime1 / 60);
            theTime1 = parseInt(theTime1 % 60);
        }
    }
    var result = "" + parseInt(theTime) + "秒";
    if (theTime1 > 0) {
        result = "" + parseInt(theTime1) + "分";
    }
    if (theTime2 > 0) {
        result = "" + parseInt(theTime2) + "小时" + result;
    }
    return result;
}

function unit(num) {
    var result = (num / 1000).toFixed(2) + "公里";
    return result;
}

function handleSuccess(position) {
    var map = new BMap.Map("allmap");
    var point = new BMap.Point(116.331398, 39.897445);
    map.centerAndZoom(point, 12);
    var startlocation = [];
    // 获取到当前位置经纬度  本例中是chrome浏览器取到的是google地图中的经纬度
    if (typeof position == "undefined") {
        var geolocation = new BMap.Geolocation();
        geolocation.getCurrentPosition(function (r) {
            if (this.getStatus() == BMAP_STATUS_SUCCESS) {
                var mk = new BMap.Marker(r.point);
                map.addOverlay(mk);
                map.panTo(r.point);
                startlocation = [r.point.lng, r.point.lat];
                showmap(map, startlocation);
            }
            else {
                alert('failed' + this.getStatus());
            }
        }, { enableHighAccuracy: true });
    } else {
        startlocation = [position.coords.longitude, position.coords.latitude];
        showmap(map, startlocation);
    }

}

function showmap(map, startlocation) {
    $("#addr").text($("header").data("address"));
    //console.log(data.lonlat);
    //console.log(startlocation);
    var endlocation = $("header").data("location").split(",");
    //console.log(endlocation.join(","));
    var p1 = new BMap.Point(startlocation[0], startlocation[1]);
    var p2 = new BMap.Point(endlocation[0], endlocation[1]);
    //lonlat=[120.112679,30.291856];
    line(map, "transit", p1, p2);
    var mold = "transit";
    $("#travel").find("a").click(function () {
        mold = $(this).data("mold");
        $("#travel").find("a").removeClass("hover");
        $(this).addClass("hover");
        line(map, mold, p1, p2);
    });
    $(".refresh-btn").click(function () {
        line(map, mold, p1, p2);
    });
}

function handleError(error) {

}