if($.validator){
    $.validator.prototype.elements = function () {
        var validator = this,
            rulesCache = {};
        // Select all valid inputs inside the form (no submit or reset buttons)
        return $( this.currentForm )
            .find( "input, select, textarea, [contenteditable]" )
            .not( ":submit, :reset, :image, :disabled" )
            .not( this.settings.ignore )
            .filter( function() {
                var name = this.id || this.name || $( this ).attr( "name" ); // For contenteditable
                if ( !name && validator.settings.debug && window.console ) {
                    console.error( "%o has no name assigned", this );
                }
                
                // Set form expando on contenteditable
                if ( this.hasAttribute( "contenteditable" ) ) {
                    this.form = $( this ).closest( "form" )[ 0 ];
                }

                // Select only the first element for each name, and only those with rules specified
                if (name in rulesCache || !validator.objectLength( $( this ).rules() ) ) {
                    return false;
                }
                rulesCache[ name ] = true;
                return true;
            } );
    }
}

// 手机号码校验
jQuery.validator.addMethod("isMobile", function(value, element) {
    var length = value.length;
    var mobile = /^(1[3-9][0-9]{9})$/;
    return this.optional(element) || (length == 11 && mobile.test(value));
}, "请正确填写您的手机号码");

// 电话号码校验
jQuery.validator.addMethod("isTel", function(value, element) {
    var tele = /^[0-9]*$/;
    return this.optional(element) || tele.test(value);
}, "请正确填写您的电话号码");

// 邮箱地址校验
jQuery.validator.addMethod("isMail", function(value, element) {
    var email = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/;
    return this.optional(element) || (email.test(value));
}, "请正确填写您的邮箱地址");

// 身份证号码验证
jQuery.validator.addMethod("isIdCardNo", function(value, element) {
    // var idCard = /^(\d{6})()?(\d{4})(\d{2})(\d{2})(\d{3})(\w)$/;
    return this.optional(element) || isIdCardNo(value);
}, "请输入正确的身份证号码");

// 银行卡验证
jQuery.validator.addMethod("isBankNo", function(value, element) {
    var bankNo= /^([1-9]{1})(\d{11,25})$/;
    return this.optional(element) || bankNo.test(value);
}, "请输入正确的银行卡号");

// 非法字符验证
jQuery.validator.addMethod("isIllegalChar", function(value, element) {
    var pattern = new RegExp("[`~!@#$^&*()=|{}':'\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'、？\\s]");
    return this.optional(element) || !pattern.test(value);
}, "输入包含非法字符");

// 防止代码块注入验证
jQuery.validator.addMethod("isCode", function (value, element) {
    var pattern = new RegExp("[`{}''<>/@#&{}]");
    return this.optional(element) || !pattern.test(value);
}, "输入包含非法字符");

jQuery.validator.addMethod("requir", function(value, element) {
    //var idCard = /^(\d{6})()?(\d{4})(\d{2})(\d{2})(\d{3})(\w)$/;
    return this.optional(element) || k(value);
}, "这是必填项。");

//汉字验证
jQuery.validator.addMethod("han", function(value, element) {
    var han = /^[\u4e00-\u9fa5]+$/
    return this.optional(element) || han.test(value);
}, "必须填写汉字");

//邮政编码
jQuery.validator.addMethod("isZipCode", function (value, element) {
    var tel = /^[0-9]{6}$/;
    return this.optional(element) || (tel.test(value));
}, "请正确填写您的邮政编码");


function k(value){
    if(value.replace(/^\s*/g,"")!=""){
        return true;
    }else{
        return false;
    }
}

//身份证验证
function isIdCardNo(ID) {
	if(typeof ID !== 'string') return '非法字符串';
    var city = {11:"北京",12:"天津",13:"河北",14:"山西",15:"内蒙古",21:"辽宁",22:"吉林",23:"黑龙江 ",31:"上海",32:"江苏",33:"浙江",34:"安徽",35:"福建",36:"江西",37:"山东",41:"河南",42:"湖北 ",43:"湖南",44:"广东",45:"广西",46:"海南",50:"重庆",51:"四川",52:"贵州",53:"云南",54:"西藏 ",61:"陕西",62:"甘肃",63:"青海",64:"宁夏",65:"新疆",71:"台湾",81:"香港",82:"澳门",91:"国外"};
    var birthday = ID.substr(6, 4) + '/' + Number(ID.substr(10, 2)) + '/' + Number(ID.substr(12, 2));
    var d = new Date(birthday);
    var newBirthday = d.getFullYear() + '/' + Number(d.getMonth() + 1) + '/' + Number(d.getDate());
    var currentTime = new Date().getTime();
    var time = d.getTime();
    var arrInt = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    var arrCh = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
    var sum = 0, i, residue;
  
    if(!/^\d{17}(\d|x)$/i.test(ID)) return false;
    if(city[ID.substr(0,2)] === undefined) return false;
    if(time >= currentTime || birthday !== newBirthday) return false;
    for(i=0; i<17; i++) {
      sum += ID.substr(i, 1) * arrInt[i];
    }
    residue = arrCh[sum % 11];
    if (residue !== ID.substr(17, 1).toUpperCase()) return false;
  
    return true;
}

