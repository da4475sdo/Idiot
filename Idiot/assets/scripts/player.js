cc.Class({
    extends: cc.Component,

    properties: {
        xPosition:0,
        yPosition:0,
        speed:10,
        isOnFloor:true,
        jumpLevel:0,
        baseSpeedLevel:1,
        speedLevel:0,
        //player距离的地板的高度
        fromFloorHeight:0,
        //player静止的距离范围
        stopRange:10,
        //floor下降时，player下落移动时长
        moveYDuration:2,
        //player下落的时长
        fallDuration:10,
         // player node 当前所在的floor node
        currentFloor: {
            default: null,
            type: cc.Node
        },    
    },

    // use this for initialization
    onLoad: function () {
        //初始化player node 位置
        this.xPosition=this.currentFloor.x;
        this.yPosition=this.currentFloor.y+this.fromFloorHeight;
        this.currentFloor.getComponent("floor").isPlayerOn=true;
        //绑定重力感应事件
        cc.inputManager.setAccelerometerEnabled(true);
        cc.systemEvent.on(cc.SystemEvent.EventType.DEVICEMOTION, this.onDeviceMotionEvent, this);
    },

    onDeviceMotionEvent:function (event){
        //player移动的距离
        var deviceMotion=event.acc.x,
            distance=deviceMotion*this.speed*this.speedLevel,
            playerToFloorCenterDis=Math.sqrt((this.node.x-this.currentFloor.x)*(this.node.x-this.currentFloor.x)
            +(this.node.y-this.currentFloor.y)*(this.node.y-this.currentFloor.y));
        //判断player是在floor上移动还是下落
        if(playerToFloorCenterDis<(this.currentFloor.width+this.node.width)/2){
            this.groupMove(distance);
        }else{
            if(this.isOnFloor&&this.currentFloor.getComponent("floor").isPlayerOn){
                this.playerFall(Math.abs(distance));
                this.floorRest();
            }
        }
    },

    groupMove:function (distance){
        var playerYMoveDirecition=this.floorMove(),
            _currentFloor=this.currentFloor.getComponent('floor');
        this.playerMove(distance,playerYMoveDirecition,_currentFloor);
    },

    playerMove:function (distance,playerYMoveDirecition,_currentFloor){
        var _floorAngle=this.currentFloor.rotation,
            yMoveDistance=distance*Math.sin(Math.abs(_floorAngle)*0.0174533);
        this.xPosition+=(distance*Math.cos(Math.abs(_floorAngle)*0.0174533));
        this.yPosition+=playerYMoveDirecition?-yMoveDistance:yMoveDistance;
        //根据角度更新速度等级
        _floorAngle*distance?this.speedLevel=this.baseSpeedLevel+Math.abs(_floorAngle):this.speedLevel=this.baseSpeedLevel-Math.abs(_floorAngle);
    },

    floorMove:function (){
        var playerXPosition=this.xPosition,
            distanceFromCenter=playerXPosition-this.currentFloor.x,
            playerYMoveDirecition=true,
            floorWidth=this.currentFloor.width,
            _currentFloor=this.currentFloor.getComponent('floor');
        //当player在floor的左半部分时，旋转角度为负
        if(distanceFromCenter<-this.stopRange){
            _currentFloor.rotateAngle=-_currentFloor.baseRotateAngle;
        }else if(distanceFromCenter>this.stopRange){
            _currentFloor.rotateAngle=Math.abs(_currentFloor.baseRotateAngle);
        }else{
            _currentFloor.rotateAngle=0;
        }
        //当floor上的player下降时
        if(_currentFloor.floorAngle>0){
            playerYMoveDirecition=true;
        }else{
            playerYMoveDirecition=false; 
        }
        //返回player的垂直移动方向
        return playerYMoveDirecition;
    },

    update (dt) {
        if(this.isOnFloor){
            var _currentFloor=this.currentFloor.getComponent('floor'),
                floorRotate=new cc.RotateBy(_currentFloor.rotateDuration, _currentFloor.rotateAngle),
                callback = cc.callFunc(this.getFloorAngle, this,_currentFloor),
                _maxFloorAngle=_currentFloor.maxFloorAngle-_currentFloor.baseRotateAngle,
                _fromFloorHeight=this.currentFloor.y+this.fromFloorHeight;
            if((Math.abs(this.yPosition)<=Math.abs(_fromFloorHeight))||(_currentFloor.floorAngle===0)){
                this.node.y=this.yPosition;
                this.node.x=this.xPosition;
            }else{
                this.yPosition= _fromFloorHeight;
            }
            //控制floor的最大旋转角度
            if((_currentFloor.floorAngle<_maxFloorAngle&&_currentFloor.floorAngle>-_maxFloorAngle)
            ||(_currentFloor.floorAngle*_currentFloor.rotateAngle<=0)){
                this.currentFloor.runAction(cc.sequence(floorRotate,callback));
            }
        }else{
            var playerNode=this.node,
                playerNodeY=playerNode.y,
                playerNodeX=playerNode.x,
                playerWidth=playerNode.width,
                floorNode=this.game.floorArray[Math.round(playerNodeY)],
                floorWidth=floorNode&&floorNode.width;
            if(floorNode&&this.currentFloor!=floorNode&&(playerNodeX<=floorNode.x+floorWidth/2&&playerNodeX>=floorNode.x-floorWidth/2)){
                this.currentFloor=floorNode;
                this.isOnFloor=true;
                playerNode.stopAllActions();
                this.xPosition=playerNodeX;
                this.yPosition=playerNodeY;
                this.currentFloor.getComponent("floor").isPlayerOn=true;
            }
        }
    },

    getFloorAngle:function (currentFloor){
        var _currentFloor=currentFloor.getComponent("floor");
        _currentFloor.floorAngle=this.currentFloor.rotation;
    },

    playerFall:function (distance){
        this.isOnFloor=false;
        this.currentFloor.getComponent("floor").isPlayerOn=false;
        var landX=this.currentFloor.rotation>=0?this.speed*(this.speedLevel+distance*this.jumpLevel):-this.speed*(this.speedLevel+distance*this.jumpLevel),
            scene=this.node.getParent(),
            landY=(scene.y-scene.height)-this.yPosition,
            fallXMove=cc.moveBy(this.fallDuration,cc.p(landX,0)).easing(cc.easeCircleActionOut()),
            fallYMove=cc.moveBy(this.fallDuration,cc.p(0,landY)).easing(cc.easeCircleActionIn());
        this.node.runAction(cc.spawn(fallXMove,fallYMove));
    },

    floorRest:function (){
        var floorRestRoration=cc.rotateTo(1,0);
        this.currentFloor.runAction(floorRestRoration);
    },
});
