cc.Class({
    extends: cc.Component,

    properties: {
        xPosition:0,
        yPosition:0,
        speed:0,
        direction:true,//true:left;false:right
        isOnFloor:true,    
    },

    // use this for initialization
    onLoad: function () {
        cc.inputManager.setAccelerometerEnabled(true);
        cc.systemEvent.on(cc.SystemEvent.EventType.DEVICEMOTION, this.onDeviceMotionEvent, this);
    },

    onDeviceMotionEvent:function (event){
        this.xPosition+=event.acc.x;
        this.yPosition+=event.acc.y;
    },

    update (dt) {
        this.node.x=this.xPosition;
        this.node.y=this.yPosition;
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
