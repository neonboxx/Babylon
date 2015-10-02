///<reference path="http://cdn.babylonjs.com/2-2/babylon.max.js" />

// Global variables
var canvas, engine, scene, camera, score = 0;
var TOAD_MODEL;
var player;

// An array to store each ending of the lane
var ENDINGS = [];
var keys = { left: 0, right: 0, space: 0 };
var shot;
var lastShotTime;
var shots = [];
var aliens = [];
var alien;
var lastMoveTime = Date.now();
var rowI = -20;
var row = 0;
var moved = false;
var direction = 1;

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
        //Loop each shot and delete if its at the end of the board
        shots.forEach(function (shot, index) {
            if (shot.line.position.z > 35) {
                shot.line.dispose();
                shots.splice(index, 1);
            } else {
                shot.line.position.z += .8;
            }
        });
        //Loop each alien and move them, also check for collision
        moved = false;
        aliens.forEach(function (alien, indexA) {
            var changed= false;
            if ((alien.position.x >= 22 || alien.position.x <= -22) && !changed) {
                direction = -direction;
                changed = true;
            }
        })
        

        aliens.forEach(function (alien, indexA) {

            //Limit how often they move
            if (Date.now() - lastMoveTime > (13 * aliens.length)) {
                alien.position.x += 2 * direction;
                moved = true;
            }
            shots.forEach(function (shot, index) {
                if (shot.line.intersectsMesh(alien, false)) {
                    alien.dispose(true);
                    aliens.splice(indexA, 1);
                    shot.line.dispose(true);
                }
            });
        });
        if(moved === true)
            lastMoveTime = Date.now();

        if (keys.left === 1 && player.position.x > -22) {
            player.position.x -= .2 * scene.getAnimationRatio();
        }
        if (keys.right === 1 && player.position.x < 22) {
            player.position.x += .2 * scene.getAnimationRatio();
        }
        if (keys.space === 1) {
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

    var alienMaterial = new BABYLON.StandardMaterial("alienMat", scene);
    alienMaterial.diffuseColor = new BABYLON.Color3(1, 1, 0);

    //Create some aliens
    for (var i = 0; i < 54; i++) {
        createEnemy(i);
    }

}

function shoot() {
    //Get the player position and create a line from the centre of it and move in z+
    if (shots.length > 0) {
        lastShotTime = shots[shots.length - 1].time;
        if (Date.now() - lastShotTime > 1000) {
            //If over a second has elapsed they can shoot again
            shot = new BABYLON.Mesh.CreateLines("shot", [new BABYLON.Vector3(player.position.x, .5, -19), new BABYLON.Vector3(player.position.x, .5, -17.5)], scene, true);
            shot.checkCollisions = true;
            shots.push({ line: shot, time: new Date() });
        }
    } else {
        shot = new BABYLON.Mesh.CreateLines("shot", [new BABYLON.Vector3(player.position.x, .5, -19), new BABYLON.Vector3(player.position.x, .5, -17.5)], scene, true);
        shot.checkCollisions = true;
        shots.push({ line: shot, time: new Date() });
    }
}

function createEnemy(i) {
    rowI++;
    alien = BABYLON.Mesh.CreateBox("", { width: 2, height: 1, depth: 2 }, scene, true);
    if (i % 6 === 0) {
        row++;
        rowI = -20
    }
    alien.position.y = 1;
    alien.position.x = rowI += 5;
    alien.position.z = -10 + (row * 3);
    alien.setMaterialByID("alienMat");
    alien.checkCollisions = true;
    aliens.push(alien);
}