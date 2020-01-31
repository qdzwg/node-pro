$(function () {
    //从本地缓存取省市县编码
    var _province = [],_city = [],_area = []; 
    var adressCode = getItem('adress_code');
    $.ajaxSetup({  
        async : false  
    });
    //绑定DOM
    var $D = {
        province: $('#addressForm').find('select[name=province]'),
        city: $('#addressForm').find('select[name=city]'),
        area: $('#addressForm').find('select[name=area]')
    }

    //从后台获取省市县数据  
    if (!adressCode || adressCode === 'undefined'||adressCode == null) {
        $.get('/order/getAreaCode/?m_id=' + merchantInfoId)
            .success(function (body) {
                //存储省市县编码
                setItem('adress_code', JSON.stringify(body[0]));
                adressCode = body[0];
                _province = filter(adressCode.data[0].pId,adressCode.data)
                _city = filter(_province[0].id, adressCode.data);
                _area = filter(_city[0].id, adressCode.data);
            })
            .error(function (err) {
                window.location.href = '/error?m_id=' + merchantInfoId;
            });
    } else {
        adressCode = JSON.parse(adressCode);
    }

    //筛选默认数据
    if(adressCode != null){
        _province = filter(adressCode.data[0].pId,adressCode.data);
        _city = filter(_province[0].id, adressCode.data);
        _area = filter(_city[0].id, adressCode.data);
    }
    
    //添加默认节点
    $D.province.html(addOptions(_province));
    $D.city.html(addOptions(_city));
    $D.area.html(addOptions(_area));

    //选择省后添加市区
    $D.province.change(function(item){
        var _this = $(this);
        var _provinceCode = _this.val();
        _city = filter(_provinceCode, adressCode.data);
        console.log(_provinceCode);
        $D.city.html(addOptions(_city));
        _area = filter($D.city.find("option:first").val(), adressCode.data);
        $D.area.html(addOptions(_area));
    })
    
    //选择市区后添加区
    $D.city.change(function (item) {
        var _this = $(this);
        var _cityCode = _this.val();
        _area = filter(_cityCode, adressCode.data);
        $D.area.html(addOptions(_area));
    })

    $(".moren").click(function(){
        $("#addressDetail").append($(this).prev().text())
    })
})

/**
 * 绑定数据
 * 
 * @param {Array} list 
 */
function addOptions(list){
    var dom = '';
    list.forEach(function(item){
        dom += '<option value='+item.id+'>'+item.name+'</option>'
    })
    return dom;
}
/**
 * 数组刷选
 * 
 * @param {string} option 刷选条件
 * @param {Array} terget 目标数组
 * @returns 
 */
function filter(option,terget){
    var res = new Array;
    terget.forEach(function (item) {
        if(item.pId === option) 
            res.push(item);
    })
    return res;
}
