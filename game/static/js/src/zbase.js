export class WcGame {
    constructor(id) {
        this.id = id;
        this.$wc_game = $(`#${id}`);
        // this.menu = new WcGameMenu(this);
        this.playground = new WcGamePlayground(this);

        this.start();
    };

    start() {

    };
}