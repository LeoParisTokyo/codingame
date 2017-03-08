/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

var distances = [];
var nbNeutral = 0;
var shortestDistance;
var bestNeutralPoint;
var headStart = true;
var factoryCount = parseInt(readline()); // the number of factories
var linkCount = parseInt(readline()); // the number of links between factories
var nbBomb = 2;
var myInitialFactory = -1;
var enemyInitialFactory = -1;
var enemySecondFactory = -1;
var bombingFactory = -1;
var timer = 0;
var headBomb1 = false;
var headBomb2 = false;

var neutralCorrection = []; //stores correction on neutral factories of nb of cyborg going there (in future turns, those factories will have less neurtral cyborgs)
var bombed = []; //stores the factories that have been bombed;
for (var i = 0; i < factoryCount; i++) {
    neutralCorrection[i] = 0;
    bombed[i] = 0;
}



for (var i = 0; i < linkCount; i++) {
    var inputs = readline().split(' ');
    var factory1 = parseInt(inputs[0]);
    var factory2 = parseInt(inputs[1]);
    var distance = parseInt(inputs[2]);
    distances.push([factory1, factory2, distance]);
}

function distanceFactory(f1,f2){
    for (var i = 0; i < distances.length; i++){
        if ((distances[i][0] == f1 && distances[i][1] == f2) || (distances[i][0] == f2 && distances[i][1] == f1)){
            return distances[i][2];
        }
    }
}

function findNearestNeutral(myFactory,neutralFactories){
    for (var i = 0; i < neutralFactories.length; i++){
        var currentDistance = distanceFactory(myFactory,neutralFactories[i][0]);
        if (currentDistance < shortestDistance && neutralFactories[i][1] >= 0){
            shortestDistance = currentDistance;
            bestNeutralFactory = neutralFactories[i][0];
        }
    }
    shortestDistance = 1000;
    return bestNeutralFactory; 
}

function findBesttNeutral(myFactory,neutralFactories){
    var bestNeutralFactory = -1;
    for (var i = 0; i < neutralFactories.length; i++){
        var currentDistance = distanceFactory(myFactory,neutralFactories[i][0]);
        var currentId = neutralFactories[i][0];
        var currentCyborg = neutralFactories[i][1];
        var currentProduction = neutralFactories[i][2];
        var currentPoint = currentProduction - currentCyborg - currentDistance;
        if (currentPoint > bestNeutralPoint && neutralFactories[i][1] >= 0){
            bestNeutralPoint = currentPoint;
            bestNeutralFactory = neutralFactories[i][0];
        }
    }
    bestNeutralPoint = -1000;
    return bestNeutralFactory; 
}

function isNearMe(targetFactory, myFactory, enemyFactories){
    var distanceToEnemy = 1000;
    var distanceToMe = distanceFactory(myFactory, targetFactory);
    var currentDistance;
    for (var i = 0; i < enemyFactories.length; i++){
        currentDistance = distanceFactory(targetFactory,enemyFactories[i][0]);
        if (currentDistance < distanceToEnemy){
            distanceToEnemy = currentDistance;
        }
    }

    return distanceToMe < distanceToEnemy;

}

function findWeakestEnemy(enemyFactories){
    var weakestEnemy = -2;
    var weakestCount = 1000;
    for (var i = 0; i < enemyFactories.length; i++){
        if (enemyFactories[i][1] < weakestCount && enemyFactories[i][2] > 0){
            weakestCount = enemyFactories[i][1];
            weakestEnemy = enemyFactories[i][0];
        }
    }
    return weakestEnemy;
}

function findStrongestEnemy(enemyFactories){
    var strongestEnemy = -3;
    var strongestCount = 0;
    for (var i = 0; i < enemyFactories.length; i++){
        if (enemyFactories[i][1] > strongestCount){
            strongestCount = enemyFactories[i][1];
            strongestEnemy = enemyFactories[i][0];
        }
    }
    return strongestEnemy;
}

function findMyNearestToFactory(myFactories, targetFactory){
    var shortDistance = 1000;
    var myDistance = 0;
    var nearestFactory = -4;
    for (var i = 0; i < myFactories.length; i++){
        myDistance = distanceFactory(myFactories[i][0], targetFactory);
        if (myDistance < shortDistance){
            shortDistance = myDistance;
            nearestFactory = myFactories[i][0];
        }
    }
    return nearestFactory;
}

function findMainFactory(myFactories){
    var myMainFactory = -1;
    var myMainFactoryTroop = -1;
    for (var i = 0; i < myFactories.length; i++){
        if (myFactories[i][1] > myMainFactoryTroop){
            myMainFactoryTroop = myFactories[i][1];
            myMainFactory = myFactories[i][0];
        }
    }
    return myMainFactory;
}

function nbCyborg(factory, factories){
    for (var i = 0; i < factories.length; i++){
        if(factory == factories[i][0]){
            return factories[i][1] + 1;
        }
    }
}

function updateNeutralCorrection(targetFactory, targetNbCyborg, myCyborg){
    var before = neutralCorrection[targetFactory];
    if (targetNbCyborg < myCyborg){
        var after = before + targetNbCyborg;
    } else{
        var after = before + myCyborg;
    }

    neutralCorrection[targetFactory] = after;
}

function applyNeutralCorrection(neutralFactories, neutralCorrection){
    for (var i = 0; i < neutralFactories.length; i++){
        var currentFactory = neutralFactories[i][0];
        neutralFactories[i][1] -= neutralCorrection[currentFactory];
    }
}

function countNeutralFactories(neutralFactories){
    var count = 0;
    for (var i = 0; i < neutralFactories.length; i++){
        var myD = distanceFactory(myInitialFactory, neutralFactories[i][0]);
        var enD = distanceFactory(neutralFactories[i][0],enemyInitialFactory);
        if (neutralFactories[i][1] >= 0 && myD <= enD){
            count += 1;
        }
    }
    return count;
}

// game loop
while (true) {
    
var myFactories = [];
var enemyFactories = [];
var enemyFactoriesAll = []; //also stores enemy factories with 0 production
var neutralFactories = [];
var factories = []
var troops = [];
var bestNeutralFactory = -1;
var neutralFactoryProduction = -1;
shortestDistance = 1000;
bestNeutralPoint = -1000;
var from = 0;
var to = 0;
var nbtroop = 0;
var command = "";
    
    
var entityCount = parseInt(readline()); // the number of entities (e.g. factories and troops)
for (var i = 0; i < entityCount; i++) {
    var inputs = readline().split(' ');
    var entityId = parseInt(inputs[0]);
    var entityType = inputs[1];
    var arg1 = parseInt(inputs[2]); //player that owns the troop: 1 for you or -1 for your opponent
    var arg2 = parseInt(inputs[3]); //number of cyborgs in the factory  || Factory From
    var arg3 = parseInt(inputs[4]); //factory production (between 0 and 3) || Factory To
    var arg4 = parseInt(inputs[5]); // || Nb Cyborgs
    var arg5 = parseInt(inputs[6]); // || Nb turns left to reach factory

    if(entityType === "FACTORY"){
        factories.push([entityId,arg2,arg3]);
        if(arg1 === 1){
            myFactories.push([entityId,arg2,arg3, true]);   // [id, nbCyborg, production, isSafe]
        }
        if(arg1 === 0 && arg3 > 0){
            neutralFactories.push([entityId,arg2,arg3,0]);
        }
        if(arg1 === -1 && arg3 > 0){
            enemyFactories.push([entityId,arg2,arg3]);
        }            
        if(arg1 === -1){
            enemyFactoriesAll.push([entityId,arg2,arg3]);
        }
    }

    if(entityType === "TROOP"){
        if(arg1 === -1){
            arg4 = -1 * arg4;
        }
        troops.push([entityId, arg1, arg2, arg3, arg4]);   //   [id, owner, from, to, NbCyborg]
    }
}

//recompute the Nb of Cyborgs in Factories with troops coming and going
for (var i = 0; i < troops.length; i++){
    for (var a = 0; a < myFactories.length; a++){
        if(troops[i][3] == myFactories[a][0]){ //a troop is coming to my Factory
            myFactories[a][1] += troops[i][4];
            if(troops[i][1] == -1){ //The incoming troop is an enemy, my factory is attacked
                myFactories[a][3] = false;
            }
        }
    }

    for (var a = 0; a < neutralFactories.length; a++){
        if(troops[i][3] == neutralFactories[a][0] && troops[i][1] == 1){ //a troop is coming to a neutral Factory
            neutralFactories[a][1] += troops[i][4];
        }
    }

    // for (var a = 0; a < enemyFactories.length; a++){
    //     if(troops[i][3] == enemyFactories[a][0]){ //a troop is coming to an enemy Factory
    //         enemyFactories[a][1] -= troops[i][4];
    //     }
    // }

}

if (myInitialFactory == -1){
    myInitialFactory = myFactories[0][0];
}

if (enemyInitialFactory == -1){
    enemyInitialFactory = enemyFactoriesAll[0][0];
}

if(enemySecondFactory == -1){
    enemySecondFactory = findBesttNeutral(enemyInitialFactory, neutralFactories);
}

var mainFactory = findMainFactory(myFactories);

//applyNeutralCorrection(neutralFactories, neutralCorrection); //Apply correction on neutral Factories nb of Cyborg

nbNeutral = countNeutralFactories(neutralFactories); //check if there are neutral factories left to target

// Headstart
if(headStart){
    if(enemyFactoriesAll[0][2] >= 2){
        command += "BOMB " + myInitialFactory + ' ' + enemyInitialFactory;
        command += ';';
        nbBomb--;
        headBomb1 = true;
        bombed[enemyInitialFactory] = 1;
    }
    if(factories[enemySecondFactory][2] >= 2){
        command += "BOMB " + myInitialFactory + ' ' + enemySecondFactory;
        command += ';';
        nbBomb--;
        headBomb2 = true;
        bombed[enemySecondFactory] = 1;
    }
    
    for (var i = 0; i < neutralFactories.length; i++){
        var targetFactory = neutralFactories[i][0];
        var targetNbCyborg = nbCyborg(targetFactory, neutralFactories);
        var distanceFromMe = distanceFactory(myFactories[0][0],neutralFactories[i][0]);
        var distanceFromEnemy = distanceFactory(neutralFactories[i][0], enemyFactoriesAll[0][0]);
        if(distanceFromMe < distanceFromEnemy){
            command += "MOVE " + myFactories[0][0] + ' ' + targetFactory + ' ' + targetNbCyborg;
            command += ';';
            updateNeutralCorrection(targetFactory, targetNbCyborg, myFactories[0][1]);
            myFactories[0][1] -= targetNbCyborg;
            if (myFactories[0][1] < 0) { 
                myFactories[0][1] = 0;
            }
        }
    }

    headStart = false;

} else {

    // 1.DEFEND  2.INCREASE PRODUCTION  3.FIND NEUTRALS  4. ATTACK
    for (var i = 0; i < myFactories.length; i++){
        if(myFactories[i][1] < 0){  //DEFEND
            var neededCyborg = -1 * myFactories[i][1];
            for (var j = 0; j < myFactories.length; j++){
                if(myFactories[j][1] > 0 && myFactories[i][1] < 0){
                    var canGive = myFactories[j][1] > neededCyborg ? neededCyborg : myFactories[j][1];
                    command += "MOVE " + myFactories[j][0] + ' ' + myFactories[i][0] + ' ' + canGive;
                    command += ';';
                    myFactories[j][1] -= canGive;
                    myFactories[i][1] += canGive;
                }
            }

        } else if (myFactories[i][1] > 10 && myFactories[i][2] <= 2){  //INCREASE PRODUCTION
            command += "INC " + myFactories[i][0];
            command += ';';
            myFactories[i][1] -= 10;

        } else if (nbNeutral > 0){ //FIND NEUTRALS

            var targetFactory = findBesttNeutral(myFactories[i][0], neutralFactories);
            var targetNbCyborg = nbCyborg(targetFactory, neutralFactories);
            var currentFactoryCyborg = myFactories[i][1];
            if (currentFactoryCyborg > targetNbCyborg){
                command += "MOVE " + myFactories[i][0] + ' ' + targetFactory + ' ' + targetNbCyborg;
                command += ';';
                myFactories[i][1] -= targetNbCyborg;
            }



        } else if (enemyFactories.length > 0 && myFactories[i][2] == 3 && myFactories[i][3]){ //ATTACK
            var strongTarget = findStrongestEnemy(enemyFactories);
            var weakTarget = findWeakestEnemy(enemyFactories);
            if (timer == 3 && headBomb1){
                weakTarget = enemyInitialFactory;
                headBomb1 = false;
            }
            if (timer == 4 && headBomb2){
                weakTarget = enemySecondFactory;
                headBomb2 = false;
            }

            if(bombingFactory == myFactories[i][0]){
                command += "MOVE " + myFactories[i][0] + ' ' + bombedFactory + ' ' + myFactories[i][1];
                command += ';';
                bombingFactory = -1;
                bombedFactory = -1;
            }

            if (nbBomb > 0){  // Use a Bomb
                
                if(nbBomb > 0 && bombed[strongTarget] == 0){ //The nearest factory to the strongest enemy bombs
                    bombingFactory = myFactories[i][0];
                    bombedFactory = strongTarget;
                    command += "BOMB " + myFactories[i][0] + ' ' + strongTarget;
                    command += ';';
                    nbBomb -= 1;
                    bombed[strongTarget] = 1;
                } else { // The other factories attack with troops
                    command += "MOVE " + myFactories[i][0] + ' ' + strongTarget + ' ' + myFactories[i][1];
                    command += ';';
                    myFactories[i][1] = 0;
                }
                
            } else { // Attack with troops
                command += "MOVE " + myFactories[i][0] + ' ' + weakTarget + ' ' + myFactories[i][1];
                command += ';';
                myFactories[i][1]
            }   
        } else if (enemyFactories.length == 0 && enemyFactoriesAll.length > 0){ //ATTACK THE REMAINING FACTORIES
            command += "MOVE " + myFactories[i][0] + ' ' + enemyFactoriesAll[0][0] + ' ' + myFactories[i][1];
            command += ';';
        }
    }
}

timer++;


 command = command.slice(0, -1);
 // print(myFactories[0] + ' ' +  myMainFactoryTroop);
 if(command !== ""){
     //print('MOVE ' + from + ' ' + to + ' ' + nbtroop);
     print(command);
 } else {
     print('WAIT');
 }
}