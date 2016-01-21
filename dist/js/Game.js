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
            scene.gravity = new BABYLON.Vector3(0, -9.81, 0);
            scene.collisionsEnabled = true;

            // Hemispheric light to light the scene
            var h = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), scene);
            h.intensity = 0.5;

            // Directional light for shadows
            var dl = new BABYLON.DirectionalLight("shadow", new BABYLON.Vector3(-0.5, -0.5, -0.5), scene);
            dl.intensity = 0.5;

            // shadows
            this.generator = new BABYLON.ShadowGenerator(2048, dl);
            this.generator.useBlurVarianceShadowMap = true;

            var camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, 0, 10, BABYLON.Vector3.Zero(), scene);
            camera.attachControl(scene.getEngine().getRenderingCanvas());

            var ground = BABYLON.Mesh.CreateGround('ground', 100, 100, 1, scene);
            ground.material = new BABYLON.StandardMaterial('', scene);
            ground.material.diffuseTexture = new BABYLON.Texture('assets/ground.jpg', scene);
            ground.material.diffuseTexture.uScale = 10;
            ground.material.diffuseTexture.vScale = 10;
            ground.material.specularColor = BABYLON.Color3.Black();

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
                //for (let m of t.loadedMeshes) {
                //    m.setEnabled (false);
                //}
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

            for (var i = 0; i < 100; i++) {
                buggege.createBug();
            }

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
        value: function createModel(name, parent, autoanim) {
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

                        newmesh.setEnabled(true);
                        if (meshes[i].skeleton) {
                            newmesh.skeleton = meshes[i].skeleton.clone();
                            this.scene.stopAnimation(newmesh);
                        }
                        if (autoanim) {
                            this.scene.beginAnimation(newmesh, 0, 60, true);
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
