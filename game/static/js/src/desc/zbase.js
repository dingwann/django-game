class WcGameDesc {
    constructor(root) {
        this.root = root;
        this.$desc = $(`
            <div class="wc-game-desc">
                <div class="wc-game-desc-title">
                    <h1>游戏规则</h1>
                </div>
                <div class="wc-game-desc-content">
                    <pre>
                        鼠标右键移动

                        按Q之后按鼠标左键释放火球

                        按F之后按鼠标左键闪现一段距离

                        多人模式：
                        按照积分匹配，随时间推移匹配积分差距逐渐扩大至匹配到对手为止

                        三人匹配为一局

                        回车打开聊天，ESC退出聊天
                    </pre>
                </div>
                <div class="desc-home">
                    <span>
                        返回主页
                    </span>
                </div>
            </div>
        `);

        this.root.$wc_game.append(this.$desc);

        this.start();
    }

    start() {
        this.hide();
        this.addlistening_event();
    }

    addlistening_event() {
        this.$desc.find(".desc-home").on("click", () => {
            this.hide();
            this.root.menu.show();
        });
    }

    show() {
        this.$desc.show();
    }

    hide() {
        this.$desc.hide();
    }
}