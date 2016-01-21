class BugGenerator {

    constructor(game) {
        this.game = game;
        this.scene = game.scene;

        this.radius = 20;
    }

    createBug() {
        let path = this._generatePath();
        let bug = this.game.createModel('bug');
        let randomSize = Game.randomNumber(0.5,2.5);
        bug.scaling.scaleInPlace(randomSize);

        // reset animations
        bug.animations = [];


        // create animation
        let keys = [];
        let frame = 0;
        let walkAnim = new BABYLON.Animation("moveAnimation", "position", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

        for (let p = 0; p<path.length; p++) {
            // Push animation key
            keys.push({
                frame : frame,
                value : path[p]
            });
            // For each point
            walkAnim.addEvent(new BABYLON.AnimationEvent(frame, () => {

                if (p<path.length-1) {
                    bug.lookAt(path[p+1]);
                }
            }));
            frame += 1;
        }
        walkAnim.setKeys(keys);
        bug.animations.push(walkAnim);

        let walkAnimatable = this.scene.beginAnimation(bug, 0, frame, false, 0.2, ()=> {
            bug.dispose();
            this.createBug();
        });
        bug.runAnim({start:50, end:66, loop:true, speed:1});
    }

    _generatePath() {

        let curve = BABYLON.Curve3.CreateCubicBezier(
            this._randomPosition(),
            this._randomPosition(),
            this._randomPosition(),
            this._randomPosition(),
            200/*Game.randomInt(60,100)*/);
        return curve.getPoints();

    }

    _randomPosition() {
        let angle = Math.random()*Math.PI*2;
        return new BABYLON.Vector3(Math.cos(angle)*this.radius, 0, Math.sin(angle)*this.radius);
    }
}