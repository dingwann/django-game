class WcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`
            <div class="wc-game-playground">
                Game...
            </div>
        `);

        this.root.$wc_game.append(this.$playground);

        this.hide();
        this.start();
    }

    start() {

    };

    show() {  // 打开playground界面
        this.$playground.show();
    };

    hide() {  // 关闭playground界面
        this.$playground.hide();
    };
};