cc.Class({
    extends: cc.Component,

    properties: {
        backMusic: { default: null, type: cc.AudioClip },
        clickSound: { default: null, type: cc.AudioClip },
        eliminateSound: { default:[], type: [cc.AudioClip] },
        matchSound: { default:[], type: [cc.AudioClip] },
    },
    playBackMusic: function () {
        cc.audioEngine.playMusic(this.backMusic,true);
    },
    playClickSound: function () {
        cc.audioEngine.playEffect(this.clickSound,false);
    },
    playEliminateSound: function (i) {
        cc.audioEngine.playEffect(this.eliminateSound[i],false);
    },
    playMatchSound: function(i){
        cc.audioEngine.playEffect(this.matchSound[i],false)
    },

});
