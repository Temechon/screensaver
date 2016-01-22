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

    createBug() {
        let path = this._generatePath();
        let bug = this.game.createModel('bug');

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
        let purpleMat = this.scene.getMaterialByName('purple');
        if (!purpleMat) {
            purpleMat = bug._children[0].material.clone('purple', true);
            purpleMat.subMaterials[0].diffuseTexture = this.textures['purple'];
        }

        let seed = Math.random();
        let randomSize = Game.randomNumber(0.25,1);
        if (seed < 0.5) {
            // little red
            bug.material = redMat;
        } else if (seed < 0.9) {
            // medium blue
            randomSize =  Game.randomNumber(1.5,2);
        } else if (Math.random() < 0.95) {
            // larger purple
            randomSize =  Game.randomNumber(3.5,4.5);
            bug.material = purpleMat;
        } else {
            // huge green
            randomSize =  Game.randomNumber(4.7,5.5);
            bug.material = greenMat;
        }

        let speed = 1 / randomSize * 2;
        bug.scaling.scaleInPlace(randomSize);

        this.addShadow(bug);

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

        let walkAnimatable = this.scene.beginAnimation(bug, 0, frame, false, 0.03*speed, ()=> {
            bug.dispose();
            this.createBug();
        });
        bug.runAnim({start:50, end:66, loop:true, speed:1.53*speed});
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