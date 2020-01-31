$(function () {

        //签到按钮拖拽
        //首先，设置cookie值，使到不同的页面刷新拖拽的按钮位置不会变
        function setCookie(name, value, expires) {
            // var oDate = new Date();
            // oDate.setDate(oDate.getDate() + expires);
            document.cookie = name + '=' + value;
        }
        function getCookie(name) {
            var arr = new Array();
            arr = document.cookie.split("; ");
            var i = 0;
            for (i = 0; i < arr.length; i++) {
                arr2 = arr[i].split("=");
                if (arr2[0] == name) {
                    return arr2[1];
                }
            }
            return '';
        }
        function removeCookie(name) {
            setCookie(name, '随便什么值，反正都要被删除了', -1);
        }
    //判断a和b的原因是第一次打开，cookie中并没有相应的参数，所以当有参数时执行，
    // a和b只需要判断一个就好了
    var dragBox = document.getElementById('menu');

    if (dragBox) {
        var a = getCookie('xPosition');
        var b = getCookie('yPosition');
        if (a) {
            dragBox.style.left = a + 'px';
            dragBox.style.top = b + 'px';
        }

        var hasMove = false; //是否被拖拽
        var location = { X: 'r', Y: 'b' } //t:top, b:bottom , l:left , r:right
        //拖拽中
        dragBox.addEventListener('touchmove', function (event) {
            hasMove = true;
            event.preventDefault();//阻止其他事件
            // 如果这个元素的位置内只有一个手指的话
            if (event.targetTouches.length == 1) {
                var touch = event.targetTouches[0];
                // 元素与手指位置同步
                dragBox.style.left = (touch.clientX + 12 - ($(dragBox).height())) + 'px';
                dragBox.style.top = (touch.clientY + 10 - ($(dragBox).width())) + 'px';
                dragBox.style.right = 'unset';
                dragBox.style.bottom = 'unset';
                //由于页面中会有滚动，所以在这不能用pageX和pageY,要用clientX  clientY

            }
        }, false);

        //拖拽结束，放手
        dragBox.addEventListener('touchend', function (event) {
            // 如果这个元素的位置内只有一个手指的话
            //拖拽结束，changedTouches列表是涉及当前事件的列表
            if (hasMove) {
                if (event.changedTouches.length == 1) {
                    var touch = event.changedTouches[0];
                    var _location = {};
                    var _width = $(dragBox).width();
                    var _height = $(dragBox).height();
                    var halfWidth = (window.innerWidth - _width) / 2;
                    var halfHeight = (window.innerHeight - _height) / 2; //顶部才做向下处理

                    //左边左贴边，右边右贴边
                    if (touch.clientX < 40) {
                        dragBox.style.left = 0 + 'px';
                    } else if (touch.clientX >= (window.innerWidth - _width - 30)) {
                        dragBox.style.left = (window.innerWidth - 30 - _width) + 'px';
                    }
                    if (touch.clientY < 30) {
                        dragBox.style.top = -10 + 'px';
                    } else if (touch.clientY >= window.innerHeight - _height - 30) {
                        dragBox.style.top = (window.innerHeight - _height - 90) + 'px';
                    }

                    // 处理弹框方向与文字方向
                    touch.clientX < halfWidth
                        ? _location.X = 'l'
                        : _location.X = 'r';
                    touch.clientY < halfHeight
                        ? _location.Y = 't'
                        : _location.Y = 'b';

                    if (location.X !== _location.X || location.Y !== _location.Y) {

                        var newClassName = 'mfb-component--' + _location.Y + _location.X,
                            oldClassName = 'mfb-component--' + location.Y + location.X;
                        dragBox.classList.remove(oldClassName);
                        dragBox.classList.add(newClassName);
                        location = _location;

                    }

                }

                dragBox.touchmove = null;
                dragBox.touchend = null;
                
            }

            hasMove = false // 重置

        }, false);
    }
});