cc.Class({
    extends: cc.Component,

    properties: {
        xPosition:0,
        yPosition:0,
        speed:10,
        isOnFloor:true,
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
        var playerYMove=this.floorMove(),
            _currentFloor=this.currentFloor.getComponent('floor');
        this.playerMove(distance,playerYMove,_currentFloor.rotateAngle);
    },

    playerMove:function (distance,playerYMove,_rotateAngle){
        this.xPosition+=distance;
        this.yPosition+=playerYMove;
        //根据角度更新速度等级
        _rotateAngle*distance?this.speedLevel+=_rotateAngle/10:this.speedLevel-=_rotateAngle/10;
    },

    floorMove:function (){
        var playerXPosition=this.xPosition,
            distanceFromCenter=playerXPosition-this.currentFloor.x,
            playerYMove=0,
            _currentFloor=this.currentFloor.getComponent('floor');
        //通过player在floor上的位置计算floor旋转的一定角度的时间间隔
        _currentFloor.rotateDuration/=Math.abs(distanceFromCenter);
        //当player在floor的左半部分时，旋转角度为负
        if(!distanceFromCenter){
            _currentFloor.rotateAngle=-_currentFloor.rotateAngle;
        }
        //当floor上的player下降时
        if(_currentFloor.rotateAngle*distanceFromCenter){
            playerYMove=Math.abs(distanceFromCenter)*Math.sin(Math.abs(_currentFloor.rotateAngle)*0.0174533);
        }else{
            playerYMove=-Math.abs(distanceFromCenter)*Math.sin(Math.abs(_currentFloor.rotateAngle)*0.0174533); 
        }
        //返回player的垂直移动距离
        return playerYMove;
    },

    update (dt) {
        this.node.x=this.xPosition;
        var _currentFloor=this.currentFloor._components[1];
        var moveYPosition=new cc.moveTo(_currentFloor.rotateDuration, cc.p(this.xPosition, this.yPosition)).easing(cc.easeCubicActionIn());
        var floorRotate=new cc.moveBy(_currentFloor.rotateDuration, _currentFloor.rotateAngle).easing(cc.easeCubicActionIn());
        this.node.runAction(new cc.Spawn(moveYPosition,floorRotate));
    },
});
