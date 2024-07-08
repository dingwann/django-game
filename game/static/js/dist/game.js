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
            outer.root.playground.show();
        })
        this.$multi.click(function () {
            console.log("click multi");
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

    update() {
        this.render();
    };

    render() {
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
};class Particle extends WcGameObject {
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
        this.eps = 1;
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
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    };
}class Player extends WcGameObject {
    constructor(playground, X, Y, radius, color, speed, is_me) {
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
        this.is_me = is_me;
        this.eps = 0.1;
        this.cur_skill = null;
        this.friction = 0.9;
        this.spent_time = 0;

        if (this.is_me) {
            this.img = new Image();
            this.img.src = this.playground.root.settings.photo;
        }
    };

    start() {
        if (this.is_me) {
            this.add_listening_events();
        } else {
            let tx = Math.random() * this.playground.width;
            let ty = Math.random() * this.playground.height;
            this.move_to(tx, ty);
        }
    };

    add_listening_events() {
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu", function () {
            return false;
        });
        this.playground.game_map.$canvas.mousedown(function (e) {
            const rect = outer.ctx.canvas.getBoundingClientRect();
            if (e.which === 3) {
                outer.move_to(e.clientX - rect.left, e.clientY - rect.top);
            } else if (e.which === 1) {
                if (outer.cur_skill === "fireball") {
                    outer.shoot_fireball(e.clientX - rect.left, e.clientY - rect.top);
                }

                outer.cur_skill = null;
            }
        });

        $(window).keydown(function (e) {
            if (e.which === 81) { // Q
                outer.cur_skill = "fireball";
                return false;
            }
        })
    };

    shoot_fireball(tx, ty) {
        let x = this.x, y = this.y;
        let radius = this.playground.height * 0.01;
        let angle = Math.atan2(ty - y, tx - x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let color = "orange";
        let speed = this.playground.height * 0.5;
        let move_length = this.playground.height * 1;
        new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, this.playground.height * 0.01);
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
        if (this.radius < 10) {
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

    update() {
        this.spent_time += this.timedelta / 1000;
        if (!this.is_me && this.spent_time > 4 && Math.random() < 1 / 300.0) {
            let player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)]; // 随机攻击
            let tx = player.x + this.vx * player.speed * this.timedelta / 1000 * 0.3;
            let ty = player.y + this.vy * player.speed * this.timedelta / 1000 * 0.3;
            this.shoot_fireball(tx, ty);
        }

        if (this.damage_speed > 10) {
            this.vx = this.vy = 0;
            this.move_length = 0;
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.friction;
        } else {
            if (this.move_length < this.eps) {
                this.move_length = 0;
                this.vx = this.vy = 0;
                if (!this.is_me) {
                    let tx = Math.random() * this.playground.width;
                    let ty = Math.random() * this.playground.height;
                    this.move_to(tx, ty);
                }
            } else {
                let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
            }
        }
        this.render();
    };

    render() {
        if (this.is_me) {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
            this.ctx.restore();
        } else {
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }
    };

    on_destroy() {
        for (let i = 0; i < this.playground.players.length; i++) {
            if (this.playground.players[i] == this) {
                this.playground.players.splice(i, 1)
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
        this.eps = 0.1;
    };

    start() {

    };

    update() {
        if (this.move_length < this.eps) {
            this.destroy();
            return false;
        }

        const moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;

        for (let i = 0; i < this.playground.players.length; i++) {
            let player = this.playground.players[i];
            if (this.player !== player && this.is_collision(player)) {
                this.attack(player);
                this.destroy();
                return false;
            }
        }

        this.render();
    };

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

        this.destroy();
    }

    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
};class WcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`
            <div class="wc-game-playground">
            </div>
        `);

        this.hide();
        this.start();
    }

    get_random_color() {
        let colors = ["blue", "red", "pink", "yellow", "green", "orange", "gray", "purple"];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    start() {

    };

    show() {  // 打开playground界面
        this.$playground.show();
        this.root.$wc_game.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);
        this.players = [];
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "white", this.height * 0.15, true));

        // 人机
        for (let i = 0; i < 5; i++) {
            this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, this.get_random_color(), this.height * 0.15, false));
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
        this.add_listening_events_login();
        this.add_listening_events_register();
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