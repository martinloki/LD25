<!doctype html>
<html>
	<head>
		<title>Granny's Gummies - LD25</title>
		<link href="/stylesheets/LD25.css" media="all" rel="stylesheet" type="text/css"/>
		<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.4.4/jquery.min.js" type="text/javascript"></script>
	</head>
	<body>
		<h1>Granny's Gummies</h1>
		<script type='text/javascript'>
			var CANVAS_WIDTH=800;
			var CANVAS_HEIGHT=600;
			var FPS=30;
			var textX=50;
			var textY=50;
			
			var canvasElement=$("<canvas width='"+CANVAS_WIDTH+"' height='"+CANVAS_HEIGHT+"' style='border:1px solid #000000;'></canvas>");
			var canvas=canvasElement.get(0).getContext("2d");
			
			var bg_image = new Image();
			var kid_image = new Image();
			
			var KID_RADIUS=30;
			
			var rooms=[];
			var portals=[];
			var kids=[];
			var hallDoorList=[];
			
			var debugMessages=[];
						
			function Room(Index){
				Index = Index || {};
				Index.width=Index.x1-Index.x0;
				Index.height=Index.y1-Index.y0;
				Index.centerX=(Index.x0+Index.x1)/2;
				Index.centerY=(Index.y0+Index.y1)/2;
				
				Index.getName = function(){
					return Index.roomName;
				};
				
				Index.getCX = function(){
					return Index.centerX;
				};
				
				Index.getCY = function(){
					return Index.centerY;
				};
				
				Index.getX = function(){
					return Index.x0;
				};
				
				Index.getY = function(){
					return Index.y0;
				};
				
				Index.getWidth = function(){
					return Index.width;
				};
				
				Index.getHeight = function(){
					return Index.height;
				};
				
				Index.draw = function(){;
					//canvas.fillStyle=Index.thisColor;
					//canvas.fillRect(Index.x0,Index.y0,Index.width,Index.height);
				};
				
				Index.inRoom=function(x,y){			
					return x>=Index.x0 && x<=Index.x1 && y>=Index.y0 && y<=Index.y1;					
				};

				
				return Index;
			};
			
			function Portal(Index){
				goesToHall=(Index.room0==0||Index.room1==0);
				Index = Index || {};
				
				Index.getX=function(){return Index.x;};
				Index.getY=function(){return Index.y;};
				Index.getType=function(){return Index.type;};
				Index.getOtherRoom=function(currentRoomIndex){
					goalRoomIndex=0
					if(Index.room0==currentRoomIndex){
						goalRoomIndex=Index.room1;
					}else{
						goalRoomIndex=Index.room0;
					}
					//debugMessages.push("Passing room:"+currentRoomIndex+" returns room:"+goalRoomIndex+"  Choices:r0="+Index.room0+" r1="+Index.room1);
					//debugMessages.push("Assumed Room:"+rooms[currentRoomIndex].getName()+"Target Next Room:"+rooms[goalRoomIndex].getName());
					return goalRoomIndex;
				};
				return Index;
			};
			
			function getVectorMultiplier(currentX,currentY,goalX,goalY){
				xy_Factors=[];
				
				angle_to_goal=Math.atan2(goalY-currentY, goalX-currentX);
				xy_Factors.push(Math.cos(angle_to_goal));
				xy_Factors.push(Math.sin(angle_to_goal));
				return xy_Factors;				
			}

			function getCurrentRoom(x,y){
				debugMessages.push("Getting Current Room.");
				rooms.forEach(function(room){
					if(room.equals(rooms[0])){
						this.inHouse=room.isInRoom(x,y);
					}
					if(room.isInRoom(x,y)){
						return room;
					}
				});
				return rooms[9];
			}
							
			function Kid(Index){
				Index = Index || {};
				
				Index.baseVel=10;
				Index.width=KID_RADIUS;
				Index.height=KID_RADIUS;
				Index.energy=Math.random()*25;
				Index.focus=Math.random()*50+25;
				Index.sugar=0;
				Index.crashETA=0;
				Index.timeLeftInRoom=100;
				
				//Pick a starting room.  The Hall is 0 and Outside is 9
				Index.currentRoomIndex=Math.floor(Math.random()*7+1);
				Index.currentRoom=rooms[Index.currentRoomIndex];
				Index.currentRoomName=Index.currentRoom.getName();
				
				//St variables for traveling
				Index.goalRoomIndex=9;
				Index.exitDoorSelected=false;
				Index.inDoorWay=false;
				
				//spawn away from the walls
				Index.xmin=Index.currentRoom.getX()+5;
				Index.xmax=Index.currentRoom.getX()+Index.currentRoom.getWidth()-Index.width-5;
				Index.ymin=Index.currentRoom.getY()+5;
				Index.ymax=Index.currentRoom.getY()+Index.currentRoom.getHeight()-Index.height-5;
				Index.x=Math.random()*(Index.xmax-Index.xmin)+Index.xmin;
				Index.y=Math.random()*(Index.ymax-Index.ymin)+Index.ymin;
				
				//start on a random vector
				Index.my_xy_factors=getVectorMultiplier(Index.x,Index.y,Math.random()*100+Index.x-50,Math.random()*100+Index.y-50);				
				Index.velX=Index.baseVel*(Index.sugar+1)/10*Index.my_xy_factors[0];
				Index.velY=Index.baseVel*(Index.sugar+1)/10*Index.my_xy_factors[1];
				
				//Set flag for kid in the house
				Index.inHouse=rooms[0].inRoom(Index.x,Index.y);
				
				//misc getters
				Index.getRoom = function(){
					return Index.currentRoomName;
				};
				
				Index.getSugar = function(){
					return Index.sugar;
				};
				
				Index.getName = function(){
					return Index.name;
				};

				Index.update = function() {					
					//while there is time on the clock, bounce off the walls.
					//Once there isn't....
					//pick a place to go
					//pick a door to leave by
					//	adjust movement to connect to the inside of the door
					//	leave the room straight through the door
					//	once all the way into the next room pick a path.
					// 		if that room is the goal, a random angle will suffice and reset the timeLeft
					// 		otherwise leave through the other door following the same process as before.
					//  		if this is the hall, pick a random door and mark it off the list of valid doors for the next choice.
									
					
					if(Index.timeLeftInRoom>=0){  //still playtime in this room?
						//If we are just running around, we can update movement here.  Otherwise it is at the bottom.
						Index.x+=Index.velX;
						Index.y+=Index.velY;
					
						Index.timeLeftInRoom-=1;
						if(Index.x<Index.currentRoom.x0||(Index.x+Index.width)>Index.currentRoom.x1){
							Index.velX*=-1;
							Index.x+=Index.velX*2;
						}
						if(Index.y<Index.currentRoom.y0||(Index.y+Index.height)>Index.currentRoom.y1){
							Index.velY*=-1;
							Index.y+=Index.velY*2;
						}
						
					}else if(Index.timeLeftInRoom!=-999){  						//call once to setup next goal room
					
						Index.validHallDoorList=hallDoorList; 					//need this set once for future hall travel
						
						do{Index.goalRoomIndex=Math.floor(Math.random()*7+1); 	//choose a new room to go to
						}while (Index.goalRoomIndex==Index.currentRoomIndex)
						
						Index.timeLeftInRoom=-999;								//set the flag to avoid these steps until the next room is compelte
						Index.exitDoorSelected=false;							//init this for travel
						
					}else{	//travel between rooms until the goal room is found
						
						if(Index.currentRoom.equals(rooms[Index.goalRoomIndex])){	//are we there yet?
						
							Index.timeLeftInRoom=Math.random()*600+200;
							
							Index.my_xy_factors=getVectorMultiplier(Index.x,Index.y,Math.random()*100+Index.x-50,Math.random()*100+Index.y-50);				
							Index.velX=Index.baseVel*(Index.sugar+1)/10*Index.my_xy_factors[0];
							Index.velY=Index.baseVel*(Index.sugar+1)/10*Index.my_xy_factors[1];
						
						}else{  //keep calm and carry on
							if(!Index.exitDoorSelected){ //select a door to go out if one isn't already set
								if(Index.currentRoomIndex!=0){
									Index.doorChoice=Math.round(Math.random());  //Pick one of the two doors in the room.
								}else{	//Hall is a special case
									Index.doorChoice=Math.round(Math.random()*Index.validHallDoorList.length);									
									Index.validHallDoorList.splice(Index.doorChoice,1);  //remove that door from the hall door list									
								}
								
								//Get the door information for planning
								Index.doorX=portals[Index.currentRoom.dList[Index.doorChoice]].getX();
								Index.doorY=portals[Index.currentRoom.dList[Index.doorChoice]].getY();
								
								//Store the next Room for future use.  Uneeded
								//Index.nextRoom=portals[Index.currentRoom.dList[Index.doorChoice]].getOtherRoom(Index.currentRoomIndex);
								
								//Adjust for the offset to allow kids to go straight through.
								//Exit path is used to identify when the doorway is cleared.
								Index.exitPathX=0;  
								Index.exitPathY=0;
								if(portals[Index.currentRoom.dList[Index.doorChoice]].getType()=="horizontal"){
									Index.doorX-=Index.width/2;
									if((Index.doorY-Index.y)>0){
										Index.doorY-=Index.height;
										Index.exitPathY=Index.height/2;
									}else{
										Index.exitPathY=-Index.height/2;
									}
									Index.exitPathX=0;									
								}else{
									Index.doorY-=Index.height/2;
									if((Index.doorX-Index.x)>0){
										Index.doorX-=Index.width;
										Index.exitPathX=Index.width/2;
									}else{
										Index.exitPathXY=-Index.width/2;
									}
									Index.exitPathY=0;
								}									
								
								//Adjust the kid's vector to aim at the door.
								Index.my_xy_factors=getVectorMultiplier(Index.x,Index.y,Index.doorX,Index.doorY);				
								Index.velX=Index.baseVel*(Index.sugar+1)/10*Index.my_xy_factors[0];
								Index.velY=Index.baseVel*(Index.sugar+1)/10*Index.my_xy_factors[1];
								
								//Flag that we have done all of this and do not need to do it again until the door is cleared.
								Index.exitDoorSelected=true;
								
								//Index.oldX=Index.x;//˝
								//Index.oldY=Index.y;//˝
								
							} //end door selection
							
							//move towards and through the next exit door and line up with it
							if(Math.abs(Index.velX)>Math.abs(Index.x-Index.doorX)){
								Index.velX=0;
								Index.x=Index.doorX;								
							}
							if(Math.abs(Index.velY)>Math.abs(Index.y-Index.doorY)){
								Index.velY=0;
								Index.y=Index.doorY;
							}
							
							//if lined up, set a waypoint on the other side of the door and adjust the kid's vector to reach it.
							if(Index.velY==0&&Index.velX==0){
								Index.my_xy_factors=getVectorMultiplier(Index.x,Index.y,Index.x+Index.exitPathX,Index.y+Index.exitPathY);
								Index.velX=Index.baseVel*(Index.sugar+1)/10*Index.my_xy_factors[0];
								Index.velY=Index.baseVel*(Index.sugar+1)/10*Index.my_xy_factors[1];
								
								//Store a counter to judge progress
								Index.passDistX=Math.abs(Index.exitPathX);
								Index.passDistY=Math.abs(Index.exitPathY);
								
								Index.inDoorWay=true;  //Set the flag indicating that the doorway is being navigated.
							}
							
							//take some steps
							Index.x+=Index.velX;
							Index.y+=Index.velY;
					
							//navigate any doorways
							if(Index.inDoorWay){
								if(Index.passDistX>=0){Index.passDistX-=Math.abs(Index.velX);}
								if(Index.passDistY>=0){Index.passDistY-=Math.abs(Index.velY);}
								//If we are out of the doorway, note that.
								if(Index.passDistX<=0&&Index.passDistY<=0){  //got into the next room
									Index.inDoorWay=false;
									Index.exitDoorSelected=false;
								}
							}								
						}
					}
					currentRoom=getCurrentRoom(Index.x,Index.y);
				};  // end update
				
				Index.draw=function(){
					canvas.fillStyle=Index.color;
					canvas.drawImage(kid_image, Index.x,Index.y);
					canvas.fillText(Index.name,Index.x,Index.y);					
				};
				
				Index.drawPanel = function(x,y){
					canvas.fillText(Index.name,x,y);
					canvas.fillText("Location:",x+15,y+10);
					canvas.fillText("Sugar Level:",x+15,y+20);					
					canvas.fillText(Index.currentRoomName,x+80,y+10);
					canvas.fillText(Index.sugar,x+80,y+20);
					
					//------˝DEBUGGING˝-----
					
					debugStrings=new Array;
					debugStrings.push(String("In House:"+Index.inHouse));
					debugStrings.push("Time Left:"+Index.timeLeftInRoom);
					debugStrings.push("nextRoomID:"+Index.goalRoomIndex);
					debugStrings.push("nextRoomName:"+rooms[Index.goalRoomIndex].getName());
					debugStrings.push("DoorChoice:"+Index.doorChoice);
					debugStrings.push("PosX:"+Math.floor(Index.x)+"  DoorX:"+Index.doorX);
					debugStrings.push("PosY:"+Math.floor(Index.y)+"  DoorY:"+Index.doorY);
					debugStrings.push("Passing:"+Index.inDoorWay);
					debugStrings.push("Test:"+Index.test);
					//debugStrings.push("VelX:"+Index.velX+"   oldX:"+Index.oldX);
					//debugStrings.push("VelY:"+Index.velY+"   oldY:"+Index.oldY);
					
					debug_y=y+40;
					canvas.fillStyle="#000";
					
					canvas.fillText("Debug:",x+15,debug_y);
					$.each(debugStrings, function() {
						canvas.fillText(this,x+80,debug_y);
						debug_y+=10;
					});				
				};
				
				return Index;				
				
			};
			
			function init(){
				bg_image.src = 'images/background.png';
				kid_image.src = 'images/kid.png';
				
				rooms.push(Room({roomName:"Halls",			x0:330,y0:0,	x1:667,y1:600,	dList:[0,3,4,7,8,10,11],	thisColor:"#FFF"}));
				rooms.push(Room({roomName:"Kid's Room",		x0:330,y0:0,	x1:475,y1:135,	dList:[0,1],	thisColor:"#00F"}));
				rooms.push(Room({roomName:"Kid's Bathroom",	x0:330,y0:135,	x1:475,y1:200,	dList:[1,2],	thisColor:"#0F0"}));
				rooms.push(Room({roomName:"Office",			x0:330,y0:200,	x1:475,y1:335,	dList:[2,3],	thisColor:"#0FF"}));
				rooms.push(Room({roomName:"Kitchen",		x0:330,y0:335,	x1:475,y1:482,	dList:[4,5],	thisColor:"#F00"}));
				rooms.push(Room({roomName:"Dining Room",	x0:330,y0:482,	x1:475,y1:600,	dList:[5,6],	thisColor:"#F0F"}));
				
				rooms.push(Room({roomName:"Living Room",		x0:475,y0:385,	x1:667,y1:600,	dList:[6,7],	thisColor:"#888"}));
				rooms.push(Room({roomName:"Parent's Bathroom",	x0:524,y0:225,	x1:667,y1:338,	dList:[8,9],	thisColor:"#F55"}));
				rooms.push(Room({roomName:"Parent's Room",		x0:524,y0:0,	x1:667,y1:225,	dList:[9,10],	thisColor:"#FF0"}));
				rooms.push(Room({roomName:"Outside",			x0:667,y0:0,	x1:800,y1:600,	dList:[11],		thisColor:"#FF0"}));
				
				portals.push(Portal({x:475,y:98	,room0:1,room1:0,type:"vertical"}));	//0 - kids to hall
				portals.push(Portal({x:370,y:138,room0:1,room1:2,type:"horizontal"}));	//1 - kids to kids bath
				portals.push(Portal({x:370,y:200,room0:2,room1:3,type:"horizontal"}));	//2 - kids bath to office
				portals.push(Portal({x:475,y:230,room0:3,room1:0,type:"vertical"}));	//3 - office to hall
				portals.push(Portal({x:475,y:360,room0:4,room1:0,type:"vertical"}));	//4 - hall to kitchen
				portals.push(Portal({x:410,y:480,room0:4,room1:5,type:"horizontal"}));	//5 - kitchen to dining
				portals.push(Portal({x:475,y:540,room0:5,room1:6,type:"vertical"}));	//6 - dining to living
				portals.push(Portal({x:535,y:385,room0:6,room1:0,type:"horizontal"}));	//7 - living to hall
				portals.push(Portal({x:525,y:275,room0:7,room1:0,type:"vertical"}));	//8 - hall to master bath
				portals.push(Portal({x:610,y:225,room0:7,room1:8,type:"horizontal"}));	//9 - master bath to master
				portals.push(Portal({x:475,y:275,room0:8,room1:0,type:"vertical"}));	//10 - master to hall
				portals.push(Portal({x:666,y:360,room0:9,room1:0,type:"vertical"}));	//11 - hall to world
				
				hallDoorList=[0,3,4,7,8,10];
				
				kids.push(Kid({name:"Thing 1",color:"#F0F"}));
				//kids.push(Kid({name:"Thing 2",color:"#0F0"}));
				//kids.push(Kid({name:"Thing 3",color:"#0FF"}));				
				//kids.push(Kid({name:"Thing 4",color:"#FF0"}));				
			}
			
			setInterval(function(){
					update();
					draw();
				},1000/FPS);

			function update(){
				textX+=1;
				textY+=1;
				kids.forEach(function(kid) {
					kid.update();
				});
			}
			
			function draw(){
				canvas.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
				canvas.drawImage(bg_image, 0, 0);
				canvas.fillStyle="#000";
				rooms.forEach(function(room) {
					room.draw();
					canvas.fillStyle="#000";
					canvas.fillText(room.getName(),room.getX()+5,room.getY()+10);
				});
				
				nextPanelX=50;
				nextPanelY=50;
				kids.forEach(function(kid) {		
						kid.draw();
						kid.drawPanel(nextPanelX,nextPanelY);
						nextPanelY+=150;
				});

				debug_y=200;
				canvas.fillStyle="#000";
				canvas.fillText("Debug:",5,debug_y);
				$.each(debugMessages, function() {
					canvas.fillText(this,10,debug_y+=10);
				});										
			}

			init();
			canvasElement.appendTo('body');
			
		</script>
	</body>
</html>