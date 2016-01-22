class BugGenerator {

    constructor(game) {
        this.game = game;
        this.scene = game.scene;

        this.radius = 30;

        this.textures = [];


        this.textures['green'] = new BABYLON.Texture('assets/bug/CrawlingBug-Green.jpg', this.scene);
        this.textures['red'] = new BABYLON.Texture('assets/bug/CrawlingBug-Red.jpg', this.scene);
        this.textures['purple'] = new BABYLON.Texture('assets/bug/CrawlingBug-Purple.jpg', this.scene);
    }

    addShadow(bug) {
        bug._children.forEach((child) => {
            // Add the enemy to the shadow generator
            this.game.generator.getShadowMap().renderList.push(child);
        });
    }

    initBug(bug) {
        let path = this._generatePath();

        let greenMat = this.scene.getMaterialByName('green');
        if (!greenMat) {
            greenMat = bug._children[0].material.clone('green', true);
            greenMat.subMaterials[0].diffuseTexture = this.textures['green'];
        }
        let redMat = this.scene.getMaterialByName('red');
        if (!redMat) {
            redMat = bug._children[0].material.clone('red', true);
            redMat.subMaterials[0].diffuseTexture = this.textures['red'];
        }

        let seed = Math.random();
        let randomSize = Game.randomNumber(0.25,1);
        if (seed < 0.75) {
            // little red
            bug.material = redMat;
        }

        if (seed > 0.75) {
            // medium blue
            randomSize =  Game.randomNumber(1.5,2);
        }
        if (Math.random() > 0.99) {
            // larger green
            randomSize =  Game.randomNumber(2.5,4.5);
            bug.material = greenMat;
        }

        let speed = 1 / randomSize * 2;
        bug.scaling.copyFromFloats(1,1,1);
        bug.scaling.scaleInPlace(randomSize);

        // reset animations
        bug.animations = [];

        // create animation
        let keys = [];
        let frame = 0;
        let walkAnim = new BABYLON.Animation("moveAnimation", "position", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

        bug.position.copyFrom(path[0]);
        let lastPos = path[0];
        for (let p = 1; p<path.length; p++) {

            if (BABYLON.Vector3.DistanceSquared(lastPos, path[p]) > 1) {

                // Push animation key
                keys.push({
                    frame: frame,
                    value: path[p]
                });
                // For each point
                walkAnim.addEvent(new BABYLON.AnimationEvent(frame, () => {

                    if (p < path.length - 1) {
                        bug.lookAt(path[p + 1]);
                    }
                }));
                frame += 1;
                lastPos = path[p];
            }
        }
        walkAnim.setKeys(keys);
        bug.animations.push(walkAnim);

        this.scene.beginAnimation(bug, 0, frame, false, 0.03*speed, ()=> {
            this.initBug(bug);
        });
        bug.runAnim({start:50, end:66, loop:true, speed:1.53*speed});

    }

    createBug() {
        let bug = this.game.createModel('bug');
        this.addShadow(bug);
        this.initBug(bug);
    }

    _generatePath() {

        let curve = BABYLON.Curve3.CreateCubicBezier(
            this._randomPosition(),
            this._randomPosition(),
            this._randomPosition(),
            this._randomPosition(),
            60);
        return curve.getPoints();

    }

    _randomPosition() {
        let angle = Math.random()*Math.PI*2;
        return new BABYLON.Vector3(Math.cos(angle)*this.radius, 0, Math.sin(angle)*this.radius);
    }
}