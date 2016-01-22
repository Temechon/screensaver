window.addEventListener("DOMContentLoaded", () => {

    new Game('game-canvas');
});


class Game {
    constructor(canvasId) {

        let canvas          = document.getElementById(canvasId);
        this.engine         = new BABYLON.Engine(canvas, true);
        this.engine.renderEvenInBackground = false;

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
        scene.clearColor = BABYLON.Color3.Black();
        scene.ambientColor = BABYLON.Color3.Black();

        // Hemispheric light to light the scene
        //let h = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0,1,0), scene);
        //h.intensity = 0.4;

        let pl = new BABYLON.PointLight('pl', new BABYLON.Vector3(0,5,0), scene);
        pl.range = 30;

        // Directional light for shadows
        //let dl = new BABYLON.DirectionalLight("shadow", new BABYLON.Vector3(-0.05, -1, 0), scene);
        //dl.intensity = 0.5;

        // shadows
        this.generator = new BABYLON.ShadowGenerator(512, pl);
        this.generator.useBlurVarianceShadowMap = true;
        this.generator.blurScale = 0.5;

        let camera = new BABYLON.ArcRotateCamera("camera",1.68, 1.24, 30, BABYLON.Vector3.Zero(), scene);
        camera.attachControl(scene.getEngine().getRenderingCanvas());

        let ground = BABYLON.Mesh.CreateGround('ground', 100, 100, 1, scene);
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

    run() {

        this.scene = this._initScene();

        // The loader
        let loader =  new BABYLON.AssetsManager(this.scene);

        let meshTask = loader.addMeshTask("bug", "", "./assets/bug/", "bug.babylon");
        meshTask.onSuccess = (t) => {
            for (let m of t.loadedMeshes) {
                m.setEnabled (false);
            }
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

        let t = new Timer(250, this.scene, {autostart:true, repeat:200, immediate:true, autodestroy:true});
        t.callback = () => {
            buggege.createBug();
        };

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
    createModel(name, parent) {
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

                    if (meshes[i].skeleton) {
                        newmesh.skeleton = meshes[i].skeleton.clone();
                        this.scene.stopAnimation(newmesh);
                    }
                }
            }
        }
        return parent;
    }
}
