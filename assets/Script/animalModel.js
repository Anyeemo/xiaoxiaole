//export const bird = ['bear','cat'];

export const position = [];
//横向为i，纵向为j，左下角为原点
for(var i = 0;i < 10; i ++){
    position[i] = [];
    for(var j = 0;j < 10; j ++){
        var x = i * 70 + 35;
        var y = j * 70 + 35;
        position[i][j] = cc.v2(x,y)
    }
};

//export const animalName = ['bear','cat','chicken','fox','frog','horse','bird']

//export var animalGroup = [];