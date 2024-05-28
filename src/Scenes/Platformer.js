class Platformer extends Phaser.Scene {
    
    constructor() {
        super("platformerScene");
        this.restart = false;   
    }

    init() {
        // variables and settings
        this.ACCELERATION = 400;
        this.DRAG = 500;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -600;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 2.0;
    }

    create() {
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.

        this.score = 0;
        this.isPaused = false;
        this.boomSound = this.sound.add('boom', {volume: 1});
        this.shrink = this.sound.add('shrink', {volume: 1});
        this.jump = this.sound.add('jump', {volume: 0.5});
        this.pickup = this.sound.add('pickup', {volume: 1});
        
        this.bg = this.add.image(700, 150, "background")
        .setScale(1.7, 1)
        .setOrigin(0, 0)
        .setScrollFactor(0.1)
        this.winScreen = this.add.tileSprite(0, 0, 15000, 2000, 'winScreen');
		this.winScreen.alpha = 0.7;
		this.winScreen.visible = false;

        
        this.map = this.add.tilemap("platformer-level-1", 18, 18, 45, 25);
        
        //this.plugins.get('AnimatedTiles').init(this.map);
        
        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");

        // Create a layer
        this.bg = this.map.createLayer("Parallax", this.tileset, 0, 50)
            .setScrollFactor(0.5)
            .setTint(0x00000)
        this.bg.scale *= 0.75
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);

        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });

        // Find coins in the "Objects" layer in Phaser
        // Look for them by finding objects with the name "coin"
        // Assign the coin texture from the tilemap_sheet sprite sheet
        // Phaser docs:
        // https://newdocs.phaser.io/docs/3.80.0/focus/Phaser.Tilemaps.Tilemap-createFromObjects

        this.coins = this.map.createFromObjects("Objects", {
            name: "coin", 
            key: "tilemap_sheet"
        });

        

        this.anims.play('coinAnim', this.coins);

        this.jBoost = this.map.createFromObjects("Objects", {
            name: "JumpBoost",
            key: "tilemap_sheet",
            frame: 67
        });

        this.jPad = this.map.createFromObjects("Objects", {
            name: "JumpPad",
            key: "tilemap_sheet",
            frame: 107
        });
        

        // Since createFromObjects returns an array of regular Sprites, we need to convert 
        // them into Arcade Physics sprites (STATIC_BODY, so they don't move) 
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.jPad, Phaser.Physics.Arcade.STATIC_BODY);
        
        this.physics.world.enable(this.jBoost, Phaser.Physics.Arcade.STATIC_BODY);

        // Create a Phaser group out of the array this.coins
        // This will be used for collision detection below.
        this.coinGroup = this.add.group(this.coins);
        this.jumpGroup = this.add.group(this.jPad);
        this.boosterGroup = this.add.group(this.jBoost);

        // set up player avatar
        

        my.vfx.pickup = this.add.particles(0, 0, "kenny-particles", {
            frame: ['star_04.png', 'star_05.png', 'star_06.png'],
            //random: true,
            scale: {start: 0.02, end: 0.06},
            maxAliveParticles: 8,
            lifespan: 500,
            //gravityY: -300,
            //alpha: {start: 1, end: 0.1}
        });

        //my.vfx.pickup.startFollow(this.coins, this.coins.x/2-10, this.coins.y/2-5, false);
        //my.vfx.pickup.start();

        // Handle collision detection with coins

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        this.rKey = this.input.keyboard.addKey('R');

        this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
        this.physics.world.debugGraphic.clear()

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

        // movement vfx

        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['star_01.png', 'star_02.png', 'star_03.png'],
            random: true,
            scale: {start: 0.03, end: 0.04},
            //maxAliveParticles: 8,
            lifespan: 500,
            frequency: 50
            //gravityY: -300,
            //alpha: {start: 1, end: 0.1}
        });

        my.vfx.jumping = this.add.particles(0, 0, "kenny-particles", {
            frame: ['muzzle_01.png', 'muzzle_04.png'],
            random: true,
            scaleX: {start: 0.07, end: 0.1},
            scaleY: 0.07,
            //maxAliveParticles: 8,
            lifespan: 300,
            //frequency: 100,
            //gravityY: -300,
            alpha: {start: 1, end: 0.1}
        });

        my.vfx.walking.stop();
        
        console.log(this.map.heightInPixel);
        
        this.animatedTiles = [];

        //Loop through all tiles in the "Ground-n-Platforms" layer (adjust layer name if needed)
        //for (let y = 0; y < this.groundLayer.height; y++) {
        //    for (let x = 0; x < this.groundLayer.width; x++) {
        //      const tile = this.groundLayer.getTileAt(x, y);
        //      if (tile && tile.properties && tile.properties.animated) {
        //        this.animatedTiles.push({
        //          x: x,
        //          y: y,
        //          frameCounter: 0, // Ensure frameCounter is a number and initialized to 0
        //          animationLength: tile.properties.animationLength,
        //          index: tile.index
        //        });
        //      }
        //    }
        //}
        //for (let tile of this.animatedTiles) {
        //    console.log(tile.index);
        //}

        this.coinText = this.add.text(30, 700, 'Coins Collected', {
			fontSize: 18, 
			//color: '#FFC03D', 
			color: '#000000', 
			align: 'center'
		});

        this.welcomeText = this.add.text(60, 750, 'Collect 150/200\n coins', {
			fontSize: 18,
            font: 'Arial',
			color: '#FFC03D', 
			//color: '#000000', 
			align: 'center'
		});

        let timer = this.time.addEvent({ delay: 600, callback: () => {
            this.map.replaceByIndex(34, 54, 0, 0, 3000, 1000, "Ground-n-Platforms");
            this.map.replaceByIndex(35, 36, 0, 0, 3000, 1000, "Ground-n-Platforms");
            this.map.replaceByIndex(55, 56, 0, 0, 3000, 1000, "Ground-n-Platforms");
            this.map.replaceByIndex(75, 76, 0, 0, 3000, 1000, "Ground-n-Platforms");
            this.map.replaceByIndex(34, 54, 0, 0, 3000, 1000, "Front");
            this.map.replaceByIndex(35, 36, 0, 0, 3000, 1000, "Front");
            this.map.replaceByIndex(55, 56, 0, 0, 3000, 1000, "Front");
            this.map.replaceByIndex(75, 76, 0, 0, 3000, 1000, "Front");
            this.map.replaceByIndex(34, 54, 0, 0, 3000, 1000, "Parallax");
            this.map.replaceByIndex(35, 36, 0, 0, 3000, 1000, "Parallax");
            this.map.replaceByIndex(55, 56, 0, 0, 3000, 1000, "Parallax");
            this.map.replaceByIndex(75, 76, 0, 0, 3000, 1000, "Parallax");
            this.map.replaceByIndex(34, 54, 0, 0, 3000, 1000, "FrontParallax");
            this.map.replaceByIndex(35, 36, 0, 0, 3000, 1000, "FrontParallax");
            this.map.replaceByIndex(55, 56, 0, 0, 3000, 1000, "FrontParallax");
            this.map.replaceByIndex(75, 76, 0, 0, 3000, 1000, "FrontParallax");

            this.time.delayedCall(300, () => {
                this.map.replaceByIndex(54, 34, 0, 0, 3000, 1000,  "Ground-n-Platforms");
                this.map.replaceByIndex(36, 35, 0, 0, 3000, 1000,  "Ground-n-Platforms");
                this.map.replaceByIndex(56, 55, 0, 0, 3000, 1000,  "Ground-n-Platforms");
                this.map.replaceByIndex(76, 75, 0, 0, 3000, 1000,  "Ground-n-Platforms");
                this.map.replaceByIndex(54, 34, 0, 0, 3000, 1000,  "Front");
                this.map.replaceByIndex(36, 35, 0, 0, 3000, 1000,  "Front");
                this.map.replaceByIndex(56, 55, 0, 0, 3000, 1000,  "Front");
                this.map.replaceByIndex(76, 75, 0, 0, 3000, 1000,  "Front");
                this.map.replaceByIndex(54, 34, 0, 0, 3000, 1000,  "Parallax");
                this.map.replaceByIndex(36, 35, 0, 0, 3000, 1000,  "Parallax");
                this.map.replaceByIndex(56, 55, 0, 0, 3000, 1000,  "Parallax");
                this.map.replaceByIndex(76, 75, 0, 0, 3000, 1000,  "Parallax");
                this.map.replaceByIndex(54, 34, 0, 0, 3000, 1000,  "FrontParallax");
                this.map.replaceByIndex(36, 35, 0, 0, 3000, 1000,  "FrontParallax");
                this.map.replaceByIndex(56, 55, 0, 0, 3000, 1000,  "FrontParallax");
                this.map.replaceByIndex(76, 75, 0, 0, 3000, 1000,  "FrontParallax");
            });
        }, callbackScope: this, loop: true });


        this.emerScreen = this.add.tileSprite(0, 0, 15000, 2000, 'red');
		this.emerScreen.alpha = 0;

        my.sprite.player = this.physics.add.sprite(30, 700, "platformer_characters", "tile_0003.png");
        my.sprite.player.setCollideWorldBounds(true);

        

        this.physics.add.collider(my.sprite.player, this.groundLayer);

        this.cameras.main.setBounds(0, 0, 2890, 900);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(0, 100);
        this.cameras.main.setZoom(this.SCALE * 1.5);

        this.spikes = this.map.createFromObjects("Objects", {
            name: "spikes",
            key: "tilemap_sheet",
            frame: 68
        });

        this.frontLayer = this.map.createLayer("Front", this.tileset, 0, 0);
        this.frontPara = this.map.createLayer("FrontParallax", this.tileset, -450, -300)
            .setScale(1.5, 1.5)
            .setScrollFactor(1.5)

        this.physics.world.enable(this.spikes, Phaser.Physics.Arcade.STATIC_BODY);
        this.spikeGroup = this.add.group(this.spikes);

        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            this.pickup.play();
            this.score++;
            console.log(this.score);
            obj2.destroy(); // remove coin on overlap
        });
        
        this.physics.add.overlap(my.sprite.player, this.jumpGroup, (obj1, obj2) => {
            my.sprite.player.body.setVelocityY(-800);
            this.jump.play({rate: 0.7});
            this.anims.play('jumpExtend', this.jPad);
        });

        this.physics.add.overlap(my.sprite.player, this.boosterGroup, (obj1, obj2) => {
            my.sprite.player.scale *= 0.5;
            this.cameras.main.setZoom(this.SCALE * 2);
            this.ACCELERATION = 200;
            obj2.destroy(); // remove coin on overlap

            this.time.delayedCall(5000, () => {
                this.ACCELERATION = 400;
                this.cameras.main.setZoom(this.SCALE * 1.5);
                my.sprite.player.scale *= 2;
            });
        });

        if (this.restart) {
            this.tweens.add({
                targets: this.emerScreen,
                alpha: { from: 1, to: 0},
                ease: 'Sine.easeOut',
                duration: 500
            
            });
        }

        this.gemText = this.add.text(415, 920, 'Gems make\nyou small', {
			fontSize: 1,
            font: 'Arial',
			//color: '#FFDCFF', 
			color: '#000000', 
			align: 'center'
		}).setScrollFactor(1.5).setScale(0.47);

        this.spikeText = this.add.text(799, 894, 'Avoid\nSpikes', {
			fontSize: 1,
            font: 'Arial',
			//color: '#F43E3F', 
			color: '#000000', 
			align: 'center'
		}).setScrollFactor(1.5).setScale(0.47);

        this.physics.add.overlap(my.sprite.player, this.spikeGroup, (obj1, obj2) => {
            this.boomSound.play();
            this.emerScreen.alpha = 1;
            this.frontLayer.alpha = 0;
            this.frontPara.alpha = 0;
            this.restart = true;
            this.tweens.add({
                targets: this.cameras.main,
                zoom: { from: 3, to: 5},
                ease: 'Sine.easeOut',
                duration: 50
            
            });
            this.scene.restart();
            this.isPaused = true;
        });
    }

    delayedRestart () {
        this.spikeText = this.add.text(this.cameras.main.worldView.x+500, this.cameras.main.worldView.y+500, 'Press R\nto Restart', {
			fontSize: 32,
            font: 'Arial',
			//color: '#F43E3F', 
			color: '#000000', 
			align: 'center'
		}).setScrollFactor(1.5);
    }

    update() {
        this.coinText.x = this.cameras.main.worldView.x;
        this.coinText.y = this.cameras.main.worldView.y;
        this.coinText.setText("Coins Needed: " + (150 - this.score));

        if(cursors.left.isDown && !this.isPaused) {
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

            //my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground


            my.vfx.walking.start();


        } else if(cursors.right.isDown && !this.isPaused) {
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);
            //my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-12, my.sprite.player.displayHeight/2-10, false);

            // Only play smoke effect if touching the ground

            my.vfx.walking.start();

        } else {
            // Set acceleration to 0 and have DRAG take over
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
            my.vfx.walking.stop();
        }

        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if(!my.sprite.player.body.blocked.down) {
            
            my.sprite.player.anims.play('jump');
            
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-12, my.sprite.player.displayHeight/2-10, false);

            // Only play smoke effect if touching the ground

            my.vfx.walking.start();

        }
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up) && !this.isPaused) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            this.jump.play({rate: 1});
            my.vfx.jumping.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-12, my.sprite.player.displayHeight/2-10, false);

            // Only play smoke effect if touching the ground

            my.vfx.jumping.start();
            this.time.delayedCall(10, () => {
                my.vfx.jumping.stop();
            });
            
        }

        if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }

        if (150 - this.score <= 0) {
            this.cameras.main.setOrigin(0.5, 0.5);
            this.winScreen.visible = true;
            this.coinText.setText("You Won! Press R to Restart!");
            this.isPaused = true;
            this.coinText.x = this.cameras.main.worldView.x;
            this.coinText.y = this.cameras.main.worldView.y;

        }

        if (this.isPaused) {
            this.delayedRestart();
        }

        // Loop through all identified animated tiles
        //const animationSpeed = 5; // Adjust speed as needed
        //
        //for (const animatedTile of this.animatedTiles) {
        //  // Update frame counter with correct calculation
        //  animatedTile.frameCounter = (animatedTile.frameCount=er + animationSpeed) % animatedTile.animationLength;
        //
        //  const newFrameIndex = Math.floor(animatedTile.frameCounter); // Use floor directly
        //
        //  this.groundLayer.putTileAt(animatedTile.x, animatedTile.y, newFrameIndex);
        //}
    }
}