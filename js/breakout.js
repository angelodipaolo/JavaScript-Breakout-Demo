/*==================================
	javascript breakout demo 
	by angelo di paolo
==================================*/

$(document).ready(function(){

	var breakout = new Breakout();

	breakout.init('gameFrame');
	breakout.runGame();
});

var Breakout = function() {

	this.context = null;
	this.frameSize = {width:720, height:540};
	this.level = null;
	this.paddle = null;
	this.input = null;
	this.canvasElementID;
	this.gameTimer = null;
}
Breakout.prototype = {

	runGame: function() {

		var self = this;

		setInterval(function() {
			self.update();
		}, 10);
	},
	init: function(canvasElementID) {

		this.canvasElementID = canvasElementID;
		this.level = new Breakout.Level();
		this.level.init(this);

		this.paddle =  new Breakout.Paddle(this.frameSize.width/2 - 50/2, this.frameSize.height - 60, 65, 12);
		this.paddle.init(this);	

		this.ball = new Breakout.Ball(this.paddle.rect.position.x + this.paddle.rect.width/2, this.paddle.rect.position.y-5,0,0);

		this.input = new Breakout.Input();
		this.input.init(this);

		this.context = document.getElementById('gameFrame').getContext('2d');
	},
	update: function() {
	
		//draw a bounding box rect around the ball for collision
		var ballOffsetX = this.ball.position.x - this.ball.radius;
		var ballOffsetY = this.ball.position.y - this.ball.radius;
		var ballRect = new Breakout.Rect(ballOffsetX, ballOffsetY, this.ball.width, this.ball.height);

		//determine collsion by bounding box test
		this.ball.didCollide = this.paddle.rect.doesIntersect(ballRect);

		//search for a ball/block collision
		for(var i = 0; i < this.level.rowCount * this.level.columnCount; i++) {

			if(!this.level.blocks[i].isDestroyed && this.level.blocks[i].rect.doesIntersect(ballRect)) {

				this.level.blocks[i].isDestroyed = true;
				this.ball.didCollide = true;
				this.level.score++;
			}
		}

		this.ball.update(this);
		this.draw();
	},
	draw: function() {
		
		//clear frame
		this.context.clearRect(0, 0, this.frameSize.width, this.frameSize.height);

		this.ball.draw(this.context);
		this.paddle.draw(this.context);

		//draw blocks
		for(var i = 0; i < this.level.rowCount * this.level.columnCount; i++) {

			var block = this.level.blocks[i];

			if(!block.isDestroyed)
				block.draw(this.context);
		}

		//draw hud
		this.context.fillStyle = this.ball.color;
		var ballCirc = this.ball.radius * 2;
		var x = this.frameSize.width - ((ballCirc +2 ) * 3) - 10;
		var y = this.frameSize.height - ballCirc - 2;

		for(var i = 0; i < this.level.balls; i++ ) {
			
			this.context.beginPath();
			this.context.arc(x ,y, this.ball.radius, 0,Math.PI*2,true);
			this.context.closePath();
			this.context.fill();

			x += ballCirc + 5;
		}

		this.context.fillStyle = '#000';
		this.context.font = '11pt Arial';
		this.context.fillText(this.level.score.toString(),10,y + 6);
	}

};

Breakout.Input = function(){
	this.isLeftKeyDown = false;
	this.isRightKeyDown = false;
	this.isSpacebarDown = false;
}

Breakout.Input.prototype = {

	init: function(game) {

		var self = this;

		$('#' + game.canvasElementID).mousemove(function(e){

			//change position of paddle based on mouse
			var targetX = e.offsetX;
			var paddleHalfWidth = (game.paddle.rect.width / 2);

			//keep paddle within frame bounds
			if(targetX + paddleHalfWidth  > game.frameSize.width) {
				targetX = game.frameSize.width - paddleHalfWidth;
			}
			else if(targetX - paddleHalfWidth < 0) {
				targetX = paddleHalfWidth;
			}

			game.paddle.rect.position.x =  targetX - (game.paddle.rect.width / 2);
			
		});	

		$(document).keydown(function(e){
			
			//left arrow
			if (e.keyCode == 37) { 
				self.isLeftKeyDown = true;
		      // return false;
			}
			//right arrow
			else if (e.keyCode == 39) {
				self.isRightKeyDown = true;
		        //return false;			
			}
			//space bar
			else if(e.keyCode == 32) {
				
				self.isSpacebarDown = true;
			}
		});	

		$(document).keyup(function(e){

			//left arrow
			if (e.keyCode == 37) {
				self.isLeftKeyDown = false;
		       	//return false;
			}
			//right arrow
			else if (e.keyCode == 39) {
				self.isRightKeyDown = false;		
			}
			//space bar
			else if(e.keyCode == 32) {
				self.isSpacebarDown = false;
			}
		});	
	}
}

Breakout.Vector = function(x, y) {
	this.x = x;
	this.y = y;
}	

Breakout.Rect = function(positionX, positionY, width, height) {
	this.position = new Breakout.Vector(positionX, positionY);
	this.width = width;
	this.height = height;
}
Breakout.Rect.prototype = {

	doesIntersect: function(testRect) {
		
		if(testRect.position.y > this.position.y && testRect.position.y < this.position.y + this.height)	{

			if(testRect.position.x  < this.position.x + this.width && testRect.position.x > this.position.x) 
				return true;
		}

		return false;
	},
	draw: function(context) {

		context.fillRect(this.position.x ,this.position.y, this.width, this.height);
	}
};

Breakout.Paddle = function(positionX, positionY, width, height) {
	this.rect = new Breakout.Rect(positionX, positionY, width, height);
	this.lastPosition = new Breakout.Vector(positionX, positionY);
	this.velocity = new Breakout.Vector(0,0);
	this.gravity = 3;
	this.speed = 0;
	this.width = width;
	this.height = height;
	this.color = '#000';
	this.isMoving = false;
	this.input = null;
}
Breakout.Paddle.prototype = {
	init: function(game) {
		this.input = game.input;
	},
	draw: function(context) {
		context.fillStyle = this.color;
		this.rect.draw(context);
	}
};

Breakout.Ball = function(positionX, positionY, startVelX, startVelY) {

	this.position = new Breakout.Vector(positionX, positionY);
	this.lastPosition = new Breakout.Vector(positionX, positionY);
	this.velocity = new Breakout.Vector(startVelX, startVelY);
	this.speed = 3;
	this.radius = 6
	this.color = '#fe57a1';
	this.isMoving = false;
	this.didCollide = false;
}
Breakout.Ball.prototype = {
	update: function(game) {

		var paddle = game.paddle;

		//check for launch and give ball velocity
		if(game.input.isSpacebarDown && !this.isMoving) {

			this.velocity.x = this.speed;
			this.velocity.y = -this.speed;
			this.isMoving = true;
		}
		//respond to this collision
		if(this.didCollide) {

			//restore last frame's position
			this.position.x = this.lastPosition.x;
			this.position.y = this.lastPosition.y;

			//reverse the y velocity
			this.velocity.y = -this.velocity.y;
			this.didCollide = false;
		}
		if(this.isMoving) {

			//update this position based on velocity
			this.position.x = this.position.x + this.velocity.x;
			this.position.y = this.position.y + this.velocity.y;


			if(this.position.x > game.frameSize.width) {
				this.velocity.x = -this.speed;
			}
			else if(this.position.x < 0) {
				this.velocity.x = this.speed;
			}
			else if(this.position.y < 0) {
				this.velocity.y = this.speed;
			}
			else if(this.position.y > game.frameSize.height) {
				
				game.level.balls--;

				//reset
				this.isMoving = false;
				paddle.rect.position.x = game.frameSize.width/2 - 50/2;
				paddle.rect.position.y = game.frameSize.height - 60;
				this.position.x = paddle.rect.position.x + paddle.rect.width/2;
				this.position.y = paddle.rect.position.y-5;		
				this.velocity.y = 0;
				this.velocity.x = 0;
			}
		}
		else {
			this.position.x = game.paddle.rect.position.x + game.paddle.rect.width/2;
		}

		this.lastPosition.x = this.position.x;
		this.lastPosition.y = this.position.y;
	},
	draw: function(context) {

		context.fillStyle = this.color;
		context.beginPath();
		context.arc(this.position.x, this.position.y, this.radius, 0,Math.PI*2,true);
		context.closePath();
		context.fill();
	}
};

Breakout.Level = function() {
	this.blocks = null;
	this.columnCount = 12;
	this.rowCount = 8;
	this.blockWidth = 58;
	this.blockHeight = 22;
	this.blockPadding = 2;
	this.marginX = 50;
	this.marginY = 50;
	this.ballCount = 3;
	this.score = 0;
	this.frameSize = null;
}

Breakout.Level.prototype = {
	init: function(game) {
		this.frameSize = game.frameSize;
		this.blocks = new Breakout.Blocks(this);		
	}	
};

Breakout.Block = function(positionX, positionY, width, height) {
	this.rect = new Breakout.Rect(positionX, positionY, width, height);
	this.position = new Breakout.Vector(positionX, positionY);
	this.isDestroyed = false;
	this.width = width;
	this.height = height;
	this.color = '#ccc';
}

Breakout.Block.prototype = {
	draw: function(context) {

		context.fillStyle = this.color;
		this.rect.draw(context);
	}	
};


Breakout.Blocks = function(level){
	blocks = new Array(level.rowCount * level.columnCount);

	var blockStructureWidth = (level.blockWidth + level.blockPadding) * level.columnCount;
	var offSetX = (level.frameSize.width/2) - (blockStructureWidth/2);
	var offSetY = level.blockHeight + level.blockPadding;

	for(var x = 0; x < level.rowCount; x++) {
		
		for(var y = 0; y < level.columnCount; y++) {

			var blockPositionX = y * (level.blockWidth + level.blockPadding);
			var blockPositionY = x * (level.blockHeight + level.blockPadding);
			blockPositionX += offSetX;
			blockPositionY += offSetY;

			var i = x * level.columnCount + y
			blocks[i] = new Breakout.Block(blockPositionX, blockPositionY, level.blockWidth, level.blockHeight);
		}
	}

	return blocks;
}