cc.Class({
    extends: cc.Component,

    properties: {
        xPosition:0,
        yPosition:0,
        speed:10,
        isOnFloor:true,
        baseSpeedLevel:1,
        speedLevel:0,
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
        this.yPosition=this.currentFloor.y;
        //绑定重力感应事件
        cc.inputManager.setAccelerometerEnabled(true);
        cc.systemEvent.on(cc.SystemEvent.EventType.DEVICEMOTION, this.onDeviceMotionEvent, this);
    },

    onDeviceMotionEvent:function (event){
        //player移动的距离
        var distance=event.acc.x*this.speed*this.speedLevel;
        this.groupMove(distance);
    },

    groupMove:function (distance){
        var playerYMoveDirecition=this.floorMove(),
            _currentFloor=this.currentFloor.getComponent('floor');
        this.playerMove(distance,playerYMoveDirecition);
    },

    playerMove:function (distance,playerYMoveDirecition){
        //console.log(_floorAngle);
        var _floorAngle=this.currentFloor.rotation;
        this.xPosition+=(distance*Math.cos(Math.abs(_floorAngle)*0.0174533));
        this.yPosition+=(!playerYMoveDirecition?distance*Math.sin(Math.abs(_floorAngle)*0.0174533):-(distance*Math.sin(Math.abs(_floorAngle)*0.0174533)));
        //根据角度更新速度等级
        _floorAngle*distance?this.speedLevel=this.baseSpeedLevel+Math.abs(_floorAngle/10):this.speedLevel=this.baseSpeedLevel-Math.abs(_floorAngle/10);
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
        console.log("distanceFromCenter: "+distanceFromCenter);
        if(distanceFromCenter<-10){
            _currentFloor.rotateAngle=-_currentFloor.baseRotateAngle;
        }else if(distanceFromCenter>10){
            _currentFloor.rotateAngle=Math.abs(_currentFloor.baseRotateAngle);
        }else{
            _currentFloor.rotateAngle=0;
        }
        //当floor上的player下降时
        if(_currentFloor.floorAngle*distanceFromCenter>=0){
            playerYMoveDirecition=true;
        }else{
            playerYMoveDirecition=false; 
        }
        //返回player的垂直移动方向
        return playerYMoveDirecition;
    },

    update (dt) {
        this.node.x=this.xPosition;
        this.node.y=this.yPosition;
        // console.log("this.xPosition:   "+this.xPosition);
        // console.log("this.yPosition:   "+this.yPosition);
        var _currentFloor=this.currentFloor.getComponent('floor'),
            moveYPosition=new cc.moveBy(0.2, cc.p(0, this.yPosition)),
            floorRotate=new cc.RotateBy(0.2, _currentFloor.rotateAngle),
            callback = cc.callFunc(this.getFloorAngle, this,_currentFloor),
            _maxFloorAngle=_currentFloor.maxFloorAngle-_currentFloor.baseRotateAngle;
        //this.node.runAction(moveYPosition);
        if((_currentFloor.floorAngle<_maxFloorAngle&&_currentFloor.floorAngle>-_maxFloorAngle)
        ||(_currentFloor.floorAngle*_currentFloor.rotateAngle<0)){
            this.currentFloor.runAction(cc.sequence(floorRotate,callback));
        }
    },

    getFloorAngle:function (currentFloor){
        var _currentFloor=currentFloor.getComponent("floor");
        _currentFloor.floorAngle=this.currentFloor.rotation;
    },
});
