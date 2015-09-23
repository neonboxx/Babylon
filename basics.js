///<reference path="babylon.2.1.debug.js" />

'use strict';

window.addEventListener('DOMContentLoaded', function () {
    // get the canvas DOM element
    var canvas = document.getElementById('renderCanvas');

    // load the 3D engine
    var engine = new BABYLON.Engine(canvas, true)

    var cube;

    BABYLON.SceneLoader.Load("", "LexusLFA.babylon", engine, function (newScene) {

        newScene.executeWhenReady(function () {
            // Attach camera to canvas inputs
            newScene.activeCamera.attachControl(canvas);

            // Once the scene is loaded, just register a render loop to render it
            engine.runRenderLoop(function () {
                newScene.render();
            });
        });


    }, function (progress) {
        // To do: give progress feedback to user
    });

    /*
    // createScene function that creates and return the scene
    var createScene = function () {
        // create a basic BJS Scene object
        var scene = new BABYLON.Scene(engine);

        // create a FreeCamera, and set its position to (x:0, y:5, z:-10)
        var camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5, -10), scene);
        camera.checkCollisions = true;

        // target the camera to scene origin
        camera.setTarget(BABYLON.Vector3.Zero());

        // attach the camera to the canvas
        camera.attachControl(canvas, false);

        // create a basic light, aiming 0,1,0 - meaning, to the sky
        var light = new BABYLON.DirectionalLight('light1', new BABYLON.Vector3(0, 0, 10), scene);

        // create a built-in "sphere" shape; its constructor takes 5 params: name, width, depth, subdivisions, scene
        var sphere = new BABYLON.Mesh.CreateSphere('sphere1', 16, 2, scene);
        sphere.checkCollisions = true;

        // move the sphere upward 1/2 of its height
        sphere.position.y = 1;

        // create a built-in "ground" shape; its constructor takes the same 5 params as the sphere's one
        var ground = new BABYLON.Mesh.CreateGround('ground1', 6, 6, 2, scene);
        ground.checkCollisions = true;

        cube = new BABYLON.Mesh.CreateBox('box', 2, scene);
        cube.position.y = 4;

        // return the created scene
        return scene;
    }

    // call the createScene function
    var scene = createScene();

    // run the render loop
    engine.runRenderLoop(function () {
        scene.render();
    });
    */
    // the canvas/window resize event handler
    window.addEventListener('resize', function () {
        engine.resize();
    });
});