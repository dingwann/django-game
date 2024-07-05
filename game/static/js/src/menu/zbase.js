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
                        设置
                    </div>
                </div>
            </div>
        `);
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
            console.log("click settings");
        })
    };



};