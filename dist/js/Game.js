"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

window.addEventListener("DOMContentLoaded", function () {

    new Game('game-canvas');
});

var Game = (function () {
    function Game(canvasId) {
        var _this = this;

        _classCallCheck(this, Game);

        var canvas = document.getElementById(canvasId);
        this.engine = new BABYLON.Engine(canvas, true);
        this.engine.renderEvenInBackground = false;

        // Contains all loaded assets needed for this state
        this.assets = [];

        // The state scene
        this.scene = null;

        // shadow generator
        this.generator = null;

        // Resize window event
        window.addEventListener("resize", function () {
            _this.engine.resize();
        });

        this.run();
    }

    _createClass(Game, [{
        key: "_initScene",
        value: function _initScene() {
            var scene = new BABYLON.Scene(this.engine);
            scene.clearColor = BABYLON.Color3.Black();
            scene.ambientColor = BABYLON.Color3.Black();

            // Hemispheric light to light the scene
            //let h = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0,1,0), scene);
            //h.intensity = 0.4;

            var pl = new BABYLON.PointLight('pl', new BABYLON.Vector3(0, 5, 0), scene);
            pl.range = 30;

            // Directional light for shadows
            //let dl = new BABYLON.DirectionalLight("shadow", new BABYLON.Vector3(-0.05, -1, 0), scene);
            //dl.intensity = 0.5;

            // shadows
            this.generator = new BABYLON.ShadowGenerator(512, pl);
            this.generator.useBlurVarianceShadowMap = true;
            this.generator.blurScale = 0.5;

            var camera = new BABYLON.ArcRotateCamera("camera", 1.68, 1.24, 30, BABYLON.Vector3.Zero(), scene);
            camera.attachControl(scene.getEngine().getRenderingCanvas());

            var ground = BABYLON.Mesh.CreateGround('ground', 100, 100, 1, scene);
            ground.material = new BABYLON.StandardMaterial('', scene);
            ground.material.diffuseTexture = new BABYLON.Texture('assets/ground.jpg', scene);
            ground.material.diffuseTexture.uScale = 5;
            ground.material.diffuseTexture.vScale = 5;
            ground.material.bumpTexture = new BABYLON.Texture('assets/bump.png', scene);
            ground.material.specularColor = BABYLON.Color3.Black();
            ground.material.ambientTexture = new BABYLON.Texture('assets/ambient.png', scene);
            ground.receiveShadows = true;

            return scene;
        }
    }, {
        key: "run",
        value: function run() {
            var _this2 = this;

            this.scene = this._initScene();

            // The loader
            var loader = new BABYLON.AssetsManager(this.scene);

            var meshTask = loader.addMeshTask("bug", "", "./assets/bug/", "bug.babylon");
            meshTask.onSuccess = function (t) {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = t.loadedMeshes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var m = _step.value;

                        m.setEnabled(false);
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator["return"]) {
                            _iterator["return"]();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                _this2.assets['bug'] = {
                    meshes: t.loadedMeshes
                };
            };

            loader.onFinish = function () {

                _this2.scene.executeWhenReady(function () {

                    _this2.engine.runRenderLoop(function () {
                        _this2.scene.render();
                    });
                });

                // Load first level
                _this2._initGame();
            };

            loader.load();
        }
    }, {
        key: "_initGame",
        value: function _initGame() {

            var buggege = new BugGenerator(this);

            var t = new Timer(250, this.scene, { autostart: true, repeat: 200, immediate: true, autodestroy: true });
            t.callback = function () {
                buggege.createBug();
            };

            this.scene.debugLayer.show();
        }

        /**
         * Returns an integer in [min, max[
         */
    }, {
        key: "createModel",

        /**
         * Create an instance model from the given name.
         */
        value: function createModel(name, parent) {
            if (!this.assets[name]) {
                console.warn('No asset corresponding.');
            } else {
                if (!parent) {
                    parent = new GameObject(this);
                }

                var obj = this.assets[name];
                //parent._animations = obj.animations;
                var meshes = obj.meshes;

                for (var i = 0; i < meshes.length; i++) {
                    // Don't clone mesh without any vertices
                    if (meshes[i].getTotalVertices() > 0) {

                        var newmesh = meshes[i].clone(meshes[i].name, null, true);
                        parent.addChildren(newmesh);

                        if (meshes[i].skeleton) {
                            newmesh.skeleton = meshes[i].skeleton.clone();
                            this.scene.stopAnimation(newmesh);
                        }
                    }
                }
            }
            return parent;
        }
    }], [{
        key: "randomInt",
        value: function randomInt(min, max) {
            if (min === max) {
                return min;
            }
            var random = Math.random();
            return Math.floor(random * (max - min) + min);
        }
    }, {
        key: "randomNumber",
        value: function randomNumber(min, max) {
            if (min === max) {
                return min;
            }
            var random = Math.random();
            return random * (max - min) + min;
        }
    }]);

    return Game;
})();
//# sourceMappingURL=Game.js.map
