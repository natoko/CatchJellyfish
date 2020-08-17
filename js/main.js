'use strict';

(() => {

  class Sea {
    constructor(canvas) {
      this.ctx =canvas.getContext('2d');
      this.width = canvas.width;
      this.height = canvas.height;
    }
    clearcanvas() {
      this.ctx.clearRect(0,0,this.width,this.height);
    }
    draw (alpha) {
      this.ctx.globalAlpha = alpha;
      this.drawsea();
      this.bubble(t);
      this.drawjellyfishs(t);
    }
    drawsea () {
      var seagradient = this.ctx.createLinearGradient(this.width/2,0, this.width/2,this.height);
      let g_count = 0;
      for (var g = 0; g <= 1; g+=0.2) {
        if (g_count % 2 === 0) {
          seagradient.addColorStop(g, 'rgb(197,240,255)');
        } else {
          seagradient.addColorStop(g, 'rgb(113,218,255)');
        }
        g_count++;
      }

      this.ctx.fillStyle = seagradient;
      this.ctx.fillRect(0,0, this.width,this.height);
    }
    // bubble
    bubble (t) {
      // bubble移動
      this.movebubble(t);
      // bubble描写
      this.drawbubble();
      // 上まで行ったbubbleを削除
      this.deletebubble();
    }

    addbubble(yint) {
      const xGap = Math.floor(Math.random() * (this.width - 200)) + 1;
      const yGap = this.height + 50 + (Math.floor(Math.random() * 30) + 1) - yint;
      const circle = (Math.floor(Math.random() * 10) + 1) + 3;
      return [xGap, yGap, circle];
    }

    movebubble(t) {
      bubbles.map((bubble) => {
        bubble[0]+=Math.sin(t);
        bubble[1]-=0.5;
        return bubble;
      });
    }

    drawbubble() {
      this.ctx.strokeStyle = 'rgb(255,255,255,0.6)';

      bubbles.forEach((bubble, bubbleindex) => {
        this.ctx.beginPath();
        this.ctx.arc(bubble[0],bubble[1], bubble[2], 0, 2*Math.PI);
        this.ctx.stroke();
      });
    }

    deletebubble() {
      bubbles = bubbles.filter((bubble) => {
        return bubble[1] > -(bubble[2] + 10);
      });
    }
    // jellyfishs
    addjellyfish(yint) {
      const j_select = Math.floor(Math.random() * jellyfish_data.length);
      const j_x = jellyfish_data[j_select][1];
      const j_y = jellyfish_data[j_select][2];
      let checkflg = 0;
      let xGap = 0;
      let yGap = 0;
      let loopcheck = 0;
      while (checkflg >= 0) {
        xGap = Math.floor(Math.random() * (this.width - 200)) + 50;
        yGap = this.height + (Math.floor(Math.random() * 30) + 1) - yint + loopcheck;
        checkflg = this.checkjellyfishpoint(xGap+j_x, yGap+j_y, 30);
        loopcheck++;
      }
      return [j_select, xGap, yGap, j_x, j_y];
    }
    checkjellyfishpoint (x,y,tra) {
      for (var j = 0; j < jellyfishs.length; j++) {
        let x_sub = Math.abs(x - (jellyfishs[j][1] + jellyfishs[j][3]));
        let y_sub = Math.abs(y - (jellyfishs[j][2] + jellyfishs[j][4]));
        if (Math.sqrt(x_sub**2 + y_sub**2) <= Math.sqrt((jellyfishs[j][3] + tra)**2)) {
          return j;
        }
      }
      return -1;
    }
    drawjellyfishs(t) {
      this.movejellyfish(t);
      jellyfishs.forEach((jellyfish) => {
        this.drawjellyfish(jellyfish);
        // hitpointcheck用
        // this.drawhitpoint(jellyfish);
      });
    }
    movejellyfish(t) {
      jellyfishs.map((jellyfish) => {
        jellyfish[1]+=Math.sin(t*1.5);
        jellyfish[2]-=2;
        return jellyfish;
      });
    }
    drawjellyfish(jellyfish) {
      const img = imgs[jellyfish[0]];
      // this.ctx.globalAlpha = 0.8;
      this.ctx.drawImage(
        img,
        // dx,dy,dWidth,dHeight
        jellyfish[1], jellyfish[2], img.naturalWidth, img.naturalHeight
      );
    }
    // hitpointcheck用
    // drawhitpoint(jellyfish) {
    //   this.ctx.fillStyle = 'rgb(0,0,0)';
    //   this.ctx.beginPath();
    //   this.ctx.arc(jellyfish[1] + jellyfish[3]-3, jellyfish[2] + jellyfish[4]-3, jellyfish[3], 0, 2*Math.PI);
    //   this.ctx.fill();
    // }
  }

  class Game {
    constructor(drawer) {
      this.drawer = drawer;
      // timer
      this.startTime = undefined;
      this.Timeleft = undefined;
      this.timeoutId = undefined;
    }
    gameinit () {
      bubbles = [];
      jellyfishs = [];

      // 最初のバブルをセット
      for (var b = 0; b < 30; b++) {
        let yint = (Math.floor(Math.random() * 500) + 1);
        bubbles.push(this.drawer.addbubble(yint));
      }
      // 最初のくらげをセット
      for (var j = 0; j < 5; j++) {
        let yint = (Math.floor(Math.random() * 300) + 1);
        jellyfishs.push(this.drawer.addjellyfish(yint));
      }
    }
    draw (alpha) {
      this.drawer.clearcanvas();
      this.drawer.draw(alpha);
    }
    setTimer() {
      // runtimer
      this.startTime = Date.now();
      this.Timeleft = 10.00;
    }
    playing () {
      if (!playflg) return;

      this.draw(1.0);
      this.update();

      // timerupdate
      this.Timeleft = (10 - ((Date.now() - this.startTime)/1000)).toFixed(2);
      if (this.Timeleft > 0) {
        const timeleft = this.Timeleft.split('.');
        timeleft[0] = ('00' + timeleft[0]).slice(-2);
        timeleft[1] = ('00' + timeleft[1]).slice(-2);
        timer.textContent = timeleft.join('.');
      } else {
        this.endgame('timeover');
        timer.textContent = '00.00';
      }

      // 繰り返し
      if (playflg) {
        this.timeoutId = setTimeout(() => {
          this.playing();
        },30);
      }
    }
    update() {
      // Update the time , count
      seconds = seconds + .009;
      t = seconds*Math.PI;
      count = count + 0.05;

      // addbubble,jellyfish
      if (count > 1) {
        // bubble追加
        bubbles.push(this.drawer.addbubble(0));
        jellyfishs.push(this.drawer.addjellyfish(0));
        count = 0;
      }
    }
    endgame(end) {
      this.draw(0.8);
      this.timeout();
      playflg = false;
      switch (end) {
        case 'timeover':
          result.textContent = 'Time Over!';
          break;
        case 'complete':
          result.textContent = 'Complete!';
          break;
      }
      result.classList.remove('hide');
    }
    timeout() {
      window.clearTimeout(this.timeoutId);
    }
    hit(x,y) {
      const hit_index = this.drawer.checkjellyfishpoint(x,y,3);
      if (hit_index >= 0) {
        jellyfishs = jellyfishs.filter((jellyfish,index) => {
          return index !== hit_index;
        })
        hitpoint++;
      }
      if (clearpoint <= hitpoint) {
        this.endgame('complete');
      }
    }
  }

  const canvas = document.querySelector('canvas')

  if (typeof canvas.getContext === 'undefined') {
    return;
  }

  var t = 0;
  var seconds = 0;
  var count = 0;
  var clearpoint = 10;
  let bubbles = [];
  let jellyfishs = [];
  const jellyfish_data = [
    ['img/Jellyfish1.png',40,40],
    ['img/Jellyfish2.png',57,57],
    ['img/Jellyfish3.png',58,58]
  ]
  const imgs = [];

  const game = new Game(new Sea(canvas));
  let hitpoint = 0;
  let playflg = false;
  game.gameinit ();

  // 画像の読み込み後、drawstart
  const imgload = ((alpha) => {
    let imgload = 0;
    for (var i = 0; i < jellyfish_data.length; i++) {
      imgs.push(new Image());
      imgs[i].src = jellyfish_data[i][0];
      imgs[i].onload = (() => {
        imgload++;
        if (imgload === jellyfish_data.length - 1) {
          game.draw(alpha);
        }
      })
    }
  })

  const result = document.getElementById('result');
  const timer = document.getElementById('timer');
  const start = document.getElementById('start');
  imgload(0.8);

  start.addEventListener('click',() => {
    if (playflg) return;
    playflg = true;
    hitpoint = 0;
    result.textContent = "";
    result.classList.add('hide');
    game.gameinit();
    game.setTimer();
    game.playing();
  })

  canvas.addEventListener('click',(e) => {
    if (!playflg) return;
    var x = e.offsetX;
    var y = e.offsetY;
    game.hit(x,y);
  })

})();
