cc.Class({
    extends: cc.Component,

    properties: {
        xFloorPosition:0,
        yFloorPosition:0,
        floorAngle:0,
        maxFloorAngle:30,
        baseRotateAngle:15,
        rotateAngle:0,
        baseRotateDuration:0.1,
        rotateDuration:0.03,
        isPlayerOn:false,
        floorSpeed:5,
    },

    // use this for initialization
    onLoad: function () {
        //初始化上升速度
        
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
