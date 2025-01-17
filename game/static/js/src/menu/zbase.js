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
                    <div class="wc-game-menu-field-item wc-game-menu-field-item-desc">
                        游戏说明
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
        this.$desc = this.$menu.find(".wc-game-menu-field-item-desc");

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
        this.$desc.click(function () {
            outer.hide();
            outer.root.desc.show();
        })
        this.$settings.click(function () {
            outer.root.settings.logout_on_remote();
        })
    };



};