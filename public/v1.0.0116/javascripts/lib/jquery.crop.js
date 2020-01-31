/*
 * 移动端头像裁剪插件
 * 整理：呼和浩特米米乐乐高儿童科技中心
 * http://baby.memiler.com/index.php?s=/wap
 */
(function ($) {
	$.fn.crop = function (options) {
		var v = {
			w: 320,
			h: 320,
			r: 120,
			res: '',
			barHeight: 50,
			touchBgColor: '#58d82c',
			isCircle: true,
			angle: 0,

			initialScale: 1,
			callback: function (base64Data) { }
		}
		var o = $.extend(v, options);
		//重加载时移除
		$(this).html('');
		//如果盒子高度少于宽度提醒设置错误
		if (o.h < o.w) {
			alert('容器区域高度须大于等于宽度！');
			return false;
		}
		//如果半径大于盒子宽度的一半，则提醒，用在手机上加限制
		if (o.r > o.w * 0.5) {
			alert('请在手机上浏览或将浏览器宽度调整到高度二分之一以下！');
			return false;
		}
		var box = $(this);
		if (!box.attr('id')) {
			id = 'curbox' + Date.parse(new Date());
			box.attr('id', id);
		} else {
			id = box.attr('id');
		}
		var first = true;
		var element, img, edit_finished, select_img, $video;
		//全局变量
		var x = 0, y = 0, _x = 0, scale = v.initialScale, gx = 0, gy = 0, p_left = 0, p_top = 0,
			gw, gh, ngw, ngh,
			base64Data = '',
			t;
		var pos = new Object();

		//获取图片信息
		var image = new Image();
		if (o.res == '') {
			var canvasText = $("<canvas />").attr({
				width: o.r * 2,
				height: o.r * 2
			}).get(0);
			cvt = canvasText.getContext("2d");
			// cvt.font = "16px '宋体'";
			// cvt.fillStyle = '#f66';
			// cvt.fillText('请先上传一张图片',o.r-64,o.r);
			o.res = canvasText.toDataURL('image/png');
		}
		image.src = o.res;
		image.onload = function () {
			//添加盒子内元素
			if (box.html() != '') {
				first = false;
				// $(select_btn).text('重选');
				gx = (o.w - o.r * 2) * 0.5;
				gy = (o.h - o.r * 2) * 0.5;
			} else {
				box.append('\
					<canvas id="temp-img" style="display:block;"></canvas>\
					\
				');
				//设置盒子样式
				box.css({
					"width": o.w + "px",
					"height": o.h + "px",
					"position": "fixed",
					"left": "0px",
					"top": "0px",
					"overflow": "hidden"
				});

				// 处理拍照兼容
				var info = navigator.userAgent.toLocaleLowerCase();
				// if (info.match(/iphone/i)) {
				// 	captureStr = '';
				// }

				// box.after('<div style="height:' + v.barHeight + 'px;width:100%;position:absolute;bottom:0px;"><a id="select_btn" class="choose">上传图片</a><a id="edit_finished" class="clipBtn">完成</a><input type="file" name="file" id="selectImageFile" accept="image/*" ' + captureStr + ' style="height:0px;width:0px;border:0px;display:none;" /></div>');
				box.after('<div style="height:' + v.barHeight + 'px;width:100%;position:absolute;bottom:0px;display:none">'
					+ '<a id="select_btn" class="choose">上传图片</a><a id="edit_finished" class="clipBtn">完成</a>'
					+ '<input type="file" name="file" id="openCamera" accept="image/*" capture="camera" style="height:0px;width:0px;border:0px;display:none;" />'
					+ '<input type="file" name="file" id="selectImageFile" accept="image/*" style="height:0px;width:0px;border:0px;display:none;" />'
					+ '</div>');

				//初始化设置遮罩
				// var mask = document.getElementById('canvas-mask');

				// var msk = mask.getContext('2d');
				// mask.width = o.w;
				// mask.height = o.h;

				//画遮罩矩形
				// msk.beginPath();
				// msk.rect(0, 0, o.w, o.h);
				// msk.globalAlpha = 0.8;
				// msk.fill();//画实心圆
				// msk.closePath();

				o.h = first ? o.h - o.barHeight : o.h;//重置高度
				//画一个实心圆
				// msk.globalCompositeOperation = 'destination-out';
				// msk.beginPath();
				// msk.arc(o.w * 0.5, o.h * 0.5, o.r, 0, (Math.PI / 180) * 360, false);//圆形选框
				// msk.fill();
				// msk.closePath();
				//实心矩形
				// msk.beginPath();
				// msk.rect((o.w - o.r * 2) * 0.5, (o.h - o.r * 2) * 0.5, o.r * 2, o.r * 2);//矩形选框
				// msk.fill();
				// msk.closePath();

				//画矩形选框
				// msk.globalCompositeOperation = 'source-over';
				// msk.beginPath();
				// msk.lineWidth = 1;//外框
				// msk.strokeStyle = "#ffffff";//外框
				// msk.strokeRect((o.w - o.r * 2) * 0.5, (o.h - o.r * 2) * 0.5, o.r * 2, o.r * 2);//矩形选框
				// msk.fill();
				// msk.closePath();
				//绘制线条
				// msk.beginPath();
				// msk.moveTo((o.w - o.r * 2) * 0.5 + o.r * 2 / 3 + 0.5, (o.h - o.r * 2) * 0.5);
				// msk.lineTo((o.w - o.r * 2) * 0.5 + o.r * 2 / 3 + 0.5, (o.h - o.r * 2) * 0.5 + o.r * 2); //竖线1
				// msk.moveTo((o.w - o.r * 2) * 0.5 + 2 * o.r * 2 / 3 + 0.5, (o.h - o.r * 2) * 0.5);
				// msk.lineTo((o.w - o.r * 2) * 0.5 + 2 * o.r * 2 / 3 + 0.5, (o.h - o.r * 2) * 0.5 + o.r * 2); //竖线2
				// msk.moveTo((o.w - o.r * 2) * 0.5, (o.h - o.r * 2) * 0.5 + o.r * 2 / 3 + 0.5);
				// msk.lineTo((o.w - o.r * 2) * 0.5 + o.r * 2, (o.h - o.r * 2) * 0.5 + o.r * 2 / 3 + 0.5); //竖线2
				// msk.moveTo((o.w - o.r * 2) * 0.5, (o.h - o.r * 2) * 0.5 + 2 * o.r * 2 / 3 + 0.5);
				// msk.lineTo((o.w - o.r * 2) * 0.5 + o.r * 2, (o.h - o.r * 2) * 0.5 + 2 * o.r * 2 / 3 + 0.5); //竖线2
				// msk.stroke();
				// msk.closePath();

				gw = image.width,
					gh = image.height,
					ngw = image.width,
					ngh = image.height,

					//矩形选框位置参数
					// 	pos.l = (o.w - o.r * 2) * 0.5;
					// pos.t = (o.h - o.r * 2) * 0.5;
					// pos.r = (o.w - o.r * 2) * 0.5 + o.r * 2;
					// pos.b = (o.h - o.r * 2) * 0.5 + o.r * 2;

					element = document.getElementById(id);
				$video = $('#videoArea');
				img = document.getElementById('cut-img');
				select_btn = document.getElementById('select_btn');
				edit_finished = document.getElementById('edit_finished');

				$video.append('\
				<video id="cut-video" style="width:100%"></video>\
				<div class="cut-video-tool" id="cutVideoTool"><div class="cut-video-btn" id="cutVideoBtn"><div class="centerCircle"></div></div><div id="cutVideoClose" class="cut-video-close">取消</div></div>\
				');
				// $(img).css({'background-position':(o.w-o.r*2)*0.5+'px '+(o.h-o.r*2)*0.5+'px'});
				$(img).css({ 'background-position': 'center center' });
			}

			if (first) {
				//触控移动 
				touch.on('#' + id, 'touchstart', start);
				touch.on('#' + id, 'drag', move);
				touch.on('#' + id, 'dragend', end);
				//触控缩放
				touch.on('#' + id, 'pinchstart', startscale);
				touch.on('#' + id, 'pinch', movescale);
				touch.on('#' + id, 'pinchend', endscale);

				//按钮事件
				$('#select_btn').unbind('click').click(function () {
					// $('#selectImageFile').trigger('click');
					var $this = $(this);
					var $selectImageFile = $('#selectImageFile');
					invokingCarera();
					// $('#selectImageFile').unbind('click').click();


					setTimeout(function () {
						if ($('#videoArea').css('display') === 'none' && $this.data('suport') == 0) {
							typeof cameraType !== 'undefined' && cameraType === 'card'
								? $('#selectImageFile').trigger('click')
								: $('#openCamera').trigger('click');
						}
					}, 500);
				});

				$('#edit_finished').click(function () {
					submitBase64();
				});

				$('#selectImageFile,#openCamera').change(function (event) {
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
					// $(".msg").addClass('ord').html('请稍等图片加载中,请调整头像处于居中位置').show().addClass('show');
					if (window.FileReader) {
						var reader = new FileReader();
						reader.onloadstart = function (e) {
							console.log('开始读取图片');
							console.log(e);
						}
						reader.readAsDataURL(file);
						reader.onload = function (e) {
							// console.log(this)
							//var blob = URL.createObjectURL(file);  
							//_compress(blob, file, basePath);  
							console.log(e)
							var image = new Image();
							image.src = e.target.result;
							image.onload = function () {
								resetImg(image, file, Orientation);
							}
						}
					}
				});
			}
			//重置图片
			function resetImg(source_img, file, Orientation) {

				// if(source_img.naturalWidth<o.r*2 || source_img.naturalHeight<o.r*2){
				// 	alert('图片尺寸太小，请重新选择不小于'+o.r*2+'*'+o.r*2+'像素大小的图片');
				// }else{
				var quality = 0.7;
				var newImgData = compress(source_img, quality, file, Orientation);
				// var new_img = new Image();
				// new_img.src = newImgData;
				// document.getElementById('showImg').appendChild(new_img)

				o.callback(newImgData, 0.7);
				// new_img.onload = function () {
				// 	if (new_img.width > o.r * 2 * 2 && new_img.height > o.r * 2 * 2) {
				// 		gw = ngw = new_img.width / 2;
				// 		gh = ngh = new_img.height / 2;
				// 	} else {
				// 		gw = ngw = new_img.width;
				// 		gh = ngh = new_img.height;
				// 	}

				// 	image.src = newImgData;

				// 	$(img).css({
				// 		'background-image': 'url(' + newImgData + ')',
				// 		'background-size': ngw + 'px ' + ngh + 'px'
				// 	});
				// 	$(".msg").hide();
				// 	//layer.closeAll();

				// }

				// }
			}
			//压缩图片,若压缩后失真严重，可以把此函数换成压缩包里的本地图片压缩插件
			function compress(source_img, quality, file, Orientation) {
				if (typeof cameraType !== 'undefined' && cameraType === 'card') {
					var MaxW = 1200, MaxH = 1200;
				} else {
					var MaxW = 600, MaxH = 600;
				}

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

					/*var mpImg = new MegaPixImage(image); 
					mpImg.render(canvas, { 
						maxWidth: 800, 
						maxHeight: 1200, 
						quality: 0.8, 
						orientation: 8 
					});*/
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

			//触控移动
			function start(event) {
				event.preventDefault();
			}
			function move(event) {
				event.preventDefault();
				if (first) {
					return;
				}

				//定位 防止超出选区
				p_left = gx + event.x;
				p_top = gy + event.y;
				if (p_left > pos.l) {
					p_left = pos.l;
				}
				if (p_top > pos.t) {
					p_top = pos.t;
				}
				if (p_left + ngw < pos.r) {
					p_left = pos.r - ngw + 1;
				}
				if (p_top + ngh < pos.b) {
					p_top = pos.b - ngh + 1;
				}

				$('#cut-img').css({
					'background-position': p_left + 'px ' + p_top + 'px',
					'background-repeat': 'no-repeat'
				});
			}
			function end(event) {
				gx = p_left;
				gy = p_top;
			}


			//触控缩放
			function startscale(event) {
				event.preventDefault();
			}
			function movescale(event) {
				event.preventDefault();
				if (first) {
					return;
				}

				scale = event.scale;
				scale = scale > 3 ? 3 : scale;
				scale = scale < 0 ? 0 : scale;

				if (gw * scale >= o.r * 2 && gh * scale >= o.r * 2) {
					ngw = gw * scale;
					ngh = gh * scale;

					//定位 防止超出选区
					p_left = gx * scale;
					p_top = gy * scale;
					p_left = p_left - (ngw - gw) / 2;
					p_top = p_top - (ngh - gh) / 2;

					if (p_left > pos.l) {
						p_left = pos.l;
					}

					if (p_top > pos.t) {
						p_top = pos.t;
					}
					//宽度小于选区
					if (p_left + ngw < pos.r) {
						p_left = pos.r - ngw + 1;
					}
					//高度小于选区
					if (p_top + ngh < pos.b) {
						p_top = pos.b - ngh + 1;
					}

					$('#cut-img').css({
						'background-size': ngw + 'px ' + ngh + 'px',
						// 'background-position':p_left+'px '+p_top+'px',
						'background-position': 'center center',
						'background-repeat': 'no-repeat'
					});
				}
			}
			function endscale(event) {
				var xy = $(img).css('background-size');
				var arr = xy.split(' ');
				gx = parseInt($(img).css('background-position-x'));
				gy = parseInt($(img).css('background-position-y'));
				gw = parseInt(arr[0]);
				gh = parseInt(arr[1]);
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
				//img.setAttribute('step', step);    
				/*var canvas = document.getElementById('pic_' + pid);   
				if (canvas == null) {   
					img.style.display = 'none';   
					canvas = document.createElement('canvas');   
					canvas.setAttribute('id', 'pic_' + pid);   
					img.parentNode.appendChild(canvas);   
				}  */
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

			//保存提交图片Base64数据
			function submitBase64() {
				if (first) {
					alert('请先上传一张图片');
					return;
				}
				var canvas = $("<canvas />").attr({
					width: o.r * 2,
					height: o.r * 2
				}).get(0);
				canvasContext = canvas.getContext("2d");
				canvasContext.fillStyle = "#eee";
				canvasContext.fillRect(0, 0, canvas.width, canvas.height);

				var cx = (o.w * 0.5 - o.r - gx) * image.width / gw,
					cy = (o.h * 0.5 - o.r - gy) * image.height / gh,
					cw = o.r * 2 * image.width / gw,
					ch = o.r * 2 * image.height / gh;

				var nx = ny = nw = nh = 0;
				var dx = dy = dw = dh = 0;
				if (cx < 0) {
					nx = 0;
					if (cx + cw < image.width) {
						nw = cx + cw;
					} else {
						nw = image.width;
					}
				} else {
					nx = cx;
					if (cx + cw < image.width) {
						nw = cw;
					} else {
						nw = image.width - cx;
					}
				}

				if (cy < 0) {
					ny = 0;
					if (cy + ch < image.height) {
						nh = cy + ch;
					} else {
						nh = image.height;
					}
				} else {
					ny = cy;
					if (cy + ch < image.height) {
						nh = ch;
					} else {
						nh = image.height - cy;
					}
				}
				//alert(nx +'>'+ ny  +'>'+ nw+'>'+ nh);
				dx = (cx < 0 ? -cx : 0) * gw / image.width;
				dy = (cy < 0 ? -cy : 0) * gh / image.height;
				dw = (nw * gw / image.width < o.r * 2 ? nw * gw / image.width : o.r * 2);
				dh = (nh * gh / image.height < o.r * 2 ? nh * gh / image.height : o.r * 2);

				canvasContext.drawImage(
					image,
					nx,
					ny,
					nw,
					nh,
					dx,
					dy,
					dw,
					dh
				);
				o.callback(canvas.toDataURL("image/jpeg", 0.7));
			}

			window.navigator.getUserMedia = navigator.getUserMedia || navigator.webKitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

			function invokingCarera() {
				var userCardType = !!(typeof cameraType !== 'undefined' && cameraType === 'card') // 是否为身份证识别

				if (typeof isAli !== 'undefined' && isAli === 'T') { // 支付宝环境打开页面
					ap.chooseImage({ count: 1, sourceType: (userCardType ? ['camera', 'album'] : ['camera']), publicDomain: false, useFrontCamera: !userCardType, allowEdit: true }, function (result) {
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
						image.onload = function () {
							resetImg(image);
						}
						image.src = apFilePath[0];
					});
				}
				else {
					if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia && location.protocol === 'https:' && !userCardType) {
						navigator.mediaDevices.getUserMedia({
							'video': {
								facingMode: "user"
							}//调用前置摄像头，后置摄像头使用video: { facingMode: { exact: "environment" } }
						})
							.then(function (mediaStream) { getVideoStream(mediaStream) })
							.catch(getFail)
					} else if (navigator.getUserMedia && location.protocol === 'https:' && !userCardType) {
						navigator.getUserMedia({
							'video': true,
						}, getVideoStream, getFail)
					} else {
						// $('#selectImageFile').trigger('click');
						$('#select_btn').data('suport', '0')
						// alert('不支持摄像头调用！')
					}
				}

			}

			function getFail(error) {
				// console.log(error)
				// for(let i in error){
				// 	alert(error[i])
				// }
				// $('#selectImageFile').trigger('click');
				$('#select_btn').data('suport', '0')
			}

			function getVideoStream(stream) {
				$('#videoArea').show();
				var video = document.getElementById('cut-video');
				var canvas = document.createElement('canvas');
				var context = canvas.getContext('2d');
				var winHeight = $(window).height();

				video.srcObject = stream;
				video.play();
				$('#cutVideoBtn').click(function () {
					canvas.height = video.offsetHeight;
					canvas.width = video.offsetWidth;
					context.clearRect(0, 0, canvas.width, canvas.height);
					context.drawImage(video, 0, 0, canvas.width, canvas.height)
					// $('#videoArea').html('<img src=' + canvas.toDataURL("image/jpeg", 0.7) + '>')
					try {
						stream.getTracks()[0].stop();
					} catch (error) {
						console.log(error)
					}
					$('#cutVideoBtn').unbind('click')
					o.callback(canvas.toDataURL("image/jpeg", 0.7));
				})
				$('#cutVideoClose').click(function () {
					$('#videoArea').hide();
					$('#cutVideoBtn').unbind('click');
					try {
						stream.getTracks()[0].stop();
					} catch (error) {
						console.log(error)
					}
				})

				$('#cutVideoTool').height((winHeight - ($(window).width() * 1.2)))
			}
		}
	}
})(jQuery);