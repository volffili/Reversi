// checkers.js

const rectSize = 60;

//canvas context
var ctx,canvas;

/** The state of the game */
var state = {
  over: false,
  turn: 'w',
  board: [
    [null, null, null, null,  null, null,  null, null],
    [null, null, null, null,  null, null,  null, null],
    [null, null, null, null,  null, null,  null, null],
    [null, null, null, 'b',  'w', null,  null, null],
    [null, null, null, 'w',  'b', null,  null, null],
    [null, null, null, null,  null, null,  null, null],
    [null, null, null, null,  null, null,  null, null],
    [null, null, null, null,  null, null,  null, null],
	],
  captures: {w: 0, b: 0}
}

function getMousePos(cx,cy) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: Math.round((cx-rect.left)/(rect.right-rect.left)*canvas.width),
    y: Math.round((cy-rect.top)/(rect.bottom-rect.top)*canvas.height)
  };
}



function getHighlithtedInDirection(x,y,enemy,dirx,diry){

	var highlights=[];
	var xx = x;
	var yy = y;
	var flag = false;

	if(state.board[yy][xx] == null){
		highlights.push({
			x:xx,
			y:yy
		});
		xx+=dirx;
		yy+=diry;			
	}else{
		return [];
	}

	while(true){
  	
  	if (xx < 0 || yy < 0 || xx > 7 || yy > 7) {
  		return [];
  	}

		if(state.board[yy][xx] && state.board[yy][xx].charAt(0) == enemy){
			highlights.push({
				x:xx,
				y:yy
			});
			xx+=dirx;
			yy+=diry;		
			flag = true;	
		}else{
			if(flag && state.board[yy][xx] && state.board[yy][xx].charAt(0) == state.turn){
				highlights.push({
					x:xx,
					y:yy
				});
				return highlights;
			}else{
				return [];
			}
		}
	}
		
}

function getHighlightedSquares(x,y){
	enemy = state.turn == 'w' ? 'b' : 'w';
	var highlights=[];

	highlights = highlights.concat(getHighlithtedInDirection(x,y,enemy,1,1));
	highlights = highlights.concat(getHighlithtedInDirection(x,y,enemy,1,-1));
	highlights = highlights.concat(getHighlithtedInDirection(x,y,enemy,-1,1));
	highlights = highlights.concat(getHighlithtedInDirection(x,y,enemy,-1,-1));
	highlights = highlights.concat(getHighlithtedInDirection(x,y,enemy,1,0));
	highlights = highlights.concat(getHighlithtedInDirection(x,y,enemy,-1,0));
	highlights = highlights.concat(getHighlithtedInDirection(x,y,enemy,0,1));
	highlights = highlights.concat(getHighlithtedInDirection(x,y,enemy,0,-1));
	return highlights;
}

function reverseCheckers(x,y){
	enemy = state.turn == 'w' ? 'b' : 'w';

	var fields=getHighlightedSquares(x,y);

	if(fields == []) return;

	fields.forEach(function(entry){
		state.board[entry.y][entry.x] = state.turn;
		console.log("x: "+entry.x+", y: "+entry.y);
	});

	nextTurn();
	renderBoard();
}

/** @function nextTurn()
  * Starts the next turn by changing the
  * turn property of state.
  */
function nextTurn() {
  if(state.turn === 'b') state.turn = 'w';
  else state.turn = 'b';
}

function boardPosition(x,y){
  var boardX = Math.floor(x/rectSize);
  var boardY = Math.floor(y/rectSize);
  return {x:boardX,y:boardY}
}

function handleMouseUp(event){
  var pos_temp = getMousePos(event.clientX,event.clientY);
  var position = boardPosition(pos_temp.x,pos_temp.y);
  var x = position.x;
  var y = position.y;
  
  if (x < 0 || y < 0 || x > 7 || y > 7) return;
  
  if (state.board[y][x] == null){
  	reverseCheckers(x,y);
  	renderBoard();		
	}
  
}

function handleMouseMove(event){


  var pos_temp = getMousePos(event.clientX,event.clientY);
  var position = boardPosition(pos_temp.x,pos_temp.y);
  var x = position.x;
  var y = position.y;

  if (x < 0 || y < 0 || x > 7 || y > 7) return;

  var highlights = getHighlightedSquares(x,y);

  renderBoard(highlights);
}

function blendColors(c0, p) {
    var f = parseInt(c0.slice(1),16);
    var R1=f>>16;
    var G1=f>>8&0x00FF;
    var B1=f&0x0000FF;
    return "#"+(0x1000000+(Math.round(R1*p))*0x10000+(Math.round(G1*p))*0x100+(Math.round(B1*p))).toString(16).slice(1);
}

function renderSquare(x,y,lighter_percentage=1,border=false){
  var col;

    if(state.turn == 'w')
    	ctx.strokeStyle = '#FFFFFF';
  	else
    	ctx.strokeStyle = '#000000';

  if((x+y)%2 == 1){
  		col =	blendColors('#D2691E',lighter_percentage);	
      ctx.fillStyle = col;
      ctx.fillRect(x*rectSize,y*rectSize,rectSize,rectSize);
      if(border) ctx.strokeRect(x*rectSize,y*rectSize,rectSize,rectSize);
    }else{
  		col =	blendColors('#8B4513',lighter_percentage);	
      ctx.fillStyle = col;
      ctx.fillRect(x*rectSize,y*rectSize,rectSize,rectSize);
      if(border) ctx.strokeRect(x*rectSize,y*rectSize,rectSize,rectSize);
    }
}

function renderChecker(x,y){
  if(state.board[y][x]){
    ctx.beginPath();
    if(state.board[y][x].charAt(0) == 'w'){
      ctx.fillStyle = '#ddd';
    }
    else{
      ctx.fillStyle = '#222';
    }
    ctx.arc(x*rectSize+rectSize/2,y*rectSize+rectSize/2, rectSize/2/5*4, 0, Math.PI * 2 );
    ctx.fill();
  }
}

function renderBoard(highlights){
	for(var y=0;y<8;++y){
		for(var x=0;x<8;++x){
	    renderSquare(x,y);
		}
	}

	if(highlights){
		highlights.forEach(function(entry){
			renderSquare(entry.x,entry.y,0.5,true);
		});
	}

	for(var y=0;y<8;++y){
		for(var x=0;x<8;++x){
			renderChecker(x,y);
		}
	}

}

function setup() {
	canvas = document.createElement('canvas');
	canvas.width = 480;
	canvas.height = 480;
  canvas.onmouseup = handleMouseUp;
	canvas.onmousemove = handleMouseMove;
	document.body.appendChild(canvas);
	ctx = canvas.getContext('2d');
	renderBoard();
}

setup();
