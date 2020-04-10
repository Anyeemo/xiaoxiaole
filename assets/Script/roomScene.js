

cc.Class({
    extends: cc.Component,

    properties: {
        bar: {
            default: null,
            type: cc.ProgressBar
        },
        backGround: {
            default: null,
            type: cc.AudioClip,
        },
        click: {
            default: null,
            type: cc.AudioClip,
        },
        progressBar: cc.Node,
        startButton: cc.Button,
        
    },
    
    onLoad: function() {
        cc.audioEngine.playMusic(this.backGround,true);
        this.able = false;//进度条加载使能
        this.done = true;//场景加载使能
        this.bar.node.active = false;//隐藏进度条
        this.progress = this.bar.progress;
        this.progress = 0;//进度条初始化
        
    },
    start: function() {
        
    },

    onClickStart: function() {
        cc.audioEngine.playEffect(this.click,false);
        cc.director.preloadScene('GameScene')
        this.able = true;//开始加载进度条
        this.startButton.node.active = false;//隐藏按钮
        this.bar.node.active = true;//显示进度条
    },
    update: function(dt) {
        if(this.able)//进度条加载使能
        {
            if (this.progress < 1) {
                this.progress += dt * Math.random() * 0.5;
            }
            else {
                this.progress = 1;
                if(this.done){//场景加载使能
                    cc.audioEngine.stopMusic();//停止背景音乐
                    cc.director.loadScene('GameScene');
                }
                this.done =false;
            }
            this.bar.progress = this.progress;
        }
    },
})