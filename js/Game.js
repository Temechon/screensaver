window.addEventListener("DOMContentLoaded", () => {

    new Game('game-canvas');
});


class Game {
    constructor(canvasId) {

        let canvas          = document.getElementById(canvasId);
        this.engine         = new BABYLON.Engine(canvas, true);

        // Contains all loaded assets needed for this state
        this.assets         = [];

        // The state scene
        this.scene          = null;

        // shadow generator
        this.generator = null;

        // Resize window event
        window.addEventListener("resize", () => {
            this.engine.resize();
        });

        this.run();

    }

    _initScene() {
        let scene = new BABYLON.Scene(this.engine);
        scene.gravity = new BABYLON.Vector3(0, -9.81, 0);
        scene.collisionsEnabled = true;

        // Hemispheric light to light the scene
        let h = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0,1,0), scene);
        h.intensity = 0.5;

        // Directional light for shadows
        let dl = new BABYLON.DirectionalLight("shadow", new BABYLON.Vector3(-0.5, -0.5, -0.5), scene);
        dl.intensity = 0.5;

        // shadows
        this.generator = new BABYLON.ShadowGenerator(2048, dl);
        this.generator.useBlurVarianceShadowMap = true;

        let camera = new BABYLON.ArcRotateCamera("camera",Math.PI/2, 0, 10, BABYLON.Vector3.Zero(), scene);
        camera.attachControl(scene.getEngine().getRenderingCanvas());

        let ground = BABYLON.Mesh.CreateGround('ground', 100, 100, 1, scene);
        ground.material = new BABYLON.StandardMaterial('', scene);
        ground.material.diffuseTexture = new BABYLON.Texture('assets/ground.jpg', scene);
        ground.material.diffuseTexture.uScale = 10;
        ground.material.diffuseTexture.vScale = 10;
        ground.material.specularColor = BABYLON.Color3.Black();


        return scene;
    }

    run() {

        this.scene = this._initScene();

        // The loader
        let loader =  new BABYLON.AssetsManager(this.scene);

        let meshTask = loader.addMeshTask("bug", "", "./assets/bug/", "bug.babylon");
        meshTask.onSuccess = (t) => {
            //for (let m of t.loadedMeshes) {
            //    m.setEnabled (false);
            //}
            this.assets['bug'] = {
                meshes : t.loadedMeshes
            }
        };

        loader.onFinish = () => {

            this.scene.executeWhenReady(() => {

                this.engine.runRenderLoop(() => {
                    this.scene.render();
                });
            });

            // Load first level
            this._initGame();

        };

        loader.load();
    }

    _initGame() {

        let buggege = new BugGenerator(this);

        for (let i=0; i<100; i++) {
            buggege.createBug();
        }

        this.scene.debugLayer.show();
    }

    /**
     * Returns an integer in [min, max[
     */
    static randomInt(min, max) {
        if (min === max) {
            return (min);
        }
        let random = Math.random();
        return Math.floor(((random * (max - min)) + min));
    }

    static randomNumber(min, max) {
        if (min === max) {
            return (min);
        }
        let random = Math.random();
        return (random * (max - min)) + min;
    }

    /**
     * Create an instance model from the given name.
     */
    createModel(name, parent, autoanim) {
        if (! this.assets[name]) {
            console.warn('No asset corresponding.');
        } else {
            if (!parent) {
                parent = new GameObject(this);
            }

            let obj = this.assets[name];
            //parent._animations = obj.animations;
            let meshes = obj.meshes;

            for (let i=0; i<meshes.length; i++ ){
                // Don't clone mesh without any vertices
                if (meshes[i].getTotalVertices() > 0) {

                    let newmesh = meshes[i].clone(meshes[i].name, null, true);
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
}
