class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // Load characters spritesheet
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");

        // Load tilemap information
        this.load.image("tilemap_tiles", "tilemap_packed.png");                         // Packed tilemap
        this.load.image("background", "background.png");                         // Packed tilemap
        this.load.image("winScreen", "winScreen.png");                         // Packed tilemap
        this.load.tilemapTiledJSON("platformer-level-1", "platformer-level-1.tmj");   // Tilemap in JSON
        
        //this.load.plugin('AnimatedTiles', 'path/to/plugin.js', true);

        // Load the tilemap as a spritesheet
        this.load.spritesheet("tilemap_sheet", "tilemap_packed.png", {
            frameWidth: 18,
            frameHeight: 18
        });

        this.load.spritesheet("coinSpin", "coinSpin.png", {
            frameWidth: 18,
            frameHeight: 18
        });

        this.load.spritesheet("jumpXtd", "JumpBounce.png", {
            frameWidth: 18,
            frameHeight: 18
        });

        this.load.audio('boom', ['explosion.mp3']);
        this.load.audio('shrink', ['shrink.mp3']);
        this.load.audio('jump', ['jump.mp3']);
        this.load.audio('pickup', ['pickup.mp3']);
        this.load.image('red', 'red.png');

        // Oooh, fancy. A multi atlas is a texture atlas which has the textures spread
        // across multiple png files, so as to keep their size small for use with
        // lower resource devices (like mobile phones).
        // kenny-particles.json internally has a list of the png files
        // The multiatlas was created using TexturePacker and the Kenny
        // Particle Pack asset pack.
        this.load.multiatlas("kenny-particles", "kenny-particles.json");
    }

    create() {
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('platformer_characters', {
                prefix: "tile_",
                start: 6,
                end: 7,
                suffix: ".png",
                zeroPad: 4
            }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'coinAnim',
            frames: this.anims.generateFrameNumbers('coinSpin', { start: 0, end: 1}), // Adjust frame range
            frameRate: 10, // Adjust animation speed
            repeat: -1 // Loop animation indefinitely
        });

        this.anims.create({
            key: 'jumpExtend',
            frames: this.anims.generateFrameNumbers('jumpXtd', { start: 1, end: 0}), // Adjust frame range
            frameRate: 1, // Adjust animation speed
            //repeat: -1 // Loop animation indefinitely
        });

        this.anims.create({
            key: 'idle',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0006.png" }
            ],
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0007.png" }
            ],
        });

        

         // ...and pass to the next Scene
         this.scene.start("platformerScene");
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}