﻿///<reference path="http://cdn.babylonjs.com/2-2/babylon.max.js" />

// Global variables
var canvas, engine, scene, camera, score = 0;
var player;

// An array to store each ending of the lane
var ENDINGS = [];
var keys = { left: 0, right: 0, space: 0 };
var shot;
var lastShotTime;

var shots = [];
var materialShot;

var aliens = [];
var alien;
var alienCenter;
var alienMat;
var alienCount = 0;

var playerVelocity = 0;
var playerAcceleration = 0.025;
var playerMaxSpeed = 0.3;
var playerFriction = 0.025;
var playerMaxLean = 45; //degrees 

var lastMoveTime = Date.now();
var rowI = -20;
var row = 0;
var rows = [{aliens: []}];
var moved = false;
var direction = 1;
var changed = false;

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
    

    var assetsManager = new BABYLON.AssetsManager(scene);

    var shipTask = assetsManager.addMeshTask("task", "", "./", "ship.babylon");

    shipTask.onSuccess = function (task) {
        player = task.loadedMeshes[0];
    }

    // Create the camera
    camera = new BABYLON.FollowCamera("camera", new BABYLON.Vector3(0, 20, -60), scene);
    camera.setTarget(new BABYLON.Vector3(0, 0, 10));
    camera.attachControl(canvas);

    //var ground = new BABYLON.Mesh.CreateGround("ground", 50, 50, 0, scene);

    // Create light
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 10, 0), scene);
    light.intensity = 0.7;
    

    assetsManager.onFinish = function (tasks) {

        initGame();

        engine.runRenderLoop(function () {
            scene.render();
            //Loop each shot and delete if its at the end of the board
            shots.forEach(function (shot, index) {
                if (shot.line.position.z > 35) {
                    shot.line.dispose();
                    shots.splice(index, 1);
                } else {
                    shot.line.position.z += 1.2 * scene.getAnimationRatio();
                }
            });

            changed = false;
            moved = false;
            if (Date.now() - lastMoveTime > (20 * alienCount)) {

                if ((alienCenter.x <= -22 && !changed) || (alienCenter.x >= 22 && !changed)) {
                    direction = -direction;
                    alienCenter.z -= 1;
                    changed = true
                }

                alienCenter.x += 2 * direction;
                moved = true;
            }
            rows.forEach(function (row, indexR) {
                rows[indexR].aliens.forEach(function (alien, indexA) {
                    alien.position = alienCenter.add(alien.offsetPosition);
                    shots.forEach(function (shot, index) {
                        if (shot.line.intersectsMesh(alien, false)) {
                            alien.dispose(true);
                            rows[indexR].aliens.splice(indexA, 1);
                            shot.line.dispose(true);
                            alienCount--;
                        }
                    });
                });

            });

            if (moved)
                lastMoveTime = Date.now();

            playerVelocity *= 1-playerFriction;

            if (keys.left === 1 && player.position.x > -22) {
                if(playerVelocity > -playerMaxSpeed)
                {
                    playerVelocity -= playerAcceleration;
                }
            }
            if (keys.right === 1) {
                if (playerVelocity < playerMaxSpeed) {
                    playerVelocity += playerAcceleration;
                }
            }
            if (keys.space === 1) {
                shoot();
            }

            player.position.x += playerVelocity * scene.getAnimationRatio();
            if (player.position.x > 22)
            {
                player.position.x = 22
                playerVelocity = 0;
            }
            if (player.position.x < -22)
            {
                player.position.x = -22
                playerVelocity = 0;
            }
            
            //all this does is stops it juddering when you hold a direction
            var leanDegrees = (playerMaxLean*1.2) * (playerVelocity / playerMaxSpeed)
            leanDegrees = playerVelocity > 0 ? Math.min(playerMaxLean, leanDegrees) : Math.max(-playerMaxLean, leanDegrees)
            var lean = BABYLON.Angle.FromDegrees(leanDegrees).radians()   
            player.rotation.x = lean;
        })
    }

    assetsManager.load();
}

/**
 * Initialize the game
 */
function initGame() {

    player.position.y = 1;
    player.position.z = -30;
    player.rotation.y = new BABYLON.Angle.FromDegrees(90).radians();
    
    camera.setTarget(scene.getMeshByName("space_frig").position);

    var playerMaterial = new BABYLON.StandardMaterial("playerMat", scene);
    playerMaterial.diffuseTexture = new BABYLON.Texture("./space_frigate_6_color.png", scene);
    playerMaterial.specularTexture = new BABYLON.Texture("./space_frigate_6_specular.png", scene);
    playerMaterial.emissiveTexture = new BABYLON.Texture("./space_frigate_6_illumination.png", scene);
    player.material = playerMaterial

    materialShot = new BABYLON.StandardMaterial("texture2", scene);
    materialShot.diffuseColor = new BABYLON.Color3(1, 0, 0); //Red
    materialShot.alpha = 0.8;
    materialShot.emissiveColor = new BABYLON.Color3(1, 0, 0);


    alienMat = new BABYLON.StandardMaterial("kosh", scene);
    alienCenter = new BABYLON.Vector3(0, 1, 10);
    


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
            //shot = new BABYLON.Mesh.CreateLines("shot", [new BABYLON.Vector3(player.position.x, .5, -19), new BABYLON.Vector3(player.position.x, .5, -17.5)], scene, true);
            shot = new BABYLON.Mesh.CreateSphere("shot", 5, 0.5, scene, true)
            shot.position = new BABYLON.Vector3(player.position.x, .5, player.position.z+1)
            shot.material = materialShot;
            shot.checkCollisions = true;
            shots.push({ line: shot, time: new Date() });
        }
    } else {
        shot = shot = new BABYLON.Mesh.CreateSphere("shot",5, 0.5, scene, true)//new BABYLON.Mesh.CreateLines("shot", [new BABYLON.Vector3(player.position.x, .5, -19), new BABYLON.Vector3(player.position.x, .5, -17.5)], scene, true);
        shot.color = new BABYLON.Color3(24, 135, 216);
        shot.position = new BABYLON.Vector3(player.position.x, .5, player.position.z+1)
        shot.checkCollisions = true;
        shot.material = materialShot;
        shots.push({ line: shot, time: new Date() });
    }
}

function createEnemy(i) {
    alien = BABYLON.Mesh.CreateBox("", { width: 2, height: 1, depth: 2 }, scene, true);
    if (i % 6 === 0 && i > 0) {
        row++;
        rowI = -20
        rows.push({ aliens: [] });
    }
    alien.position.y = 1;
    alien.position.x = rowI += 5;
    alien.position.z = -4 + (row * 3);
    alien.checkCollisions = true;
    alien.offsetPosition = alienCenter.subtract(alien.position);
    alien.material = alienMat;
    rows[row].aliens.push(alien);
    rowI++;
    alienCount++;
}