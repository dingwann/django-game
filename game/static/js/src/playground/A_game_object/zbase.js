// 全局数组存放对象，拿到后每秒调用60次更新 --> 60帧
let WC_GAME_OBJECTS = [];


class WcGameObject {
    constructor() {
        WC_GAME_OBJECTS.push(this);
        this.has_called_start = false;  // 标记是否调用过start()
        this.timedelta = 0; // 记录每两帧的时间间隔 ms

        this.uuid = this.crate_uuid();
    }

    crate_uuid() {
        let res = "";
        for (let i = 0; i < 8; i++) {
            let x = parseInt(Math.floor(Math.random() * 10));
            res += x;
        }
        return res;
    }

    start() {
        // 每个对象初始化时调用
    }

    update() {
        // 每个对象每帧调用
    }

    on_destroy() {
        // 每个对象销毁前调用一次

    }

    destroy() {
        this.on_destroy();
        // 每个对象销毁时调用
        for (let i = 0; i < WC_GAME_OBJECTS.length; i++) {
            if (WC_GAME_OBJECTS[i] === this) {
                WC_GAME_OBJECTS.splice(i, 1);
                break;
            }
        }
    }
};


// 上一帧的时间间隔
let last_timestamp;
let WC_GAME_ANIMATION = function (timestamp) {
    for (let i = 0; i < WC_GAME_OBJECTS.length; i++) {
        let obj = WC_GAME_OBJECTS[i];
        if (!obj.has_called_start) {
            obj.start();
            obj.has_called_start = true;
        } else {
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }
    last_timestamp = timestamp;
    requestAnimationFrame(WC_GAME_ANIMATION);
}

// 浏览器API, 一秒钟会调用60次
requestAnimationFrame(WC_GAME_ANIMATION);