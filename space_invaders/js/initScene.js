///<reference path="http://cdn.babylonjs.com/2-2/babylon.max.js" />

// Global variables
var canvas, engine, scene, camera, score = 0;
var TOAD_MODEL;
var player;

// An array to store each ending of the lane
var ENDINGS = [];
var keys = { left: 0, right: 0, space: 0 };
var shot;
var shots = [];

/**
* Load the scene when the canvas is fully loaded
*/
document.addEventListener("DOMContentLoaded", function () {
    if (BABYLON.Engine.isSupported()) {
        initScene();
    }
}, false);

window.addEventListener("keydown", handleKeyDown, false);
window.addEventListener("keyup", handleKeyUp, false);

function handleKeyDown(evt) {
    if (evt.keyCode === 37) {//Left
        keys.left = 1;
    }
    if (evt.keyCode === 39) {//Right
        keys.right = 1;
    }
    if (evt.keyCode === 32) {//Space
        keys.space = 1;
    }
}

function handleKeyUp(evt) {
    if (evt.keyCode === 37) {
        keys.left = 0;
    }
    if (evt.keyCode === 39) {
        keys.right = 0;
    }
    if (evt.keyCode === 32) {//Space
        keys.space = 0;
    }
}

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
    scene.debugLayer.show();

    // Create the camera
    camera = new BABYLON.FollowCamera("camera", new BABYLON.Vector3(0, 20, -60), scene);
    camera.setTarget(new BABYLON.Vector3(0, 0, 10));
    camera.attachControl(canvas);

    var ground = new BABYLON.Mesh.CreateGround("ground", 50, 50, 0, scene);

    // Create light
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 10, 0), scene);
    light.intensity = 0.7;

    initGame();

    engine.runRenderLoop(function () {
        scene.render();
        shots.forEach(function (shot, index) {
            if (shot.position.z > 35) {
                shot.dispose();
                shots.splice(index, 1);
            } else {
                shot.position.z += .2;
            }
        })
        if (keys.left === 1 && player.position.x > -22) {
            player.position.x -= .2;
        }
        if (keys.right === 1 && player.position.x < 22) {
            player.position.x += .2;
        }
        if (keys.space === 1 && shots.length < 3) {
                shoot();
        }
    })
}

/**
 * Initialize the game
 */
function initGame() {

    player = BABYLON.Mesh.CreateBox("player", { width: 2, height: 1, depth: 2}, scene, true);
    player.position.y = 1;
    player.position.z = -20;
    camera.setTarget(scene.getMeshByName("player").position);

    var playerMaterial = new BABYLON.StandardMaterial("playerMat", scene);
    playerMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0); //Red

    player.setMaterialByID("playerMat");

}

function shoot() {
    //Get the player position and create a line from the centre of it and move in z+
    shots.push(new BABYLON.Mesh.CreateLines("shot", [new BABYLON.Vector3(player.position.x, .5, -19), new BABYLON.Vector3(player.position.x, .5, -18)], scene, true));
}