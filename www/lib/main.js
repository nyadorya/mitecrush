phina.globalize();

phina.graphics.Canvas.prototype.splash = function(x, y, radius, sides, sideIndent) {
      var x = x || 0;
      var y = y || 0;
      var radius = radius || 20;
      var sides = sides || Random.randint(25,36);
      var sideIndentRadius = radius * (sideIndent || 0.95);
      var radOffset = Math.PI/180;
      var radDiv = (Math.PI*2)/sides/2;
      this.haba = 0.15;

      this.moveTo(
        x + Math.cos(radOffset)*radius,
        y + Math.sin(radOffset)*radius
      );
      for (var i=1; i<sides*2; ++i) {
        var len = (i%2) ? (Random.randfloat(1 - this.haba,1 + this.haba))*radius : sideIndentRadius;
        var rad = radDiv*i + radOffset;
        this.quadraticCurveTo(
          x + Math.cos(rad)*len,
          y + Math.sin(rad)*len,
          x + Math.cos(rad)*len,
          y + Math.sin(rad)*len,
        );
      }
      this.closePath();
}

phina.namespace(function() {
  /**
   * @class phina.display.SplashShape
   * @extends phina.display.Shape
   */
  phina.define('phina.display.SplashShape', {
    superClass: 'phina.display.Shape',
    init: function(options) {
      options = ({}).$safe(options, {
        backgroundColor: 'transparent',
        fill: 'blue',
        stroke: '#aaa',
        strokeWidth: 4,
        radius: 20,
        sides:  Random.randint(25,36),
        sideIndent:0.95,
      });
      this.superInit(options);
      this.options = options;

      this.cornerRadius = options.cornerRadius;
    },

    prerender: function(canvas) {
      var _op = this.options;
      canvas.splash();
    },

    _defined: function() {
      phina.display.Shape.watchRenderProperty.call(this, 'cornerRadius');
    },

  });
});


//ゲーム開始のシーン定義だけは独立させたほうが分かりやすい（と思う）
var MyScenes = [
  {
    label : 'Main',
    className : 'MainScenes'
  }
];

//そのほかはシーンマネージャで定義してもいい（そのほうがイベントも記載できる）
phina.define('MainScenes', {
  superClass: 'phina.game.ManagerScene',
  
  init: function() {
    this.superInit({
      startLabel : 'start',
      scenes : [
        {
          label:'start',
          className:'MainScene'
        }
      ]
    });
    this.on('finish',function(){
      console.log('EXIT');
      this.exit();
    });
  }
});

/*
 * メインシーン
 */
phina.define('MainScene', {
  // 継承
  superClass: 'DisplayScene',

  // 初期化
  init: function() {
    // super init
    this.superInit();
    // 背景色
    this.backgroundColor = 'gray';

    // ラベルを生成
    var label = Label('MainScene').setPosition(this.gridX.center(),this.gridY.center()).addChildTo(this);
    label.fill = '#eee';  // 塗りつぶし色

    this.btn = Button({text:'check'}).setPosition(320,600).addChildTo(this);
    
    function toHex(v) {
        return (('00' + v.toString(16).toUpperCase()).substr(-2));
    }    
    var self = this;
    var area = 20;
    
    this.btn.on('push',function(e){
      var sumColors = {};
      for (var i=0;i<self.canvas.width;i=i+area){
        for(var j=0;j<self.canvas.height;j=j+area){
          var hoge = self.canvas.context.getImageData(i,j,area,area);
          var _toHexCol =toHex(hoge.data[0])+toHex(hoge.data[1])+toHex(hoge.data[2]); 
          sumColors[_toHexCol] = (sumColors[_toHexCol]==null)?1:sumColors[_toHexCol]+1;
        }
      }
      console.log(sumColors);
      for (var k in sumColors) {
        if (k == '00FF00') {
//          label.text = '#00FF00 :' + sumColors[k];
          label.text = ((sumColors[k] / ((self.canvas.width/area)*(self.canvas.height/area)))*100).round(2);
          label.text.color = 'black';
          label.addChildTo(self);
        }
      }
    });

    this.on('pointend',function(e){
      var hoge = this.canvas.context.getImageData(e.pointer.position.x,e.pointer.position.y,1,1);

      this.splash = phina.display.SplashShape({
          backgroundColor: 'transparent',
//          fill: 'red',
          fill: '#00FF00',
          stroke: '#00FF00',
//          stroke: '#aaa',
          strokeWidth: 1,
          radius: 300,
      }).setPosition(e.pointer.position.x,e.pointer.position.y).addChildTo(this);    

      this.splash.tweener
        .clear()
        .call(function(){
            this.haba = this.haba + 0.01;
        })
        .scaleTo(Random.randfloat(1,7),100,'easeInExpo');
      
    });


  },
  update :function(){
  },
  changeScene : function(){
  }

});




phina.main(function() {
  // アプリケーションを生成
  //GameApp自体の定義にscenesがあるのが案外ややこしい
  var app = GameApp({
    startLabel: 'Main',
    scenes : MyScenes,
  });
  
  app.enableStats();
  app.backgroundColor = 'red';

  // 実行
  app.run();
});
