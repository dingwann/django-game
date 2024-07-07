class WcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`
            <div class="wc-game-playground">
            </div>
        `);

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

        // this.hide();
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
    };

    hide() {  // 关闭playground界面
        this.$playground.hide();
    };
};