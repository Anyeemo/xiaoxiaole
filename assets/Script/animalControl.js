var Global = require('animalModel')
cc.Class({
    extends: cc.Component,
    properties: {
        bear: cc.Prefab,
        cat: cc.Prefab,
        chicken: cc.Prefab,
        fox: cc.Prefab,
        frog: cc.Prefab,
        horse: cc.Prefab,
        scoreNum: cc.Label,
        bird: cc.Prefab,
        ready: cc.Node,
        soundControl: cc.Node,
        protection: cc.Node,
    },
    onLoad: function () {
        //拦截输入-隐藏
        this.protection.active = false;
        //获取音效控制脚本
        this.sound = this.soundControl.getComponent('sound')
        //播放背景音乐
        this.sound.playBackMusic();
        //开始按钮-显示
        this.ready.active = true;
        //初始化分数为0
        this.score = 0;
        //消除次数计数初始化为0
        this.eliminateNum = 0;
        //是否有动物被点击（选中状态）
        this.isAnimalClick = false;
        //选中状态的格子
        this.animalClick = [];
        //初始化动物
        this.initAnimal();
    },

    start: function () {
        //触摸检测
        this.onTouch();
    },

    update: function () {
        this.scoreNum.string = '分数：' + this.score;
        console.log(this.eliminateNum)
    },

    onButtonStart: function () {
        //播放点击音效
        this.sound.playClickSound();
        //开始按钮-隐藏
        this.ready.active = false;
        //判断是否可消除
        this.isClean();
    },

    isClean: function () {
        //遍历所有方格
        this.removeAnimal();
        //抖动并消除
        this.shakeAndCleanGround();
        //如果没有可消除的&&有点击&&点击距离大于50，则交换回来
        if (this.removeArr.length == 0) {
            if (this.startPoint && this.distance > 50) {
                //交换回来
                this.restore()
            }
            this.playMatch();
            this.protection.active = false;
            return;
        } else {
            //消除的时候停止输入事件
            this.protection.active = true;
            //消除的时候停止动画和方框
            if (this.isAnimalClick) {
                this.isClick(this.start, this.end, true);
            }
            //消除次数+1
            this.eliminateNum++;
            this.scheduleOnce(function () {
                this.clean();
            }, 0.8)
            this.scheduleOnce(function () {
                this.fall();
            }, 0.8);
            this.scheduleOnce(function () {
                this.isClean();
            }, 1.5);
        }
        this.startPoint = null;
    },
    //消除次数奖励音效
    playMatch: function () {
        if (this.eliminateNum > 2) {
            this.sound.playMatchSound(this.eliminateNum - 3)
        }
        if (this.eliminateNum > 7) {
            this.sound.playMatchSound(4)
        }
    },
    //消除音效
    playEliminate: function () {
        if (this.eliminateNum < 8) {
            this.sound.playEliminateSound(this.eliminateNum);
        } else {
            this.sound.playEliminateSound(7);
        }
    },
    //监听触摸
    onTouch: function () {
        this.node.on(cc.Node.EventType.TOUCH_START, (event) => {
            //获取触摸开始坐标
            this.startPoint = event.getLocation();
            //消除次数归0
            this.eliminateNum = 0;
        });
        this.node.on(cc.Node.EventType.TOUCH_END, (event) => {
            //播放点击音效
            this.sound.playClickSound();
            //获取触摸结束坐标
            this.endPoint = event.getLocation();
            //坐标转换为编号
            this.start = this.positionToOrder(this.startPoint);
            this.end = this.positionToOrder(this.endPoint);
            //判断起始点是否是同一个格子
            this.isClick(this.start, this.end, false);
            //触摸移动距离
            this.vec = this.endPoint.sub(this.startPoint);
            this.distance = this.vec.mag();
            if (this.distance > 50) {
                //判断滑动方向
                if (Math.abs(this.vec.x) > Math.abs(this.vec.y)) {
                    if (this.vec.x < 0) {
                        this.moveLeft(this.start);
                    } else {
                        this.moveRight(this.start);
                    }
                } else {
                    if (this.vec.y < 0) {
                        this.moveDown(this.start);
                    } else {
                        this.moveUp(this.start);
                    }
                }
            }
            this.scheduleOnce(function () {
                this.isClean()
            }, 0.5);

        });
    },
    //初始化随机动物
    initAnimal: function () {
        //初始化动物数组animalGroup
        this.animalGroup = [];
        //动物种类
        this.birdModel = [this.bear, this.cat, this.chicken, this.fox, this.frog, this.horse, this.bird];
        for (var i = 0; i < 10; i++) {
            //初始化动物数组为2维
            this.animalGroup[i] = [];
            for (var j = 0; j < 10; j++) {
                this.initOneAnimal(i, j);
            }
        }
    },
    //初始化一个动物
    initOneAnimal: function (i, j, pos) {
        //0-5随机，代表5种动物
        var ran = this.random(0, 5);
        //实例化一个随机动物
        var animal = cc.instantiate(this.birdModel[ran]);
        //定义动物种类
        animal.animalType = ran;
        //动物是否被加入消除数组
        animal.isJoin = false;
        animal.posX = i;
        animal.posY = j;
        //添加到父节点
        this.node.addChild(animal);
        //是否输入坐标
        if (pos) {
            animal.setPosition(pos);
        } else {
            animal.setPosition(Global.position[i][j]);
        }
        //存入动物数组
        this.animalGroup[i][j] = animal;
    },
    //随机函数
    random: function (min, max) {
        return (Math.round(Math.random() * (max - min) + min))
    },

    /********************************************************************************** */
    //触摸移动
    moveLeft: function (start) {
        if (start.x == 0) {
            return
        } else {
            var pos1 = cc.v2(-70, 0);
            var pos2 = cc.v2(70, 0);
            this.move(pos1, pos2, this.animalGroup[start.x][start.y], this.animalGroup[start.x - 1][start.y]);
            this.exchange(this.animalGroup[start.x][start.y], this.animalGroup[start.x - 1][start.y]);
            this.isHaveFrame(start.x, start.y, false);
            this.isHaveFrame(start.x - 1, start.y, false);

        }
    },
    moveRight: function (start) {
        if (start.x == 9) {
            return
        } else {
            var pos1 = cc.v2(70, 0);
            var pos2 = cc.v2(-70, 0);
            this.move(pos1, pos2, this.animalGroup[start.x][start.y], this.animalGroup[start.x + 1][start.y]);
            this.exchange(this.animalGroup[start.x][start.y], this.animalGroup[start.x + 1][start.y]);
            this.isHaveFrame(start.x, start.y, false);
            this.isHaveFrame(start.x + 1, start.y, false);

        }
    },
    moveUp: function (start) {
        if (start.y == 9) {
            return
        } else {
            var pos1 = cc.v2(0, 70);
            var pos2 = cc.v2(0, -70);
            this.move(pos1, pos2, this.animalGroup[start.x][start.y], this.animalGroup[start.x][start.y + 1]);
            this.exchange(this.animalGroup[start.x][start.y], this.animalGroup[start.x][start.y + 1]);
            this.isHaveFrame(start.x, start.y, false);
            this.isHaveFrame(start.x, start.y + 1, false);

        }
    },
    moveDown: function (start) {
        if (start.y == 0) {
            return
        } else {
            var pos1 = cc.v2(0, -70);
            var pos2 = cc.v2(0, 70);
            this.move(pos1, pos2, this.animalGroup[start.x][start.y], this.animalGroup[start.x][start.y - 1]);
            this.exchange(this.animalGroup[start.x][start.y], this.animalGroup[start.x][start.y - 1]);
            this.isHaveFrame(start.x, start.y, false);
            this.isHaveFrame(start.x, start.y - 1, false);

        }
    },
    move: function (pos1, pos2, animal1, animal2) {
        animal1.runAction(cc.moveBy(0.3, pos1));
        animal2.runAction(cc.moveBy(0.3, pos2));
    },
    //交换位置
    exchange: function (order1, order2) {
        var x1 = order1.posX
        var x2 = order2.posX
        var y1 = order1.posY
        var y2 = order2.posY
        var g = order1;
        var h = order2;
        var a = this.animalGroup[x1][y1].posX;
        var b = this.animalGroup[x1][y1].posY;
        var c = this.animalGroup[x2][y2].posX;
        var d = this.animalGroup[x2][y2].posY;
        this.animalGroup[x1][y1] = h;
        this.animalGroup[x2][y2] = g;
        this.animalGroup[x1][y1].posX = a;
        this.animalGroup[x1][y1].posY = b;
        this.animalGroup[x2][y2].posX = c;
        this.animalGroup[x2][y2].posY = d;
    },
    //交换回来
    restore: function () {
        console.log('换回来')
        var start = this.start;
        if (Math.abs(this.vec.x) > Math.abs(this.vec.y)) {
            if (this.vec.x < 0) {
                this.moveRight(cc.v2(start.x - 1, start.y));
            } else {
                this.moveLeft(cc.v2(start.x + 1, start.y));
            }
        } else {
            if (this.vec.y < 0) {
                this.moveUp(cc.v2(start.x, start.y - 1));
            } else {
                this.moveDown(cc.v2(start.x, start.y + 1));
            }
        }
    },

    /**************************************************************************************** */
    //点击显示边框，播放动画
    // isClick: function (start, end,is) {
    //     //是否为同一个格子（点击单个格子）
    //     if (start.x == end.x && start.y == end.y) {
    //         //如果已经有选中的格子
    //         if (this.isAnimalClick) {
    //             var i = this.animalClick[0];
    //             var j = this.animalClick[1];
    //             //停止选中状态
    //             this.isHaveFrame(i, j, false);
    //         }
    //         //显示选中状态
    //         this.isHaveFrame(start.x, start.y, true);

    //         this.isAnimalClick = true;
    //         this.animalClick[0] = start.x;
    //         this.animalClick[1] = start.y;
    //     } else {
    //         return
    //     }
    //     if(is){
    //         console.log('111111111111111')
    //     }
    // },
    isClick: function (start, end, is) {
        //是否为同一个格子（点击单个格子）
        if (start.x == end.x && start.y == end.y) {
            //如果已经有选中的格子
            if (this.isAnimalClick) {
                var i = this.animalClick[0];
                var j = this.animalClick[1];
                //停止选中状态
                this.isHaveFrame(i, j, false);
            }
            //显示选中状态
            this.isHaveFrame(start.x, start.y, true);

            this.isAnimalClick = true;
            this.animalClick[0] = start.x;
            this.animalClick[1] = start.y;
        }
        // else {
        //     return
        // }
        if (is) {
            var i = this.animalClick[0];
            var j = this.animalClick[1];
            this.isHaveFrame(i, j, false);
        }
    },
    isHaveFrame: function (i, j, able) {

        this.animalGroup[i][j].getChildByName('click').active = able;
        if (able) {
            this.animalGroup[i][j].getComponent(cc.Animation).play('click');
        } else {
            this.animalGroup[i][j].getComponent(cc.Animation).stop('click');
            var animal = cc.instantiate(this.birdModel[this.animalGroup[i][j].animalType]);
            this.animalGroup[i][j].getComponent(cc.Sprite).spriteFrame = animal.getComponent(cc.Sprite).spriteFrame;
            // console.log(this.birdModel[this.animalGroup[i][j].animalType].getComponent(cc.Sprite).spriteFrame) 

            //console.log(animal.getComponent(cc.Sprite).spriteFrame)

        }
    },
    //坐标转化为编号
    positionToOrder: function (position) {
        var x = Math.floor(position.x / 70);
        var y = Math.floor((position.y - 300) / 70);
        return cc.v2(x, y)
    },
    /***************************************************************************************** */
    //遍历找3个以上相同的，存入数组removeArr
    //横向为i，纵向为j，左下角为原点
    removeAnimal: function () {
        //需要消除的存入数组removeArr
        this.removeArr = [];


        //cc.log(this.eliminateNum)
        for (var i = 0; i < 10; i++) {
            for (var j = 0; j < 10; j++) {
                this.upRemoveAnimal(i, j);
                this.downRemoveAnimal(i, j);
                this.leftRemoveAnimal(i, j);
                this.rightRemoveAnimal(i, j);
            }
        }

    },
    //抖动，清除animalGroup数组里消掉的动物
    shakeAndCleanGround: function () {
        this.onShake(0);
        if (this.removeArr.length > 0) {
            this.score += this.removeArr.length;
        }
        for (var i = 0; i < this.removeArr.length; i++) {
            var x = this.removeArr[i].posX;
            var y = this.removeArr[i].posY;
            this.animalGroup[x][y] = null;
        }
    },
    //抖动,递归removeArr数组里每个抖动
    onShake: function (a) {
        let self = this;
        var shake = cc.repeatForever(cc.sequence(cc.rotateTo(0.05, 30), cc.rotateTo(0.05, -30)));
        if (a > self.removeArr.length - 1) {
            return
        } else {
            self.removeArr[a].runAction(shake);
            self.onShake(a + 1)
        }
    },
    //向上
    upRemoveAnimal: function (i, j) {
        if ((j + 2) > 9 || this.animalGroup[i][j + 1] == null || this.animalGroup[i][j + 2] == null || this.animalGroup[i][j] == null) return;
        //if (this.animalGroup[i][j + 1].animalType != this.animalGroup[i][j].animalType) return;

        if (this.animalGroup[i][j + 1].animalType == this.animalGroup[i][j].animalType && this.animalGroup[i][j + 2].animalType == this.animalGroup[i][j].animalType) {
            if (!this.animalGroup[i][j + 1].isJoin) {
                this.removeArr.push(this.animalGroup[i][j + 1]);
                this.animalGroup[i][j + 1].isJoin = true;
            }
            if (!this.animalGroup[i][j + 2].isJoin) {
                this.removeArr.push(this.animalGroup[i][j + 2]);
                this.animalGroup[i][j + 2].isJoin = true;
            }
            this.upRemoveAnimal(i, j + 1);
        }
    },
    //向下
    downRemoveAnimal: function (i, j) {
        if ((j - 2) < 0 || this.animalGroup[i][j - 1] == null || this.animalGroup[i][j - 2] == null || this.animalGroup[i][j] == null) return;
        //if (this.animalGroup[i][j - 1].animalType != this.animalGroup[i][j].animalType) return;
        if (this.animalGroup[i][j - 1].animalType == this.animalGroup[i][j].animalType && this.animalGroup[i][j - 2].animalType == this.animalGroup[i][j].animalType) {
            if (!this.animalGroup[i][j - 1].isJoin) {
                this.removeArr.push(this.animalGroup[i][j - 1]);
                this.animalGroup[i][j - 1].isJoin = true;
            }
            if (!this.animalGroup[i][j - 2].isJoin) {
                this.removeArr.push(this.animalGroup[i][j - 2]);
                this.animalGroup[i][j - 2].isJoin = true;
            }
            this.downRemoveAnimal(i, j - 1);
        }
    },
    //向左
    leftRemoveAnimal: function (i, j) {
        if ((i - 2) < 0 || this.animalGroup[i - 1][j] == null || this.animalGroup[i - 2][j] == null || this.animalGroup[i][j] == null) return;
        //if (this.animalGroup[i - 1][j].animalType != this.animalGroup[i][j].animalType) return;
        if (this.animalGroup[i - 1][j].animalType == this.animalGroup[i][j].animalType && this.animalGroup[i - 2][j].animalType == this.animalGroup[i][j].animalType) {
            if (!this.animalGroup[i - 1][j].isJoin) {
                this.removeArr.push(this.animalGroup[i - 1][j]);
                this.animalGroup[i - 1][j].isJoin = true;
            }
            if (!this.animalGroup[i - 2][j].isJoin) {
                this.removeArr.push(this.animalGroup[i - 2][j]);
                this.animalGroup[i - 2][j].isJoin = true;
            }
            this.leftRemoveAnimal(i - 1, j);
        }
    },
    //向右
    rightRemoveAnimal: function (i, j) {
        if ((i + 2) > 9 || this.animalGroup[i + 1][j] == null || this.animalGroup[i + 2][j] == null || this.animalGroup[i][j] == null) return;
        //if (this.animalGroup[i + 1][j].animalType != this.animalGroup[i][j].animalType) return;
        if (this.animalGroup[i + 1][j].animalType == this.animalGroup[i][j].animalType && this.animalGroup[i + 2][j].animalType == this.animalGroup[i][j].animalType) {
            if (!this.animalGroup[i + 1][j].isJoin) {
                this.removeArr.push(this.animalGroup[i + 1][j]);
                this.animalGroup[i + 1][j].isJoin = true;
            }
            if (!this.animalGroup[i + 2][j].isJoin) {
                this.removeArr.push(this.animalGroup[i + 2][j]);
                this.animalGroup[i + 2][j].isJoin = true;
            }
            this.rightRemoveAnimal(i + 1, j);
        }
    },
    /******************************************************************************************** */
    //下落
    fall: function () {
        for (var i = 0; i < 10; i++) {
            for (var j = 0; j < 10; j++) {
                this.columnFall(i, j);
            }
        }
        this.fill()
    },
    columnFall: function (i, j) {
        if (j - 1 < 0 || j > 9) return
        if (this.animalGroup[i][j - 1] == null && this.animalGroup[i][j] !== null) {
            this.moveFall(this.animalGroup[i][j]);
            this.animalGroup[i][j].posY -= 1;
            this.animalGroup[i][j - 1] = this.animalGroup[i][j];
            this.animalGroup[i][j] = null;
        }
        this.columnFall(i, j - 1);
    },
    moveFall: function (target) {
        var move = cc.moveBy(0.5, cc.v2(0, -70));
        target.runAction(move);
    },

    //补齐空缺
    fill: function () {
        for (var i = 0; i < this.animalGroup.length; i++) {
            //获取每列剩余动物数量
            var a = this.getLength(this.animalGroup[i])
            //初始化缺的动物并移动到空缺处
            for (var j = a; j < 10; j++) {
                this.initOneAnimal(i, j, cc.v2(70 * i + 35, 735))
                var end = cc.moveTo(0.5, 70 * i + 35, 70 * j + 35)
                this.animalGroup[i][j].runAction(end)
            }
        }
    },
    //获取剩余动物数量
    getLength: function (arr) {
        var sum = 0;
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] !== null)
                sum++;
        }
        return sum
    },
    /******************************************************************************************* */
    //点击清理
    clean: function () {
        this.playEliminate();
        for (var i = 0; i < this.removeArr.length; i++) {
            this.removeArr[i].removeFromParent();
        }
    }
});