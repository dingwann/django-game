class Settings {
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
}