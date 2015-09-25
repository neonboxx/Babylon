///<reference path="babylon.2.1.debug.js" />

'use strict';

window.addEventListener('DOMContentLoaded', function () {
    // get the canvas DOM element
    var canvas = document.getElementById('renderCanvas');

    // load the 3D engine
    var engine = new BABYLON.Engine(canvas, true)

    var createScene = function () {

        // This creates a basic Babylon Scene object (non-mesh)
        var scene = new BABYLON.Scene(engine);

        // This creates and positions a free camera (non-mesh)
        var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);

        // This targets the camera to scene origin
        camera.setTarget(BABYLON.Vector3.Zero());

        // This attaches the camera to the canvas
        camera.attachControl(canvas, true);

        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);

        // Default intensity is 1. Let's dim the light a small amount
        light.intensity = 0.7;

        // Our built-in 'sphere' shape. Params: name, subdivs, size, scene
        var sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene);

        // Move the sphere upward 1/2 its height    
        sphere.scaling = new BABYLON.Vector3(0.1, 0.1, 0.1);
        var materialSphere = new BABYLON.StandardMaterial("texture1", scene);
        materialSphere.diffuseColor = BABYLON.Color3.Red();
        sphere.material = materialSphere;

        // Our built-in 'ground' shape. Params: name, width, depth, subdivs, scene
        var ground = BABYLON.Mesh.CreateGround("ground1", 100, 100, 1, scene);

        var car;

        /*
        //
        // Gets one mesh from the scene
        //

        BABYLON.SceneLoader.ImportMesh("wheel", "", "LexusLFA.babylon", scene, function (newMeshes, particleSystems, skeletons) {

            console.log(newMeshes);

            car = newMeshes[0];

            car.position = new BABYLON.Vector3(0, 5, 0);
            car.scaling = new BABYLON.Vector3(1, 1, 1);


        });*/


        return scene;

    };

    // call the createScene function
    var scene = createScene();

    // run the render loop
    engine.runRenderLoop(function () {
        scene.render();
    });
    
    // the canvas/window resize event handler
    window.addEventListener('resize', function () {
        engine.resize();
    });
});