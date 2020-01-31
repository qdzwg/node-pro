$(function(){
    if($('.scroll-box').length > 0){
        var winWidth = $(window).width(),            
            step = 1,   
            $this = document.querySelector('.scroll-box'),   
            itemWidth = $('.scroll-box').outerWidth(),           
            scrollWidth = $this.scrollWidth;
            var timer = 'timer'
        if(itemWidth >= winWidth-100){
            $this.innerHTML += $this.innerHTML;
        }
        timer = setInterval(function () {
            $this.scrollLeft += step;
            if ($this.scrollLeft >= scrollWidth) $this.scrollLeft = 0
        }, 50);
    }
})