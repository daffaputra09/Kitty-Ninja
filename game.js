window.onload = function() {
    //  var innerWidth = window.innerWidth;
	// var innerHeight = window.innerHeight;
	// var gameRatio = innerWidth/innerHeight;	
	// var game = new Phaser.Game(Math.floor(480*gameRatio), 480, Phaser.CANVAS);	
	var game = new Phaser.Game(1000, 600, Phaser.AUTO);	
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
     var minPoleGap = 110;
     var maxPoleGap = 250; 
     var ninjaJumping;
     var ninjaFallingDown;   
	 var gameOverImage;
	var jumpButton;
	
	 var backgroundMusic;
	 var jumpSFX;
	 var dieSFX;
	 var punchSFX;
     var play = function(game){}     
     play.prototype = {
		preload:function(){
            // game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
			// game.scale.setScreenSize(true);
			game.load.image("ninja-idle", "assets/image/kitty-idle.png"); 
			game.load.image("ninja-jump", "assets/image/kitty-jump.png"); 
			game.load.image("ninja-die", "assets/image/kitty-die.png"); 
			game.load.image("pole", "assets/image/groundKittyNinja.png");
            game.load.image("powerbar", "assets/image/powerbar.png");
            game.load.image("bg", "assets/image/background2.png");
            game.load.image("gameOverImage", "assets/image/gameOver.png");

			game.load.audio("bgmusic", "assets/audio/bgmusic.mp3");
			game.load.audio("jumpSFX", "assets/audio/jumpKittyNinja.mp3");
			game.load.audio("dieSFX", "assets/audio/die.mp3");
			game.load.audio("punchSFX", "assets/audio/punch.mp3");
		},
		create:function(){
			game.scale.pageAlignVertically = true;
			game.scale.pageAlignHorizontally = true;
			bg = this.add.image(0,0, "bg")
			backgroundMusic = game.add.audio("bgmusic")
			jumpSFX = game.add.audio("jumpSFX")
			dieSFX = game.add.audio("dieSFX")
			punchSFX = game.add.audio("punchSFX")
			backgroundMusic.loop = true;
			backgroundMusic.play()
			ninjaJumping = false;
			ninjaFallingDown = false;
			score = 0;
			placedPoles = 0;
			poleGroup = game.add.group();
			topScore = localStorage.getItem("KittyTopScore")==null?0:localStorage.getItem("KittyTopScore");
			scoreText = game.add.text(10,10,"-",{
				font:"bold 16px Arial"
			});
			comboText = game.add.text(5,100,"",{
				font:"bold 16px Arial"
			});

			updateScore();
			game.stage.backgroundColor = "#87CEEB";
			game.physics.startSystem(Phaser.Physics.ARCADE);
			ninja = game.add.sprite(200,0,"ninja-idle");
			ninja.anchor.set(0.5);
			ninja.lastPole = 1;
			game.physics.arcade.enable(ninja);              
			ninja.body.gravity.y = ninjaGravity;
			game.input.onDown.add(prepareToJump, this);
			addPole(200);
			jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
			
		},
		update:function(){
			game.physics.arcade.collide(ninja, poleGroup, checkLanding);
			if(ninja.y>game.height && ninja.y < 610){
				die();
			}
			else if(ninja.y>game.height && ninja.y < 620){
				die();
			}
		}
	}  
		game.state.add("Play",play);
		game.state.start("Play");
        
	function updateScore(){
		if(score > topScore){
			scoreText.text = "Score: "+score+"\nBest: "+score;
		} else{
			scoreText.text = "Score: "+score+"\nBest: "+topScore;	
		}
	}     
	function prepareToJump(){

		comboText.destroy();
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
		  ninja.loadTexture('ninja-jump');
          ninjaJumping = true;
          powerTween.stop();
          game.input.onUp.remove(jump, this);
		  jumpSFX.play()
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
			var pole = new Pole(game,poleX,game.rnd.between(350,480));
			game.add.existing(pole);
	          pole.anchor.set(0.5,0);
			poleGroup.add(pole);
			var nextPolePosition = poleX + game.rnd.between(minPoleGap,maxPoleGap);
			addPole(nextPolePosition);
		}
	}	
	function die(){
		localStorage.setItem("KittyTopScore",Math.max(score,topScore));	
		backgroundMusic.stop()
		dieSFX.play()
		ninja.body.velocity.x = 1500;
		gameOverImage = game.add.sprite(game.world.centerX, game.world.centerY, 'gameOverImage');
    	gameOverImage.anchor.set(0.5);
    	gameOverImage.inputEnabled = true;
		gameOverImage.width = 300;
		gameOverImage.height = 350;
		gameOverImage.events.onInputDown.add(playAgain, this);		
		console.log(ninja.y)	

	}
	function playAgain(){
		game.state.start("Play");
	}
	function checkLanding(n,p){
		if(p.y>=n.y+n.height/2){
			var border = n.x-p.x
			if(Math.abs(border)>40){
				punchSFX.play()
				n.body.velocity.x=border*1;
				n.body.velocity.y=-200;	
				ninja.loadTexture('ninja-die');
			}
			ninja.loadTexture('ninja-idle');
			var poleDiff = p.poleNumber-n.lastPole;
			// this.body.velocit3y.x = 100;
			if(poleDiff>0){
				jumpSFX.stop()
				if(poleDiff > 2){
					score+= 2*poleDiff;
					comboText = game.add.text(ninja.x-35,ninja.y-100,"COMBO\n" + poleDiff + " x 2",{
						font:"bold 16px Arial",
						align: 'center'
					});
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
				ninja.loadTexture('ninja-die');	
			});
			if(ninja.y < game.height){
				punchSFX.play()
			}
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