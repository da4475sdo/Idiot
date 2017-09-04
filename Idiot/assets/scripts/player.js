cc.Class({
    extends: cc.Component,

    properties: {
        xPosition:0,
        yPosition:0,
        speed:10,
        isOnFloor:true,
        baseSpeedLevel:1,
        speedLevel:0,
        //player距离的地板的高度
        fromFloorHeight:0,
        //player静止的距离范围
        stopRange:10,
        //floor下降时，player下落移动时长
        moveYDuration:2,
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
        //绑定重力感应事件
        cc.inputManager.setAccelerometerEnabled(true);
        cc.systemEvent.on(cc.SystemEvent.EventType.DEVICEMOTION, this.onDeviceMotionEvent, this);
    },

    onDeviceMotionEvent:function (event){
        //player移动的距离
        var deviceMotion=event.acc.x,
            distance=deviceMotion*this.speed*this.speedLevel;
        this.groupMove(distance);
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
        //通过player在floor上的位置计算floor旋转的一定角度的时间间隔
        //_currentFloor.rotateDuration=Math.abs(distanceFromCenter)*2<=floorWidth?_currentFloor.baseRotateDuration-(Math.abs(distanceFromCenter)*2/floorWidth):_currentFloor.baseRotateDuration;
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
    },

    getFloorAngle:function (currentFloor){
        var _currentFloor=currentFloor.getComponent("floor");
        _currentFloor.floorAngle=this.currentFloor.rotation;
    },
});
