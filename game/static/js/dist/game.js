class WcGameMenu {
    constructor(root) {
        this.root = root;
        this.$menu = $(`
            <div class="wc-game-menu">
                <div class="wc-game-menu-field">
                    <div class="wc-game-menu-field-item wc-game-menu-field-item-single">
                        单人模式
                    </div>
                    <br/>
                    <div class="wc-game-menu-field-item wc-game-menu-field-item-multi">
                        多人模式
                    </div>
                    <br/>
                    <div class="wc-game-menu-field-item wc-game-menu-field-item-settings">
                        退出
                    </div>
                </div>
            </div>
        `);
        this.$menu.hide();
        this.root.$wc_game.append(this.$menu);
        this.$single = this.$menu.find(".wc-game-menu-field-item-single");
        this.$multi = this.$menu.find(".wc-game-menu-field-item-multi");
        this.$settings = this.$menu.find(".wc-game-menu-field-item-settings");

        this.start();
    };

    start() {
        this.add_listening_events();
    };

    show() {
        this.$menu.show();
    };

    hide() {
        this.$menu.hide();
    };

    add_listening_events() {
        let outer = this;
        this.$single.click(function () {
            outer.hide();
            outer.root.playground.show("single mode");
        })
        this.$multi.click(function () {
            outer.hide();
            outer.root.playground.show("multi mode");
        })
        this.$settings.click(function () {
            outer.root.settings.logout_on_remote();
        })
    };



};// 全局数组存放对象，拿到后每秒调用60次更新 --> 60帧
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
requestAnimationFrame(WC_GAME_ANIMATION);class GameMap extends WcGameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);
    };

    start() {

    };

    resize() {
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.ctx.fillStyle = "rgba(0, 0, 0, 1)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    update() {
        this.render();
    };

    render() {
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
};class NoticeBoard extends WcGameObject {
    constructor(playground) {
        super();

        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.text = "已就绪：0人";
    }

    start() {

    }

    write(text) {
        this.text = text;
    }

    update() {
        this.render();
    }

    render() {
        this.ctx.font = "20px serif";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center";
        this.ctx.fillText(this.text, this.playground.width / 2, 20);
    }

}class Particle extends WcGameObject {
    constructor(playground, x, y, radius, vx, vy, color, speed, move_length) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.friction = 0.9;
        this.eps = 0.01;
        this.move_length = move_length;
    }

    start() {

    };

    update() {
        if (this.move_length < this.eps || this.speed < this.eps) {
            this.destroy();
            return false;
        }

        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved
        this.y += this.vy * moved
        this.speed *= this.friction;
        this.move_length -= moved;
        this.render();
    };

    render() {
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    };
}class Player extends WcGameObject {
    constructor(playground, X, Y, radius, color, speed, character, username, photo) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = X;
        this.y = Y;
        this.move_length = 0;
        this.vx = 0;
        this.vy = 0;
        this.damage_x = 0;
        this.damage_y = 0;
        this.damage_speed = 0;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.character = character;
        this.username = username;
        this.photo = photo;
        this.eps = 0.01;
        this.cur_skill = null;
        this.friction = 0.9;
        this.spent_time = 0;
        this.fireballs = [];

        if (this.character !== "robot") {
            this.img = new Image();
            this.img.src = this.photo;

        }

        if (this.character === "me") {
            this.fireball_coldtime = 3;  // s
            this.fireball_img = new Image();
            this.fireball_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_9340c86053-fireball.png";

            this.blink_coldtime = 5;  // s
            this.blink_img = new Image();
            this.blink_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_daccabdc53-blink.png";

        }
    };

    start() {
        this.playground.player_count++;
        this.playground.notice_board.write("已就绪：" + this.playground.player_count + "人");

        if (this.playground.player_count >= 3) {
            this.playground.state = "fighting";
            this.playground.notice_board.write("Fighting");
        }

        if (this.character === "me") {
            this.add_listening_events();
        } else if (this.character === "robot") {
            let tx = Math.random() * this.playground.width / this.playground.scale;
            let ty = Math.random() * this.playground.height / this.playground.scale;
            this.move_to(tx, ty);
        }
    };

    add_listening_events() {
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu", function () {
            return false;
        });
        this.playground.game_map.$canvas.mousedown(function (e) {
            if (outer.playground.state !== "fighting")
                return false;


            const rect = outer.ctx.canvas.getBoundingClientRect();
            if (e.which === 3) {
                let tx = (e.clientX - rect.left) / outer.playground.scale;
                let ty = (e.clientY - rect.top) / outer.playground.scale;
                outer.move_to(tx, ty);

                if (outer.playground.mode === "multi mode") {
                    outer.playground.mps.send_move_to(tx, ty);
                }
            } else if (e.which === 1) {

                let tx = (e.clientX - rect.left) / outer.playground.scale;
                let ty = (e.clientY - rect.top) / outer.playground.scale;
                if (outer.cur_skill === "fireball") {
                    if (outer.fireball_coldtime > outer.eps)
                        return false;
                    let fireball = outer.shoot_fireball(tx, ty);

                    if (outer.playground.mode === "multi mode") {
                        outer.playground.mps.send_shoot_fireball(tx, ty, fireball.uuid);
                    }
                } else if (outer.cur_skill === "blink") {
                    if (outer.blink_coldtime > outer.eps)
                        return false;
                    outer.blink(tx, ty);
                    if (outer.playground.mode === "multi mode") {
                        outer.playground.mps.send_blink(tx, ty);
                    }
                }

                outer.cur_skill = null;
            }
        });

        $(window).keydown(function (e) {
            if (outer.playground.state !== "fighting")
                return true;

            if (e.which === 81) { // Q
                if (outer.fireball_coldtime > outer.eps)
                    return true;
                outer.cur_skill = "fireball";
                return false;
            } else if (e.which === 70) { // F
                if (outer.blink_coldtime > outer.eps)
                    return true;
                outer.cur_skill = "blink";
                return false;
            }
        })
    };

    shoot_fireball(tx, ty) {
        let x = this.x, y = this.y;
        let radius = 0.01;
        let angle = Math.atan2(ty - y, tx - x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let color = "orange";
        let speed = 0.5;
        let move_length = 1;
        let fireball = new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, 0.01);
        this.fireballs.push(fireball);

        this.fireball_coldtime = 3;

        return fireball;
    }

    blink(tx, ty) {
        let d = this.get_dist(this.x, this.y, tx, ty);
        d = Math.min(d, 0.6);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.x += d * Math.cos(angle);
        this.y += d * Math.sin(angle);

        this.blink_coldtime = 5;

        this.move_length = 0;  // 闪现后停下
    }

    destroy_fireball(uuid) {
        for (let i = 0; i < this.fireballs.length; i++) {
            let fireball = this.fireballs[i];
            if (fireball.uuid === uuid) {
                fireball.destroy();
                break;
            }
        }
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    move_to(tx, ty) {
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }

    is_attacked(angle, damage) {
        for (let i = 0; i < 20 + Math.random() * 10; i++) {
            let x = this.x, y = this.y;
            let radius = this.radius * Math.random() * 0.1;
            let angle = Math.random() * 2 * Math.PI;
            let vx = Math.cos(angle), vy = Math.sin(angle);
            let color = this.color;
            let speed = this.speed * 10;
            let move_length = this.radius * Math.random() * 5;
            new Particle(this.playground, x, y, radius, vx, vy, color, speed, move_length);
        }
        this.radius -= damage;
        if (this.radius < this.eps) {
            this.destroy();
            return false;
        }
        let old_speed = this.speed;
        this.speed *= 2;  // 击中后潜能激发，速度增益1.5s
        const timeout = setTimeout(() => {
            this.speed = old_speed * 1.25 // 球小速度原来基础加快1.25倍
            clearTimeout(timeout);
        }, 1500);
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = damage * 100;
    }

    receive_attack(x, y, angle, damage, ball_uuid, attacker) {
        attacker.destroy_fireball(ball_uuid);
        this.x = x;
        this.y = y;
        this.is_attacked(angle, damage);
    }

    update() {
        this.spent_time += this.timedelta / 1000;
        if (this.character === "me" && this.playground.state === "fighting") {
            this.update_coldtime();
        }

        this.update_move();

        this.render();
    };

    update_coldtime() {
        this.fireball_coldtime -= this.timedelta / 1000;
        this.fireball_coldtime = Math.max(this.fireball_coldtime, 0);

        this.blink_coldtime -= this.timedelta / 1000;
        this.blink_coldtime = Math.max(this.blink_coldtime, 0);
    }

    update_move() {  // 更新玩家移动
        if (this.character === "robot" && this.spent_time > 4 && Math.random() < 1 / 300.0) {
            let player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)]; // 随机攻击
            let tx = player.x + this.vx * player.speed * this.timedelta / 1000 * 0.3;
            let ty = player.y + this.vy * player.speed * this.timedelta / 1000 * 0.3;
            this.shoot_fireball(tx, ty);
        }

        if (this.damage_speed > this.eps) {
            this.vx = this.vy = 0;
            this.move_length = 0;
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.friction;
        } else {
            if (this.move_length < this.eps) {
                this.move_length = 0;
                this.vx = this.vy = 0;
                if (this.character === "robot") {
                    let tx = Math.random() * this.playground.width / this.playground.scale;
                    let ty = Math.random() * this.playground.height / this.playground.scale;
                    this.move_to(tx, ty);
                }
            } else {
                let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
            }
        }
    }

    render() {
        let scale = this.playground.scale;
        if (this.character !== "robot") {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, (this.x - this.radius) * scale, (this.y - this.radius) * scale, this.radius * 2 * scale, this.radius * 2 * scale);
            this.ctx.restore();
        } else {
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }

        if (this.character === "me" && this.playground.state === "fighting") {
            this.render_skill_coldtime();
        }

    };

    render_skill_coldtime() {
        let x = 1.5, y = 0.9, r = 0.04;
        let scale = this.playground.scale;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.fireball_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();

        if (this.fireball_coldtime > 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.fireball_coldtime / 3) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.6)";
            this.ctx.fill();
        }


        x = 1.62, y = 0.9, r = 0.04;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.blink_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();

        if (this.blink_coldtime > 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.blink_coldtime / 5) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.6)";
            this.ctx.fill();
        }
    }



    on_destroy() {
        if (this.character === "me")
            this.playground.state = "over";
        for (let i = 0; i < this.playground.players.length; i++) {
            if (this.playground.players[i] == this) {
                this.playground.players.splice(i, 1)
                break;
            }
        }
    }
};class FireBall extends WcGameObject {
    constructor(playground, player, x, y, radius, vx, vy, color, speed, move_length, damage) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.player = player;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.damage = damage;
        this.eps = 0.01;
    };

    start() {

    };

    update() {
        if (this.move_length < this.eps) {
            this.destroy();
            return false;
        }

        this.update_move();

        if (this.player.character !== "enemy") {
            this.update_attack();
        }

        this.render();
    };

    update_move() {
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;
    }

    update_attack() {
        for (let i = 0; i < this.playground.players.length; i++) {
            let player = this.playground.players[i];
            if (this.player !== player && this.is_collision(player)) {
                this.attack(player);
                this.destroy();
                break;
            }
        }
    }

    get_dist(x1, y1, x2, y2) {
        return Math.hypot(x1 - x2, y1 - y2);
    }

    is_collision(player) {
        let distance = this.get_dist(this.x, this.y, player.x, player.y);
        if (distance < this.radius + player.radius) {
            return true;
        }
        return false;
    }

    attack(player) {
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        player.is_attacked(angle, this.damage);

        if (this.playground.mode === "multi mode") {
            this.playground.mps.send_attack(player.uuid, player.x, player.y, angle, this.damage, this.uuid);
        }

        this.destroy();
    }

    render() {
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    on_destroy() {
        let fireballs = this.player.fireballs;
        for (let i = 0; i < fireballs.length; i++) {
            if (fireballs[i] === this) {
                fireballs.splice(i, 1);
                break;
            }
        }
    }
};class MultiPlayerSocket {
    constructor(playground) {
        this.playground = playground;
        this.ws = new WebSocket("ws://dingwan.top:8000/ws/multiplayer/");

        this.start();
    }

    start() {
        this.receive();
    }

    receive() {
        let outer = this;
        this.ws.onmessage = (e) => {
            let data = JSON.parse(e.data);
            let uuid = data.uuid;
            if (uuid === outer.uuid) return false;

            let event = data['event'];
            if (event === 'create_player') {
                outer.receive_create_player(
                    uuid,
                    data.username,
                    data.photo);
            } else if (event === 'move_to') {
                outer.receive_move_to(uuid, data.tx, data.ty);
            } else if (event === 'shoot_fireball') {
                outer.receive_shoot_fireball(uuid, data.tx, data.ty, data.ball_uuid);
            } else if (event === 'attack') {
                outer.receive_attack(uuid, data.attackee_uuid, data.x, data.y, data.angle, data.damage, data.ball_uuid)
            } else if (event === "blink") {
                outer.receive_blink(uuid, data.tx, data.ty)
            }
        }
    }

    send_create_player(username, photo) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': 'create_player',
            'uuid': outer.uuid,
            'username': username,
            'photo': photo
        }));
    }

    receive_create_player(uuid, username, photo) {
        let player = new Player(
            this.playground,
            this.playground.width / 2 / this.playground.scale,
            0.5,
            0.05,
            "white",
            0.15,
            "enemy",
            username,
            photo
        );
        player.uuid = uuid;
        this.playground.players.push(player);
    }

    get_player(uuid) {
        for (let player of this.playground.players) {
            if (player.uuid === uuid) {
                return player;
            }
        }
        return null;
    }

    send_move_to(tx, ty) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': 'move_to',
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty
        }));
    }

    receive_move_to(uuid, tx, ty) {
        let player = this.get_player(uuid);

        if (player) {
            player.move_to(tx, ty);
        }
    }

    send_shoot_fireball(tx, ty, ball_uuid) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': 'shoot_fireball',
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
            'ball_uuid': ball_uuid
        }))
    }

    receive_shoot_fireball(uuid, tx, ty, ball_uuid) {
        let player = this.get_player(uuid);
        if (player) {
            let fireball = player.shoot_fireball(tx, ty);
            fireball.uuid = ball_uuid;
        }
    }

    send_attack(attackee_uuid, x, y, angle, damage, ball_uuid) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': 'attack',
            'uuid': outer.uuid,
            'attackee_uuid': attackee_uuid,
            'x': x,
            'y': y,
            'angle': angle,
            'damage': damage,
            'ball_uuid': ball_uuid
        }))
    }

    send_blink(tx, ty) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': 'blink',
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty
        }));
    }

    receive_blink(uuid, tx, ty) {
        let player = this.get_player(uuid);
        if (player) {
            player.blink(tx, ty);
        }
    }

    receive_attack(uuid, attackee_uuid, x, y, angle, damage, ball_uuid) {
        let attacker = this.get_player(uuid);
        let attackee = this.get_player(attackee_uuid);
        if (attacker && attackee) {
            attackee.receive_attack(x, y, angle, damage, ball_uuid, attacker);
        }
    }
};class WcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`
            <div class="wc-game-playground">
            </div>
        `);

        this.hide();
        this.root.$wc_game.append(this.$playground);
        this.start();
    }

    get_random_color() {
        let colors = ["blue", "red", "pink", "yellow", "green", "orange", "gray", "purple"];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    start() {
        let outer = this;
        $(window).resize(() => {
            outer.resize();
        });
    };

    // 调整窗口长宽比
    resize() {
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        let unit = Math.min(this.width / 16, this.height / 9);
        this.width = unit * 16;
        this.height = unit * 9;
        this.scale = this.height;

        if (this.game_map) this.game_map.resize();
    }

    show(mode) {  // 打开playground界面
        let outer = this;
        this.$playground.show();
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);
        this.mode = mode;
        this.state = "watting";   // "watting --> fighting --> over"
        this.notice_board = new NoticeBoard(this);
        this.player_count = 0;

        this.resize();
        this.players = [];
        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, "white", 0.15, "me", this.root.settings.username, this.root.settings.photo));

        if (mode === "single mode") {
            // 人机
            for (let i = 0; i < 5; i++) {
                this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, this.get_random_color(), 0.15, "robot"));
            }
        } else if (mode === "multi mode") {
            // 多人
            this.mps = new MultiPlayerSocket(this);
            this.mps.uuid = this.players[0].uuid;

            this.mps.ws.onopen = () => {
                outer.mps.send_create_player(outer.root.settings.username, outer.root.settings.photo);
            }
        }

    };

    hide() {  // 关闭playground界面
        this.$playground.hide();
    };
};class Settings {
    constructor(root) {
        this.root = root;
        this.platform = 'Web';
        if (this.root.OtherApp) this.platform = 'OtherApp';
        this.username = '';
        this.photo = '';

        this.$settings = $(`
            <div class="wc-game-settings">
                <div class="wc-game-settings-login">
                    <div class="wc-game-settings-title">
                        登录
                    </div>
                    <div class="wc-game-settings-username">
                        <div class="wc-game-settings-item">
                            <input type="text" placeholder="用户名">
                        </div>
                    </div>
                    <div class="wc-game-settings-password">
                        <div class="wc-game-settings-item">
                            <input type="password" placeholder="密码">
                        </div>
                    </div>
                    <div class="wc-game-settings-submit">
                        <div class="wc-game-settings-item">
                            <button>
                                登录
                            </button>
                        </div>
                    </div>
                    <div class="wc-game-settings-error-message">

                    </div>
                    <div class="wc-game-settings-option register">
                        没有账号？去注册！
                    </div>
                    <br/>
                    <div class="wc-game-settings-other">
                        <img width="30" src="http://dingwan.top:8000/static/image/settings/acwinglogo.png" />
                        <br/>
                        <span>Acwing一键登录</span>
                    </div>
                </div>

                <div class="wc-game-settings-register">
                    <div class="wc-game-settings-title">
                        注册
                    </div>
                    <div class="wc-game-settings-username">
                        <div class="wc-game-settings-item">
                            <input type="text" placeholder="用户名">
                        </div>
                    </div>
                    <div class="wc-game-settings-password password_first">
                        <div class="wc-game-settings-item">
                            <input type="password" placeholder="密码">
                        </div>
                    </div>
                     <div class="wc-game-settings-password password_second">
                        <div class="wc-game-settings-item">
                            <input type="password" placeholder="重复密码">
                        </div>
                    </div>
                    <div class="wc-game-settings-submit">
                        <div class="wc-game-settings-item">
                            <button>
                                注册
                            </button>
                        </div>
                    </div>
                    <div class="wc-game-settings-error-message">

                    </div>
                    <div class="wc-game-settings-option login">
                        已有账号？去登录！
                    </div>
                    <br/>
                    <div class="wc-game-settings-other">
                        <img width="30" src="http://dingwan.top:8000/static/image/settings/acwinglogo.png" />
                        <br/>
                        <span>Acwing一键登录</span>
                    </div>
                </div>
            </div>
            `);

        this.$login = this.$settings.find(".wc-game-settings-login");
        this.$login.hide()
        this.$register = this.$settings.find(".wc-game-settings-register");
        this.$register.hide();

        this.$login_username = this.$login.find(".wc-game-settings-username input");
        this.$login_password = this.$login.find(".wc-game-settings-password input");
        this.$login_submit = this.$login.find(".wc-game-settings-submit button");
        this.$login_error_message = this.$login.find(".wc-game-settings-error-message");


        this.$register_username = this.$register.find(".wc-game-settings-username input");
        this.$register_password = this.$register.find(".password_first input");
        this.$register_password2 = this.$register.find(".password_second input");
        this.$register_submit = this.$register.find(".wc-game-settings-submit button");
        this.$register_error_message = this.$register.find(".wc-game-settings-error-message");

        this.$otherapplogin = this.$settings.find(".wc-game-settings-other img");

        this.$settings.find(".register").on("click", () => {
            this.register();
        })
        this.$settings.find(".login").on("click", () => {
            this.login();
        })

        this.root.$wc_game.append(this.$settings);

        this.start();
        this.add_listening_events();
    }

    start() {
        this.getinfo();
    }

    add_listening_events() {
        let outer = this;
        this.add_listening_events_login();
        this.add_listening_events_register();

        this.$otherapplogin.on("click", () => {
            outer.otherapplogin();
        })
    }

    otherapplogin() {
        $.ajax({
            url: "http://dingwan.top:8000/settings/otherapp/apply_code/",
            type: "GET",
            success: function (resp) {
                if (resp.result === "Success") {
                    window.location.replace(resp.apply_code_url);
                }
            }
        })
    }

    add_listening_events_login() {
        let outer = this;
        this.$login_submit.on("click", () => {
            this.login_on_remote();
        })
    }

    add_listening_events_register() {
        let outer = this;
        this.$register_submit.on("click", () => {
            this.register_on_remote();
        })
    }

    login_on_remote() {  // 登录验证
        let outer = this;
        let username = this.$login_username.val();
        let password = this.$login_password.val();
        this.$login_error_message.empty();

        $.ajax({
            url: "http://dingwan.top:8000/settings/login/",
            type: "GET",
            data: {
                username: username,
                password: password,
            },
            success: function (resp) {
                if (resp.result === "Success") {
                    location.reload();
                } else {
                    outer.$login_error_message.html(resp.result);
                }
            }
        })
    }

    register_on_remote() {  // 注册请求
        let outer = this;
        let username = this.$register_username.val();
        let password = this.$register_password.val();
        let password2 = this.$register_password2.val();
        this.$register_error_message.empty();

        if (password !== password2) {
            this.$register_error_message.html("两次输入的密码不一致");
            return false;
        }

        $.ajax({
            url: "http://dingwan.top:8000/settings/register/",
            type: "GET",
            data: {
                username: username,
                password: password,
                password2: password2,
            },
            success: function (resp) {
                if (resp.result === "Success") {
                    // outer.login();
                    location.reload();
                } else {
                    outer.$register_error_message.html(resp.result);
                }
            }
        })
    }

    logout_on_remote() {  // 登出
        let outer = this;
        if (this.platform === 'OtherApp') return false;
        $.ajax({
            url: "http://dingwan.top:8000/settings/logout/",
            type: "GET",
            success: function (resp) {
                if (resp.result === "Success") {
                    outer.show();
                    outer.root.menu.hide();
                    location.reload();
                }
            }
        })
    }

    register() {  // 打开注册界面
        this.$login.hide();
        this.$register.show();
    }

    login() {  // 打开登录界面
        this.$register.hide();
        this.$login.show();
    }

    getinfo() {
        let outer = this;
        $.ajax({
            url: "http://dingwan.top:8000/settings/getinfo/",
            type: "GET",
            data: {
                platform: outer.platform,
            },
            success: function (resp) {
                if (resp.result === "Success") {
                    outer.hide();
                    outer.root.menu.show();
                    outer.username = resp.username;
                    outer.photo = resp.photo;
                } else {
                    outer.login();
                }
            }
        })
    }

    hide() {
        this.$settings.hide();
    }

    show() {
        this.$settings.show();
    }
}export class WcGame {
    constructor(id, OtherApp) {
        this.id = id;
        this.$wc_game = $(`#${id}`);
        this.OtherApp = OtherApp;
        this.settings = new Settings(this);
        this.menu = new WcGameMenu(this);
        this.playground = new WcGamePlayground(this);
        this.start();
    };

    start() {

    };
}