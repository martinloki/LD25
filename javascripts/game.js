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
								
								//Index.oldX=Index.x;//½
								//Index.oldY=Index.y;//½
								
							} //end door selection
						}