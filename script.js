var myGamePiece;
var myObstacles = [];
//var myBackground;
var myMusic;
var mySound;
	
function startGame(){
	myGamePiece = new component(30, 30, "green", 10, 120); //buat objek game
	myScore = new component("20px","Consolas", "black", 10,30,"text");
	//myBackground = new component(650,300,"bg1.jpg",0,0,"background");
	myGameArea.start();
	myMusic= new sound("mariost.mp3");
	mySound= new sound("mariodie.wav");
	myMusic.play();
}

//buat canvas untuk game
var myGameArea = {
	canvas : document.createElement("canvas"),
	start : function() {
		this.canvas.width = 400;
		this.canvas.height = 540;
		this.context = this.canvas.getContext("2d");
		document.body.insertBefore(this.canvas, document.body.childNodes[0]); 	//childNodes[] atur posisi di line brpa canvas tampil berdasarkan jumlah tag
		this.frameNo=0;
		this.interval = setInterval(updateGameArea, 10); 	//u/ refresh canvas tiap 30ms
		
		//key eventlistener
		window.addEventListener('keydown', function (e) {
            myGameArea.keys = (myGameArea.keys || []);
            myGameArea.keys[e.keyCode] = (e.type == "keydown");
        })
        window.addEventListener('keyup', function (e) {
            myGameArea.keys[e.keyCode] = (e.type == "keydown");
        })
	},

	//function u/ bersihkan canvas
	clear : function(){
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	},

	//fungsi untuk stop frame jika objek menabrak
	stop: function(){
		clearInterval(this.interval);
	}
}

//fungsi mengatur jumlah obstacles/interval
function everyinterval(n){
	if((myGameArea.frameNo/n)%1==0){return true;}
	return false;
}

//fungsi u/ buat objek game
function component(width, height, color, x, y,type){
	this.type = type;
	if(type=="image"||type=="background"){
		this.image=new Image();
		this.image.src=color;
	}

	this.gamearea=myGameArea;
	this.width = width;
	this.height = height;
	this.x = x;
	this.y = y;
	this.speedX = 0;
	this.speedY = 0;

	this.update = function(){
		ctx = myGameArea.context;
		if(this.type=="text"){
			ctx.font = this.width+" "+this.height;
			ctx.fillStyle=color;
			ctx.fillText(this.text,this.x,this.y);
		}
		else if(type=="image"/*||type=="background"*/){
			ctx.drawImage(this.image,this.x,this.y,this.width,this.height);
			if(type=="background"){
				ctx.drawImage(this.image,this.x+this.width,this.y,this.width,this.height);
			}
		}
		else{
			ctx.fillStyle = color;
			ctx.fillRect(this.x, this.y, this.width, this.height);
		}
	
	}

		this.newPos = function(){
		//this.gravitySpeed+=this.gravity;
		this.x += this.speedX;
		this.y += this.speedY; //+this.gravitySpeed;
		if(this.type=="background"){
			if(this.x==-(this.width)){
				this.x=0;
			}
		}
		this.hitCanvas();
	}

		this.hitCanvas=function(){
		var rockbottom=myGameArea.canvas.height-this.height;
		if(this.y>rockbottom){
			this.y=rockbottom;
		}
		var rockright=myGameArea.canvas.width-this.width;
		if(this.x>rockright){
			this.x=rockright;
		}			
		var rocktop=0;
		if(this.y<rocktop){
			this.y=rocktop;
		}
		var rockleft=0;
		if(this.x<rockleft){
			this.x=rockleft;
		}
	}

		//membuat obstacles dapat ditabrak
	this.crashWith = function(otherobj){
		var myleft=this.x;
		var myright=this.x+(this.width);
		var mytop=this.y;
		var mybottom=this.y+(this.height);
		var otherleft=otherobj.x;
		var otherright=otherobj.x+(otherobj.width);
		var othertop=otherobj.y;
		var otherbottom=otherobj.y+(otherobj.height);
		var crash =true;
		if((mybottom<othertop)||(mytop>otherbottom)||(myright<otherleft)||(myleft>otherright)){
			crash = false;
		} return crash;
	}
}

//fungsi untuk canvas saat direfresh
function updateGameArea(){
	var x,height,gap,minHeight,maxHeight,minGap,maxGap;
	for(i=0;i<myObstacles.length;i+=1){
		if(myGamePiece.crashWith(myObstacles[i])){
			myGameArea.stop();
			myMusic.stop();
			mySound.play();
			return;
		}
	}

	myGameArea.clear();
	myGamePiece.speedX=0;
	myGamePiece.speedY=0;
	//set keyboard key
	if (myGameArea.keys && myGameArea.keys[37]) {myGamePiece.speedX = -1; }
    if (myGameArea.keys && myGameArea.keys[39]) {myGamePiece.speedX = 1; }
    if (myGameArea.keys && myGameArea.keys[38]) {myGamePiece.speedY = -1; }
    if (myGameArea.keys && myGameArea.keys[40]) {myGamePiece.speedY = 1; }
    
    myGameArea.frameNo+=1;
    //memunculkan random obstacles tiap 150frame
    if(myGameArea.frameNo==1||everyinterval(150)){
    	x=myGameArea.canvas.width;
    	minHeight=20;
    	maxHeight=200;
    	height=Math.floor(Math.random()*(maxHeight-minHeight+1)+minHeight);
    	minGap=38;
    	maxGap=150;
    	gap=Math.floor(Math.random()*(maxGap-minGap+1))+minGap;
    	myObstacles.push(new component(10,height,"red",x,0));
    	myObstacles.push(new component(10,x-height-gap,"red",x,height+gap));
    }
	    for (i=0;i<myObstacles.length;i+=1){
    	myObstacles[i].x += -1;
    	myObstacles[i].update();
    }

	myScore.text="Score: "+myGameArea.frameNo;
    myScore.update();
    /*myBackground.newPos();
    myBackground.speedX=-1;
    myBackground.update();*/
	myGamePiece.update();
	myGamePiece.newPos();
}

function sound(src){
	this.sound = document.createElement("audio");
	this.sound.src=src;
	this.sound.setAttribute("preload", "auto");
	this.sound.setAttribute("controls","none");
	this.sound.style.display = "none";
	document.body.appendChild(this.sound);
	this.play=function(){
		this.sound.play();
	}
	this.stop=function(){
		this.sound.pause();
	}
}