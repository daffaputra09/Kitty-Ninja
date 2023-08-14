window.onload = function() {
    //  var innerWidth = window.innerWidth;
	// var innerHeight = window.innerHeight;
	// var gameRatio = innerWidth/innerHeight;	
	// var game = new Phaser.Game(Math.floor(480*gameRatio), 480, Phaser.CANVAS);	
	var game = new Phaser.Game(800, 480, Phaser.CANVAS);	
	var ninja;
	var bg;
	var ninjaGravity = 800;
	var ninjaJumpPower;    
	var score=0;
	var scoreText;
	var comboText;
     var topScore;
     var powerBar;
     var powerTween;
     var placedPoles;
	var poleGroup; 
     var minPoleGap = 100;
     var maxPoleGap = 250; 
     var ninjaJumping;
     var ninjaFallingDown;     
     var play = function(game){}     
     play.prototype = {
		preload:function(){
            // game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
			// game.scale.setScreenSize(true);
			game.load.image("ninja", "assets/kitty.png"); 
			game.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
			game.load.image("pole", "assets/ground.png");
            game.load.image("powerbar", "assets/powerbar.png");
            game.load.image("bg", "assets/background.png");
		},
		create:function(){
			bg = this.add.image(0,0, "bg")
			bg.scale = 0.5;
			ninjaJumping = false;
			ninjaFallingDown = false;
			score = 0;
			placedPoles = 0;
			poleGroup = game.add.group();
			topScore = localStorage.getItem("KittyTopScore")==null?0:localStorage.getItem("KittyTopScore");
			scoreText = game.add.text(10,10,"-",{
				font:"bold 16px Arial"
			});
			comboText = game.add.text(400,100,"",{
				font:"bold 16px Arial"
			});
			updateScore();
			// game.stage.backgroundColor = "#87CEEB";
			game.physics.startSystem(Phaser.Physics.ARCADE);
			// ninja = game.add.sprite(80,0,"ninja");
			ninja = game.add.sprite(120,0,"ninja");
			ninja.anchor.set(0.5);
			ninja.lastPole = 1;
			game.physics.arcade.enable(ninja);              
			ninja.body.gravity.y = ninjaGravity;
			game.input.onDown.add(prepareToJump, this);
			addPole(120);
			
		},
		update:function(){
			game.physics.arcade.collide(ninja, poleGroup, checkLanding);
			if(ninja.y>game.height){
				die();
			}
		}
	}  
		game.state.add("Play",play);
		game.state.start("Play");
        
	function updateScore(){
		scoreText.text = "Score: "+score+"\nBest: "+topScore;	
	}     
	function prepareToJump(){
		if(ninja.body.velocity.y==0){
	          powerBar = game.add.sprite(ninja.x,ninja.y-50,"powerbar");
	          powerBar.width = 0;
	          powerTween = game.add.tween(powerBar).to({
			   width:100
			}, 1000, "Linear",true); 
	          game.input.onDown.remove(prepareToJump, this);
	          game.input.onUp.add(jump, this);
          }        	
	}     
     function jump(){
          ninjaJumpPower= -powerBar.width*3-100
          powerBar.destroy();
          game.tweens.removeAll();
          ninja.body.velocity.y = ninjaJumpPower*2;
          ninjaJumping = true;
          powerTween.stop();
          game.input.onUp.remove(jump, this);
     }     
     function addNewPoles(){
     	var maxPoleX = 0;
		poleGroup.forEach(function(item) {
			maxPoleX = Math.max(item.x,maxPoleX)			
		});
		var nextPolePosition = maxPoleX + game.rnd.between(minPoleGap,maxPoleGap);
		addPole(nextPolePosition);			
	}
	function addPole(poleX){
		if(poleX<game.width*2){
			placedPoles++;
			var pole = new Pole(game,poleX,game.rnd.between(250,380));
			game.add.existing(pole);
	          pole.anchor.set(0.5,0);
			poleGroup.add(pole);
			var nextPolePosition = poleX + game.rnd.between(minPoleGap,maxPoleGap);
			addPole(nextPolePosition);
		}
	}	
	function die(){
		localStorage.setItem("KittyTopScore",Math.max(score,topScore));	
		game.state.start("Play");
	}
	function checkLanding(n,p){
		if(p.y>=n.y+n.height/2){
			var border = n.x-p.x
			if(Math.abs(border)>40){
				n.body.velocity.x=border*1;
				n.body.velocity.y=-200;	
			}
			var poleDiff = p.poleNumber-n.lastPole;
			if(poleDiff>0){
				if(poleDiff > 2){
					score+= 2*poleDiff;
					comboText.text = "combo \n"+ poleDiff + " x 2"
				}
				else{
					score+= 1*poleDiff;
					comboText.text = ""
				}
				updateScore();	
				n.lastPole= p.poleNumber;
			}
			if(ninjaJumping){
               	ninjaJumping = false;              
               	game.input.onDown.add(prepareToJump, this);
          	}
		}
		else{
			ninjaFallingDown = true;
			poleGroup.forEach(function(item) {
				item.body.velocity.x = 0;			
			});
		}			
	}
	Pole = function (game, x, y) {
		Phaser.Sprite.call(this, game, x, y, "pole");
		game.physics.enable(this, Phaser.Physics.ARCADE);
          this.body.immovable = true;
          this.poleNumber = placedPoles;
	};
	Pole.prototype = Object.create(Phaser.Sprite.prototype);
	Pole.prototype.constructor = Pole;
	Pole.prototype.update = function() {
          if(ninjaJumping && !ninjaFallingDown){
               this.body.velocity.x = ninjaJumpPower;
          }
          else{
               this.body.velocity.x = 0
          }
		if(this.x<-this.width){
			this.destroy();
			addNewPoles();
		}
	}	
}