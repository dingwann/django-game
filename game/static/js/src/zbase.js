export class WcGame {
    constructor(id, OtherApp) {
        this.id = id;
        this.$wc_game = $(`#${id}`);
        this.OtherApp = OtherApp;
        this.settings = new Settings(this);
        this.menu = new WcGameMenu(this);
        this.playground = new WcGamePlayground(this);
        this.desc = new WcGameDesc(this);
        this.start();
    };

    start() {

    };
}