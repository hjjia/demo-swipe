/**
 * Created by huangjiajia on 2016/11/3.
 * Description: swipe-app
 */
(function(win){
    // create controductor function
    function Slider(opts) {
        this.wrap       = opts.dom;
        this.list       = opts.list;
        this.type       = opts.type || 1;
        this.pagination = opts.pagination;
        this.loop       = opts.loop;
        this.seconds    = opts.seconds || 1000;

        // initialize some variables
        this.init();

        // render DOM Tree
        this.renderDOM();

        // all logic methods and shift slide functions
        this.bindDOM();

    }

    /**
     * initialize some variables
     */
    Slider.prototype.init = function () {
        // calculate the radio of the view
        this.radio = this.wrap.offsetHeight / this.wrap.offsetWidth;

        // the width of every slide
        this.scaleW = this.wrap.offsetWidth;

        // the index of the current swipe-item
        this.loop ? this.idx = 1: this.idx = 0;

        // the sign of loop
        this.loopThread = null;
        this.paused     = false;


    };

    /**
     * render DOM Tree
     * this.type = 1: render swipe HTML dynamic
     * this.type = 2: swipe HTML has been existed
     */
    Slider.prototype.renderDOM = function () {

        var $wrap = this.wrap,
            data  = this.list,
            len   = data.length,
            scale = this.scaleW;

        switch (this.type) {
            case 1:
                this._renderCreateDOM(data);
                break;
            case 2 :
            default:
                this.outer = $wrap.getElementsByClassName('swipe-wrapper')[0];
        }

        // create paiginations
        if(this.pagination) {
            this._createPagination(this.pagination);
        }

        // if loop == true
        this.loop && (this.isLoopIndex());
    };

    /**
     * all logic methods and shift slide functions
     */
    Slider.prototype.bindDOM = function () {
        var $this  = this,
            data   = $this.list,
            len    = data.length,
            scale  = $this.scaleW,
            $outer = $this.outer,
            lis    = $outer.getElementsByClassName('swipe-item');

        // if loop
        $this.loop && ($this.setLoop());

        var startHandler = function (evt) {

            $this.paused = true;

            // 滑动的时候清除loop
            $this.loop && $this.loopThread && (clearInterval($this.loopThread), $this.loopThread = null);

//			console.log($this.idx, '--------------------')

            // 记录当前手指的位移
            $this.startX = evt.touches[0].pageX;

            $this.startY = evt.touches[0].pageY;

            $this.offsetX = 0;

            $this.startTime = new Date() * 1;
        };

        var moveHandler = function (evt) {
            evt.preventDefault(); // 阻止浏览器的默认事件 如果 切换到下一页

            $this.offsetX = evt.touches[0].pageX - $this.startX;

            $outer.style.webkitTransform = 'translate3d(' + (-$this.idx * scale + $this.offsetX) + 'px, 0, 0)';
            $outer.style.webkitTransition = 'none';

        };

        var endHandler = function (evt) {

            // 判断是否切换
            var boundary = scale / 6,
                endTime  = new Date() * 1;

            // slide quickly
            if(endTime - $this.startTime < 250) {
                if($this.offsetX > 50) {
                    $this.go('-1', 'prev');
                }
                else if($this.offsetX < -50) {
                    $this.go('+1', 'next');
                }
                else {
                    $this.go('0', 'current');
                }
            }
            else {
                if($this.offsetX >= boundary) {

                    // prev
                    $this.go('-1', 'prev');

                }
                else if ($this.offsetX < -boundary) {

                    // next
                    $this.go('+1', 'next');
                }
                else {

                    // current
                    $this.go('0', 'current');
                }

            }

//			$this.loop && !$this.loopThread && (setTimeout(function(){$this.setLoop();console.log($this.loopThread,'pppp')},$this.seconds));

            console.log($this.idx,'ooooooooooooooooooooooooo')
            $this.loop && !$this.loopThread && ($this.setLoop());
        };

        $outer.addEventListener('touchstart', startHandler);
        $outer.addEventListener('touchmove', moveHandler);
        $outer.addEventListener('touchend', endHandler);
    };

    Slider.prototype.go = function (num, type) {
        var self        = this,
            outer       = self.outer,
            lis         = outer.getElementsByClassName('swipe-item'),
            len         = lis.length,
            idx         = self.idx,
            cidx        = 0,
            scale       = self.scaleW,
            direction   = type && self.getDirection(type) * 1,
            moveOffsetX = 0,
            $pagination,
            i           = 0,
            activeIndex = 0;

        console.log(idx,'yyyyyy')

        self.pagination && ($pagination = self.wrap.getElementsByClassName(self.pagination)[0].getElementsByClassName('swipe-pagination-item'));

        var setIndex = function(idx) {
            // 根据num判断是上一页、下一页、当前
            // 如果是数字，就直接跳到第num页
            if(typeof num == 'number') {
                cidx = idx;
            }
            else if(typeof num == 'string') {
                cidx = idx + num * 1;

                console.log(cidx,'ppppppppppppppppppppppppppp',idx,type,num*1)
            }

            // 判断是否溢出
            if (cidx < 0) {
                cidx = 0;
            }
            else if (cidx > len - 1) {
                cidx = len - 1;
            }

            moveOffsetX = -self.idx * scale;

            self.idx = cidx;
            console.log(self.idx,'self.idx')
        };

        setIndex(idx);

        outer.style.webkitTransform = 'translate3d(' + (-self.idx * scale) + 'px, 0, 0)';
        outer.style.webkitTransition = '-webkit-transform 0.2s ease-out';
        setTimeout(function () {
            outer.style.webkitTransition = '-webkit-transform 0s ease-out';

            if(self.loop && cidx == len - 1) {
                self.idx = cidx = 1;
                outer.style.webkitTransform = 'translate3d(' + (-self.idx * scale) + 'px, 0, 0)';
                updateStatus();

                console.log(self.paused,'paused');
                !self.paused && (self.idx = cidx = cidx + 1);

                self.paused = false;
            }
            else if(self.loop && cidx == 0) {
                self.idx = cidx = len - 2;
                outer.style.webkitTransform = 'translate3d(' + (-self.idx * scale) + 'px, 0, 0)';
                updateStatus();

//				self.idx = cidx = cidx - 1;
            }

        },200);

        // 更新各个数据
        var updateStatus = function () {
            activeIndex = lis[cidx].getAttribute('data-slide-index');
            for(i = 0; i < $pagination.length; i ++ ) {
                $pagination[i].className           = 'swipe-pagination-item';
                $pagination[activeIndex].className = 'swipe-pagination-item active';
            }

            // 添加标识
            for(i = 0; i < len; i ++) {
                lis[i].className = 'swipe-item';
            }

//			type == 'next' ? lis[((cidx - 1) % len)] && (lis[((cidx - 1) % len)].className = 'swipe-item swipe-item-prev')
//					: lis[((cidx - 1) % len)] && (lis[((cidx - 1) % len)].className = 'swipe-item swipe-item-next');
//			type == 'next' ? lis[((cidx + 1) % len)] && (lis[((cidx + 1) % len)].className = 'swipe-item swipe-item-next')
//					: lis[((cidx + 1) % len)] && (lis[((cidx + 1) % len)].className = 'swipe-item swipe-item-prev');
            lis[((cidx - 1) % len)] && (lis[((cidx - 1) % len)].className = 'swipe-item swipe-item-prev');
            lis[((cidx + 1) % len)] && (lis[((cidx + 1) % len)].className = 'swipe-item swipe-item-next');
            lis[cidx].className = 'swipe-item swipe-item-active';
        };

        updateStatus();

    };

    Slider.prototype._setDomPosition = function () {

    };

    Slider.prototype.getDirection = function (type) {
        var direction = 0;

        switch (type) {
            case 'prev':
                direction = +1;
                break;
            case 'next':
                direction = -1;
                break;
            case 'current':
                direction = 1;
                break;
        }

        return direction;
    };

    Slider.prototype._renderCreateDOM = function (imgArr) {
        var len   = imgArr.length,
            data  = imgArr,
            scale = this.scaleW,
            wrap  = this.wrap;

        this.outer = document.createElement('ul');

        for(var i = 0; i < len; i++) {
            var li = document.createElement('li');
            var item = data[i];

            li.className   = 'swipe-item';
            li.style.width = scale + 'px';
//			li.setAttribute('data-slide-index', i);

            if(item) {
                if(item['height'] / item['width'] > this.radio) {
                    li.innerHTML = '<div class="div-img" style="height:' + this.wrap.offsetHeight + ';"> '+ item.img + ' </div>'
                }
                else {
                    li.innerHTML = '<div class="div-img" style="width:' + this.wrap.offsetWidth + ';">' + item.img + '</div>';
                }
            }
            this.outer.appendChild(li);
        }

        this.outer.className = "swipe-wrapper";
        this.outer.style.width = scale + 'px';

        wrap.style.height = window.innerHeight + 'px';
        wrap.appendChild(this.outer);
    };

    Slider.prototype.isLoopIndex = function () {
        var lis = this.outer.getElementsByClassName('swipe-item'),
            len = lis.length,
            liLast,
            liFirst,
            scale = this.scaleW;

        // 最前面复制最后一张图片，最后面复制第一张图片，this.dom 像左移scale px
        liFirst = lis[0].cloneNode();
        liLast  = lis[len - 1].cloneNode();

        liFirst.innerHTML = lis[0].innerHTML;
        liLast.innerHTML  = lis[len - 1].innerHTML;

        this.outer.insertBefore(liLast, lis[0]);
        this.outer.appendChild(liFirst);

        this.outer.style.webkitTransform = 'translate3d(' + (-scale) + 'px, 0, 0)';
    };

    Slider.prototype._createPagination = function (pagination) {
        var self        = this,
            outer       = self.outer,
            lis         = outer.getElementsByClassName('swipe-item'),
            len         = lis.length,
            $pagination = self.wrap.getElementsByClassName(pagination)[0],
            i           = 0;

        for(i = 0; i < len; i ++) {
            var bullet = document.createElement('span');

            bullet.className = 'swipe-pagination-item';
            bullet.setAttribute('data-slide-index',i);

            i == 0 && (bullet.className = 'swipe-pagination-item active');
            $pagination.appendChild(bullet);

            lis[i].setAttribute('data-slide-index', i);
        }

        lis[0].className = 'swipe-item swipe-item-active';
        lis[1] && (lis[1].className = 'swipe-item swipe-item-next');
    };

    Slider.prototype.setLoop = function () {
        var $this   = this,
            seconds = $this.seconds,
            len     = $this.outer.getElementsByClassName('swipe-item').length,
            isFirst = true;

        this.loopThread = setInterval(function () {
//			console.log('jjjjj')
            $this.go($this.idx, 'next');
            $this.idx = ($this.idx + 1) % len;

        }, seconds);
    };

    win.Swipe = Slider;
})(window);
