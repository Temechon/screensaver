"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BugGenerator = (function () {
    function BugGenerator(game) {
        _classCallCheck(this, BugGenerator);

        this.game = game;
        this.scene = game.scene;

        this.radius = 30;
    }

    _createClass(BugGenerator, [{
        key: "addShadow",
        value: function addShadow(bug) {
            var _this = this;

            bug._children.forEach(function (child) {
                // Add the enemy to the shadow generator
                _this.game.generator.getShadowMap().renderList.push(child);
            });
        }
    }, {
        key: "createBug",
        value: function createBug() {
            var _this2 = this;

            var path = this._generatePath();
            var bug = this.game.createModel('bug');
            var randomSize = Game.randomNumber(0.25, 1);

            if (Math.random() > 0.5) {
                randomSize = Game.randomNumber(1.5, 2);
            }
            if (Math.random() > 0.9) {
                randomSize = Game.randomNumber(3.5, 4.5);
            }
            var speed = 1 / randomSize * 2;
            bug.scaling.scaleInPlace(randomSize);

            this.addShadow(bug);

            // reset animations
            bug.animations = [];

            // create animation
            var keys = [];
            var frame = 0;
            var walkAnim = new BABYLON.Animation("moveAnimation", "position", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

            bug.position.copyFrom(path[0]);
            var lastPos = path[0];

            var _loop = function (p) {

                if (BABYLON.Vector3.DistanceSquared(lastPos, path[p]) > 1) {

                    // Push animation key
                    keys.push({
                        frame: frame,
                        value: path[p]
                    });
                    // For each point
                    walkAnim.addEvent(new BABYLON.AnimationEvent(frame, function () {

                        if (p < path.length - 1) {
                            bug.lookAt(path[p + 1]);
                        }
                    }));
                    frame += 1;
                    lastPos = path[p];
                }
            };

            for (var p = 1; p < path.length; p++) {
                _loop(p);
            }
            walkAnim.setKeys(keys);
            bug.animations.push(walkAnim);

            var walkAnimatable = this.scene.beginAnimation(bug, 0, frame, false, 0.03 * speed, function () {
                bug.dispose();
                _this2.createBug();
            });
            bug.runAnim({ start: 50, end: 66, loop: true, speed: 1.53 * speed });
        }
    }, {
        key: "_generatePath",
        value: function _generatePath() {

            var curve = BABYLON.Curve3.CreateCubicBezier(this._randomPosition(), this._randomPosition(), this._randomPosition(), this._randomPosition(), 60);
            return curve.getPoints();
        }
    }, {
        key: "_randomPosition",
        value: function _randomPosition() {
            var angle = Math.random() * Math.PI * 2;
            return new BABYLON.Vector3(Math.cos(angle) * this.radius, 0, Math.sin(angle) * this.radius);
        }
    }]);

    return BugGenerator;
})();
//# sourceMappingURL=BugGenerator.js.map
