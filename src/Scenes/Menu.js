class Menu extends Phaser.Scene {
    constructor() {
        super("menuScene");
    }
    preload() {

    }

    create() {
        let menuConfig =
        {
            fontFamily: 'Verdana',
            fontSize: '32px',
            backgroundColor: '#000000',
            color: '#ffffff',
            align: 'center',
            padding:
            {
                top:10,
                bottom:10,
            },
            fixedWidth: 0
        }

        this.add.text(game.config.width/2, game.config.height/2 - 100, 'DONUT HUNTER', menuConfig).setOrigin(0.5);
        this.add.text(game.config.width/2, game.config.height/2, 'Collect all 35 donuts to win. (Press Space to Start)', menuConfig).setOrigin(0.5);


        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.space)) {
            game.settings = 
            {
                score: 0
            }
            this.scene.start("loadScene");
        }
    }
}