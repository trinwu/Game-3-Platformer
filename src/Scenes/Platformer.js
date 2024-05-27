class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 400;
        this.DRAG = 500;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -600;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 2.0;

        this.isWalking = false;
    }

    create() {
        this.jump = this.sound.add('jump', { 
            volume: 1, 
            //loop: true 
        });
        this.jump.rate = 1.5; // 1.5 times the normal speed

        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("platformer-level-1", 18, 18, 180, 20);

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("kenny-tilemap-packed", "tilemap_tiles");

        // Create a layer
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);
        this.spikeLayer = this.map.createLayer("Spikes", this.tileset, 0, 0);

        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });

        this.spikeLayer.setCollisionByProperty({
            collides: true
        }); 

        
        // TODO: Add createFromObjects here
        // Find coins in the "Objects" layer in Phaser
        // Look for them by finding objects with the name "coin"
        // Assign the coin texture from the tilemap_sheet sprite sheet
        // Phaser docs:
        // https://newdocs.phaser.io/docs/3.80.0/focus/Phaser.Tilemaps.Tilemap-createFromObjects

        this.coins = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 14
        });
        

        // TODO: Add turn into Arcade Physics here
        // Since createFromObjects returns an array of regular Sprites, we need to convert 
        // them into Arcade Physics sprites (STATIC_BODY, so they don't move) 
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);

        // Create a Phaser group out of the array this.coins
        // This will be used for collision detection below.
        this.coinGroup = this.add.group(this.coins);

        // set up player avatar
        my.sprite.player = this.physics.add.sprite(30, 5, "platformer_characters", "tile_0000.png");
        //my.sprite.player.setCollideWorldBounds(true);

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);
        

        // TODO: Add coin collision handler
        // Handle collision detection with coins
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            obj2.destroy(); // remove coin on overlap
            game.settings.score += 1;
            console.log(game.settings.score);
        });

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        this.rKey = this.input.keyboard.addKey('R');

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

        // movement vfx

        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['window_03.png', 'circle_05.png'],
            // TODO: Try: add random: true
            scale: {start: 0.03, end: 0.1},
            // TODO: Try: maxAliveParticles: 8,
            lifespan: 350,
            // TODO: Try: gravityY: -400,
            alpha: {start: 1, end: 0.1}, 
        });

        my.vfx.walking.stop();

        my.vfx.jumping = this.add.particles(0, 0, "kenny-particles", {
            frame: ['trace_01.png'],
            // TODO: Try: add random: true
            scale: {start: 0.03, end: 0.1},
            // TODO: Try: maxAliveParticles: 8,
            lifespan: 350,
            // TODO: Try: gravityY: -400,
            alpha: {start: 1, end: 0.1}, 
        });

        my.vfx.jumping.stop();
        

        // TODO: add camera code here
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);
        

    }

    update() {
        if(cursors.left.isDown) {
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
            // TODO: add particle following code here
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground

            if (my.sprite.player.body.blocked.down) {

                my.vfx.walking.start();

            }

            
            this.isWalking = true;


        } else if(cursors.right.isDown) {
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);
            // TODO: add particle following code here
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground

            if (my.sprite.player.body.blocked.down) {

                my.vfx.walking.start();

            }

            this.isWalking = true;

        } else {
            // Set acceleration to 0 and have DRAG take over
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
            // TODO: have the vfx stop playing
            my.vfx.walking.stop();
        
            this.isWalking = false;
        }

        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if(!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
        } else {
            // Stop particle animation if the player is on the ground
            my.vfx.jumping.stop();
        }
        
        
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            this.jump.play();

            my.vfx.jumping.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

            my.vfx.jumping.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            
            my.vfx.jumping.start();

        }

        if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }

        if(game.settings.score == 35){
            this.scene.start("GameOverScene");
        }
    }
}