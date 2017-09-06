cc.Class({
    extends: cc.Component,

    properties: {
        floorGap:0,
        //最底下的floor的Y坐标
        bottomFloorY:0,
        //最底下的floor的X坐标
        bottomFloorX:0,
        //floor数组
        floorArray:[],
        otherFloor: {
            default: null,
            type: cc.Prefab
        },
        initFloor: {
            default: null,
            type: cc.Node
        },
        player: {
            default: null,
            type: cc.Node
        },        
    },

    // use this for initialization
    onLoad: function () {
        this.player.getComponent("player").game=this;
        this.createNewFloor();
    },

    createNewFloor:function (){
        while(this.bottomFloorY>this.node.y-this.node.height){
            var newFloor = cc.instantiate(this.otherFloor);
            this.node.addChild(newFloor);
            this.setWidth(newFloor);
            newFloor.setPosition(this.setPosition(newFloor));
            for(var i=0;i<10;i++){
                var index=Math.round(this.bottomFloorY)+i;
                this.floorArray[index]=newFloor;
            }
        }
    },

    setPosition:function (newFloor){
        //控制floor的随机宽度在initFloor宽度的0.5到1倍
        var floorWidth=newFloor.width,
            minX=-(this.node.width/2)+floorWidth,
            maxX=this.node.width/2-floorWidth,
            floorX=0,
            floorY=this.bottomFloorY-(Math.random()+1)*this.floorGap;
        if(this.bottomFloorX>=0){
            floorX=Math.random()*minX;
        }else{
            floorX=Math.random()*maxX;
        }
        this.bottomFloorX=floorX;
        this.bottomFloorY=floorY;
        return cc.p(floorX,floorY);
    },

    setWidth:function (newFloor){
        newFloor.width=this.initFloor.width*(Math.abs(Math.random()-0.5)+0.8);
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
