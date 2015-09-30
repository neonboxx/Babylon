///<reference path="http://cdn.babylonjs.com/2-2/babylon.max.js" />

// Global variables
var canvas, engine, scene, camera, score = 0;
var TOAD_MODEL;
var player;

// An array to store each ending of the lane
var ENDINGS = [];

/**
* Load the scene when the canvas is fully loaded
*/
document.addEventListener("DOMContentLoaded", function () {
    if (BABYLON.Engine.isSupported()) {
        initScene();
    }
}, false);

/**
 * Creates a new BABYLON Engine and initialize the scene
 */
function initScene() {
    // Get canvas
    canvas = document.getElementById("renderCanvas");

    // Create babylon engine
    engine = new BABYLON.Engine(canvas, true);

    // Create scene
    scene = new BABYLON.Scene(engine);

    // Create the camera
    camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 10, -30), scene);
    camera.setTarget(new BABYLON.Vector3(0, 0, 10));    
    camera.attachControl(canvas);

    var ground = new BABYLON.Mesh.CreateGround("ground", 50, 50, 0, scene);


    // Create light
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 10, 0), scene);
    light.intensity = 0.7;

    initGame();

    engine.runRenderLoop(function () {
        scene.render();
        player.position.x = camera.position.x;
    })
}

/**
 * Initialize the game
 */
function initGame() {

    player = BABYLON.Mesh.CreateBox("player", { width: 2, height: 1, depth: 2}, scene, true);
    player.position.y = 1;
    camera.setTarget(scene.getMeshByName("player").position);

    var playerMaterial = new BABYLON.StandardMaterial("playerMat", scene);
    playerMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0); //Red

    player.setMaterialByID("playerMat");


}