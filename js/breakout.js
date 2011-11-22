/*==================================
	breakout clone in HTML5
	by angelo di paolo
==================================*/


//game elements
var paddle;
var ball;
var this.level;
var frameSize;
var gameInput;
var this.level;
var touch;

var isGameRunning;

$(document).ready(function(){
	Breakout();
});

/*=================
	init
=================*/
Breakout = {

	var canvas = document.getElementById('gameFrame');



	isGameRunning = true;

	return {
		this.paddle = new Paddle(frameSize.width/2 - 50/2, frameSize.height - 60, 65, 12),
		this.ball = new Ball(paddle.rect.position.x + paddle.rect.width/2, paddle.rect.position.y-5,0,0),
		this.level = new Level(),
		this.blocks = new BlockArray(this.level),
		this.gameInput = new GameInputs(),
		this.context = canvas.getContext('2d'),
		this.HUD = new HUD();
		this.frameSize = {width:720, height:540},
		this.isGameRunning = false,
		this.mode = GameMode();		
		runGame: function() {

			this.initGame();

			setInterval('update()',10);


			this.update();
			this.draw();
		},
		initGame: function() {
			
			//draw intro




		}
		update: function() {

			//getinput

			
			//check for launch and give ball velocity
			if(this.gameInput.isSpacebarDown && !this.ball.isMoving) {
				this.ball.velocity.x = this.ball.speed;
				this.ball.velocity.y = -this.ball.speed;
				this.ball.isMoving = true;
			}



			//respond to this.ball collision
			if(this.ball.didCollide) {

				//restore last frame's position
				this.ball.position.x = this.ball.lastPosition.x;
				this.ball.position.y = this.ball.lastPosition.y;

				//reverse the y velocity
				this.ball.velocity.y = -this.ball.velocity.y;
				this.ball.didCollide = false;
			}

			if(this.ball.isMoving) {

				//update this.ball position based on velocity
				this.ball.position.x = this.ball.position.x + this.ball.velocity.x;
				this.ball.position.y = this.ball.position.y + this.ball.velocity.y;


				if(this.ball.position.x > frameSize.width) {
					this.ball.velocity.x = -this.ball.speed;
				}
				else if(this.ball.position.x < 0) {
					this.ball.velocity.x = this.ball.speed;
				}

				else if(this.ball.position.y < 0) {
					this.ball.velocity.y = this.ball.speed;
				}
				else if(this.ball.position.y > frameSize.height) {
					
					this.level.balls--;

					//reset
					this.ball.isMoving = false;
					this.paddle.rect.position.x = frameSize.width/2 - 50/2;
					this.paddle.rect.position.y = frameSize.height - 60;
					this.ball.position.x = this.paddle.rect.position.x + this.paddle.rect.width/2;
					this.ball.position.y = this.paddle.rect.position.y-5;		
					this.ball.velocity.y = 0;
					this.ball.velocity.x = 0;
				}
			}
			else {
				this.ball.position.x = this.paddle.rect.position.x + this.paddle.rect.width/2;
			}

			this.ball.lastPosition.x = this.ball.position.x;
			this.ball.lastPosition.y = this.ball.position.y;

			if(this.level.balls == 0) {
				this.isGameRunning = false;
			}

		},
		checkCollision: function() {
			
			//draw a bounding box rect around the ball for collision
			var ballOffsetX = ball.position.x - ball.radius;
			var ballOffsetY = ball.position.y - ball.radius;
			var ballRect = Rect(ballOffsetX, ballOffsetY, ball.width, ball.height);

			//determine collsion by bounding box test
			this.ball.didCollide = doesRectIntersect(ballRect, paddle.rect);

			//search for a ball/block collision
			for(var i = 0; i < this.level.rowCount * this.level.columnCount; i++) {

				if(!this.level.blocks[i].isDestroyed && doesRectIntersect(ballRect, this.level.blocks[i].rect)) {

					this.level.blocks[i].isDestroyed = true;
					this.ball.didCollide = true;
					this.level.score++;
				}
				
			}
		},
		draw: function() {
			
			//clear frame
			this.context.clearRect(0,0,this.frameSize.width,this.frameSize.height);

			//this.ball.draw(this.context); //drawBall(ball);

			this.ball.rect.draw(this.context);
			//draw paddle
			drawRect(this.paddle.rect, this.paddle.color);

			//draw blocks
			for(var i = 0; i < this.level.rowCount * this.level.columnCount; i++) {

				var block = this.level.blocks[i];

				if(!block.isDestroyed)
					block.rect.draw(this.context);
			}

			this.HUD.draw(context, thislevel); //drawHUD();
		
		}

	};
}

function GameMode() {

	return {
		Intro:0,
		Running:1,
		GameOver:2	
	};
}

function Input() {

	var mousePositionX;
	var mousePositionY;



	return {
		isLeftKeyDown:false,
		isRightKeyDown:false,
		isSpacebarDown:false,
		mousePosition: new Vector(),

		init:function() {

			$('#gameFrame').mousemove(function(e){
				
				//change position of paddle based on mouse
				var targetX = e.pageX - this.offsetLeft;

				this.mousePosi

				var paddleHalfWidth = (paddle.rect.width / 2);

				//keep paddle within frame bounds
				if(targetX + paddleHalfWidth  > frameSize.width) {
					targetX = frameSize.width - paddleHalfWidth;
				}
				else if(targetX - paddleHalfWidth < 0) {
					targetX = paddleHalfWidth;
				}

				paddle.rect.position.x =  targetX - (paddle.rect.width / 2);
			});	

			$(document).keydown(function(e){
				
				//left arrow
				if (e.keyCode == 37) { 
					this.isLeftKeyDown = true;
			      // return false;
				}
				//right arrow
				else if (e.keyCode == 39) {
					this.isRightKeyDown = true;
			        //return false;			
				}
				//space bar
				else if(e.keyCode == 32) {
					this.isSpacebarDown = true;
				}
			});	

			$(document).keyup(function(e){

				//left arrow
				if (e.keyCode == 37) {
					inputObject.isLeftKeyDown = false;
			       	//return false;
				}
				//right arrow
				else if (e.keyCode == 39) {
					inputObject.isRightKeyDown = false;		
				}
				//space bar
				else if(e.keyCode == 32) {
					inputObject.isSpacebarDown = false;
				}
			});				
		}
	};
}

Vector = function(x, y) {
	return {
		x:x,
		y:y
	};
}	

function Rect(positionX, positionY, width, height) {

	return {
		position: Vector(positionX, positionY),
		width:width,
		height:height,
		doesInsersect:function(rectToTest) {
			
			if(rectToTest.position.y > this.position.y && rectToTest.position.y < this.position.y + this.height)	{
				if(rectToTest.position.x  < this.position.x + this.width && rectToTest.position.x > this.position.x) 
					return true;
			}
		},
		draw:function(context) {
			
			context.fillRect(this.position.x ,this.position.y, this.width, this.height);
		}
	};
}

function Paddle(positionX, positionY, width, height) {
	return {
		rect: Rect(positionX, positionY, width, height),
		lastPosition: Vector(positionX, positionY),
		velocity: Vector(0,0),
		gravity:3,
		speed:0,
		width:width,
		height:height,
		color:'#000',
		isMoving:false
	};
}

function Ball(positionX, positionY, startVelX, startVelY) {
	return {
		position: {
			x:positionX,
			y:positionY
		},
		lastPosition: {
			x:positionX,
			y:positionY
		},
		velocity: {
			x:startVelX,
			y:startVelY
		},
		speed:3,
		radius:6,
		color:'#fe57a1',
		isMoving:false,
		didCollide:false,
		draw:function(context) {
			context.fillStyle = this.color;
			context.beginPath();
			context.arc(ballObject.position.x, ballObject.position.y, ballObject.radius, 0,Math.PI*2,true);
			context.closePath();
			context.fill();
		}
	};
}

function Level() {
	return {
		blocks:null,
		columnCount:12,
		rowCount:8,
		blockWidth:58,
		blockHeight:22,
		blockPadding:2,
		marginX:50,
		marginY:50,
		balls:3,
		score:0	
	};
}


function BlockArray(levelObject) {

	blocks = new Array(levelObject.rowCount * levelObject.columnCount);

	var blockStructureWidth = (levelObject.blockWidth + levelObject.blockPadding) * levelObject.columnCount;
	var offSetX = (frameSize.width/2) - (blockStructureWidth/2);
	var offSetY = levelObject.blockHeight + levelObject.blockPadding;

	for(var x = 0; x < levelObject.rowCount; x++) {
		
		for(var y = 0; y < levelObject.columnCount; y++) {

			var blockPositionX = y * (levelObject.blockWidth + levelObject.blockPadding);
			var blockPositionY = x * (levelObject.blockHeight + levelObject.blockPadding);
			blockPositionX += offSetX;
			blockPositionY += offSetY;

			var i = x * level.columnCount + y
			blocks[i] = Block(blockPositionX, blockPositionY, levelObject.blockWidth, levelObject.blockHeight);
		}
	}

	return blocks;
}

function Block(positionX, positionY, width, height) {

	return {
		rect:Rect(positionX, positionY, width, height),
		position: Vector(positionX, positionY),
		isDestroyed:false,
		width:width,
		height:height
	};
}

function HUD() {
	return {
		draw:function(context, levelObject) {
			//draw hud
			context.fillStyle = levelObject.ball.color;
			var ballCirc = ball.radius * 2;
			var x = frameSize.width - ((ballCirc +2 ) * 3) - 10;
			var y = frameSize.height - ballCirc - 2;

			for(var i = 0; i < this.level.balls; i++ ) {
				
				context.beginPath();
				context.arc(x ,y, ball.radius, 0,Math.PI*2,true);
				context.closePath();
				context.fill();

				x += ballCirc + 5;
			}

			context.fillStyle = '#000';
			context.font = '11pt Arial';
			context.fillText(this.level.score.toString(),10,y + 6);
		}	
	};
}

/*=================
	main loop
=================*/
function runGame() {
	
	checkCollisions();
	updateObjects();
	drawFrame();

	if(!isGameRunning) {
		drawGameOver();
	}
}

/*=================
	physics
=================*/

function checkCollisions() {
	
	//draw a bounding box rect around the ball for collision
	var ballOffsetX = ball.position.x - ball.radius;
	var ballOffsetY = ball.position.y - ball.radius;
	var ballRect = Rect(ballOffsetX, ballOffsetY, ball.width, ball.height);

	//determine collsion by bounding box test
	ball.didCollide = doesRectIntersect(ballRect, paddle.rect);

	//search for a ball/block collision
	for(var i = 0; i < this.level.rowCount * this.level.columnCount; i++) {

		if(!this.level.blocks[i].isDestroyed && doesRectIntersect(ballRect, this.level.blocks[i].rect)) {

			this.level.blocks[i].isDestroyed = true;
			ball.didCollide = true;
			this.level.score++;
		}
		
	}
}

//bounding-box collision test
function doesRectIntersect(rect1, this) {

	if(rect1.position.y > this.position.y && rect1.position.y < this.position.y + this.height)	{

		if(rect1.position.x  < this.position.x + this.width && rect1.position.x > this.position.x) 
			return true;
	}
	return false;
}


function updateObjects(){

	//check for launch and give ball velocity
	if(gameInput.isSpacebarDown && !ball.isMoving) {
		ball.velocity.x = ball.speed;
		ball.velocity.y = -ball.speed;
		ball.isMoving = true;
	}

	//move paddle based on input
	if(gameInput.isLeftKeyDown) {
		paddle.velocity.x = -2;
		paddle.isMoving = true;

	}
	else if(gameInput.isRightKeyDown) {

		paddle.velocity.x = +2;
		paddle.isMoving = true;
	}

	//respond to ball collision
	if(ball.didCollide) {

		//restore last frame's position
		ball.position.x = ball.lastPosition.x;
		ball.position.y = ball.lastPosition.y;

		//reverse the y velocity
		ball.velocity.y = -ball.velocity.y;
		ball.didCollide = false;
	}

	if(ball.isMoving) {

		//update ball position based on velocity
		ball.position.x = ball.position.x + ball.velocity.x;
		ball.position.y = ball.position.y + ball.velocity.y;


		if(ball.position.x > frameSize.width) {
			ball.velocity.x = -ball.speed;
		}
		else if(ball.position.x < 0) {
			ball.velocity.x = ball.speed;
		}

		else if(ball.position.y < 0) {
			ball.velocity.y = ball.speed;
		}
		else if(ball.position.y > frameSize.height) {
			
			this.level.balls--;

			//reset
			ball.isMoving = false;
			paddle.rect.position.x = frameSize.width/2 - 50/2;
			paddle.rect.position.y = frameSize.height - 60;
			ball.position.x = paddle.rect.position.x + paddle.rect.width/2;
			ball.position.y = paddle.rect.position.y-5;		
			ball.velocity.y = 0;
			ball.velocity.x = 0;
		}
	}
	else {
		ball.position.x = paddle.rect.position.x + paddle.rect.width/2;
	}

	ball.lastPosition.x = ball.position.x;
	ball.lastPosition.y = ball.position.y;

	if(this.level.balls == 0) {
		isGameRunning = false;
	}
}


/*=================
	drawing
=================*/
function drawFrame() {

	//clear frame
	context.clearRect(0,0,frameSize.width,frameSize.height);

	drawBall(ball);

	//draw paddle
	drawRect(paddle.rect, paddle.color);

	//draw blocks
	for(var i = 0; i < this.level.rowCount * this.level.columnCount; i++) {

		var block = this.level.blocks[i];

		if(!block.isDestroyed)
			drawRect(block.rect, '#CCC');
	}

	drawHUD();
}

function drawGameOver() {

	//modal style mask
	context.fillStyle = '#000';
	context.globalAlpha = 0.6;
	context.fillRect(0,0,frameSize.width, frameSize.height);
	
	//modal box
	var dialogRect = Rect(0,0,400,200);
	dialogRect.position.x = (frameSize.width/2) - (dialogRect.width/2);
	dialogRect.position.y = (frameSize.height/2) - (dialogRect.height/2) - 75;
	context.globalAlpha = 1.0;
	drawRect(dialogRect, '#272727')

	//text
	context.fillStyle = '#FFF';
	context.font = '16pt Arial';
	context.fillText('GAME OVER', dialogRect.position.x + (dialogRect.width / 2) - 65 ,dialogRect.position.y + 30);

	//score label
	context.font = '8pt Arial';
	context.fillText('FINAL SCORE', dialogRect.position.x + (dialogRect.width / 2) - 65 ,dialogRect.position.y + 55);

	context.font = '46pt Arial';
	context.fillText(this.level.score.toString(), dialogRect.position.x + (dialogRect.width / 2) - 54 ,dialogRect.position.y + 110);


	//final score

	//button
	var buttonRect = Rect(0,0,150,50);
	buttonRect.position.x =  dialogRect.position.x + (dialogRect.width/2) - buttonRect.width/2;
	buttonRect.position.y = dialogRect.position.y + dialogRect.height - buttonRect.height - 20;

	drawRect(buttonRect, '#000');

	context.fillStyle = '#FFF';
	context.font = '12pt Arial';
	context.fillText('play again', buttonRect.position.x + (buttonRect.width / 2) - 35  ,buttonRect.position.y + 30);
}

function drawHUD() {
	//draw hud
	context.fillStyle = ball.color;
	var ballCirc = ball.radius * 2;
	var x = frameSize.width - ((ballCirc +2 ) * 3) - 10;
	var y = frameSize.height - ballCirc - 2;

	for(var i = 0; i < this.level.balls; i++ ) {
		
		context.beginPath();
		context.arc(x ,y, ball.radius, 0,Math.PI*2,true);
		context.closePath();
		context.fill();

		x += ballCirc + 5;
	}

	context.fillStyle = '#000';
	context.font = '11pt Arial';
	context.fillText(this.level.score.toString(),10,y + 6);
}

function drawBall(ballObject) {
	context.fillStyle=ballObject.color;
	context.beginPath();
	context.arc(ballObject.position.x, ballObject.position.y, ballObject.radius, 0,Math.PI*2,true);
	context.closePath();
	context.fill();
}

function drawRect(rect, color) {
	context.fillStyle = color;
	context.fillRect(rect.position.x ,rect.position.y, rect.width, rect.height);
}