"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BugGenerator = (function () {
    function BugGenerator(game) {
        _classCallCheck(this, BugGenerator);

        this.game = game;
        this.scene = game.scene;

        this.radius = 20;
    }

    _createClass(BugGenerator, [{
        key: "createBug",
        value: function createBug() {
            var _this = this;

            var path = this._generatePath();
            var bug = this.game.createModel('bug');
            var randomSize = Game.randomNumber(0.5, 2.5);
            bug.scaling.scaleInPlace(randomSize);

            // reset animations
            bug.animations = [];

            // create animation
            var keys = [];
            var frame = 0;
            var walkAnim = new BABYLON.Animation("moveAnimation", "position", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

            var _loop = function (p) {
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
            };

            for (var p = 0; p < path.length; p++) {
                _loop(p);
            }
            walkAnim.setKeys(keys);
            bug.animations.push(walkAnim);

            var walkAnimatable = this.scene.beginAnimation(bug, 0, frame, false, 0.2, function () {
                bug.dispose();
                _this.createBug();
            });
            bug.runAnim({ start: 50, end: 66, loop: true, speed: 1 });
        }
    }, {
        key: "_generatePath",
        value: function _generatePath() {

            var curve = BABYLON.Curve3.CreateCubicBezier(this._randomPosition(), this._randomPosition(), this._randomPosition(), this._randomPosition(), 200 /*Game.randomInt(60,100)*/);
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
