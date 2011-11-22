/*==================================
	breakout clone in HTML5
	by angelo di paolo
==================================*/

//graphics
var canvas;
var context;

//game elements
var paddle;
var ball;
var level;
var frameSize;
var gameInput;
var level;
var touch;

var isGameRunning;

$(document).ready(function(){
	Breakout();
});

/*=================
	init
=================*/
function Breakout() {

	//init drawing
	canvas = document.getElementById('gameFrame');
	context = canvas.getContext('2d');
	frameSize = {width:720, height:540};

	//init game elements
	paddle = Paddle(frameSize.width/2 - 50/2, frameSize.height - 60, 65, 12);
	ball = Ball(paddle.rect.position.x + paddle.rect.width/2, paddle.rect.position.y-5,0,0);

	//init level
	level = new Level();
	level.blocks = initBlockArray(level);

	//input
	gameInput = new Input();
	setupInput();


	isGameRunning = true;
	return setInterval('runGame()',10);
}

function setupInput() {


	$('#gameFrame').mousemove(function(e){
		
		//change position of paddle based on mouse
		var targetX = e.offsetX;
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
			gameInput.isLeftKeyDown = true;
	      // return false;
		}
		//right arrow
		else if (e.keyCode == 39) {
			gameInput.isRightKeyDown = true;
	        //return false;			
		}
		//space bar
		else if(e.keyCode == 32) {
			gameInput.isSpacebarDown = true;
		}
	});	

	$(document).keyup(function(e){

		//left arrow
		if (e.keyCode == 37) {
			gameInput.isLeftKeyDown = false;
	       	//return false;
		}
		//right arrow
		else if (e.keyCode == 39) {
			gameInput.isRightKeyDown = false;		
		}
		//space bar
		else if(e.keyCode == 32) {
			gameInput.isSpacebarDown = false;
		}
	});	


}

function Input() {
	return {
		isLeftKeyDown:false,
		isRightKeyDown:false,
		isSpacebarDown:false
	};
}

function Vector(x, y) {
	return {
		x:x,
		y:y
	};
}	

function Rect(positionX, positionY, width, height) {
	return {
		position: Vector(positionX, positionY),
		width:width,
		height:height
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
		didCollide:false
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

function initBlockArray(levelObject) {

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
	for(var i = 0; i < level.rowCount * level.columnCount; i++) {

		if(!level.blocks[i].isDestroyed && doesRectIntersect(ballRect, level.blocks[i].rect)) {

			level.blocks[i].isDestroyed = true;
			ball.didCollide = true;
			level.score++;
		}
		
	}
}

//bounding-box collision test
function doesRectIntersect(rect1, rect2) {

	if(rect1.position.y > rect2.position.y && rect1.position.y < rect2.position.y + rect2.height)	{

		if(rect1.position.x  < rect2.position.x + rect2.width && rect1.position.x > rect2.position.x) 
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
			
			level.balls--;

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

	if(level.balls == 0) {
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
	for(var i = 0; i < level.rowCount * level.columnCount; i++) {

		var block = level.blocks[i];

		if(!block.isDestroyed)
			drawRect(block.rect, '#CCC');
	}


	//draw hud
	context.fillStyle = ball.color;
	var ballCirc = ball.radius * 2;
	var x = frameSize.width - ((ballCirc +2 ) * 3) - 10;
	var y = frameSize.height - ballCirc - 2;

	for(var i = 0; i < level.balls; i++ ) {
		
		context.beginPath();
		context.arc(x ,y, ball.radius, 0,Math.PI*2,true);
		context.closePath();
		context.fill();

		x += ballCirc + 5;

	}

	context.fillStyle = '#000';
	context.font = '11pt Arial';
	context.fillText(level.score.toString(),10,y + 6);


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
	context.fillText(level.score.toString(), dialogRect.position.x + (dialogRect.width / 2) - 54 ,dialogRect.position.y + 110);


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