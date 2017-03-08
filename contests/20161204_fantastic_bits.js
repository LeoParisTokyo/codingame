/**
 * Grab Snaffles and try to throw them through the opponent's goal!
 * Move towards a Snaffle and use your team id to determine where you need to throw it.
 **/

var myTeamId = parseInt(readline()); // if 0 you need to score on the right of the map, if 1 you need to score on the left
var goalCenter = [];
var myGoalCenter = [];
var scoreLeft, scoreRight;
var safeCenter = [];

if (myTeamId === 0){
    goalCenter = ['goalCenter',16000,3750];
    myGoalCenter = ['myGoalCenter',0,3750];
    scoreRight = true;
    scoreLeft = false;
    safeCenter = ['safeCenter',14000,3750];

} else {
    goalCenter = ['goalCenter',0,3750];
    myGoalCenter = ['myGoalCenter',16000,3750];
    scoreRight = false;
    scoreLeft = true;
    safeCenter = ['safeCenter',2000,3750];
}

var corr = 300;
var goalY1 = 3750 - 2000 + 300 + corr; //Y1 coordinate of the 1st goal
var goalY2 = 3750 + 2000 - 300 - corr; //Y2 coordinate of the 1st goal
var goalTopY1 = -3750 - 2000 + 300 + corr; //Y1 coordinate of the 2nd goal (the imaginary reflection across the top horizontal line)
var goalTopY2 = -3750 + 2000 - 300 - corr; //Y2 coordinate of the 2nd goal (the imaginary reflection across the top horizontal line)
var goalBottomY1 = 7500 + 3750 - 2000 + 300 + corr; //Y1 coordinate of the 3rd goal (the imaginary reflection across the bottom horizontal line)
var goalBottomY2 = 7500 + 3750 + 2000 - 300 - corr; //Y2 coordinate of the 3rd goal (the imaginary reflection across the bottom horizontal line)
var impossibleShootZone = scoreRight ? [[14000,1750],[14000,5750]] : [[2000,1750],[2000,5750]];
var dangerZone = scoreRight ? [[6000,1750],[6000,5750]] : [[8000,1750],[8000,5750]];
var wizard = []; //Array containing my 2 Wizards
var opponentWizard = []; //Array containing the 2 opponent Wizards
var snaffle = []; //Array containing the Snaffles
var bludger = []; //Array containing the Bludgers
var nearestSnaffleW0;
var nearestSnaffleW1;
var shortDistanceW0;
var shortDistanceW1;
var bludgerW0;
var bludgerW1;
var shortdistanceBludgerW0;
var shortdistanceBludgerW1;
var distanceTemp;
var commandW0;
var commandW1;
var magicGauge = 0;
var maxDistancePossible = Math.sqrt(Math.pow(16000,2) + Math.pow(7500,2));
var W0didAccio;
var W1didAccio;


// game loop
while (true) {
    var entities = parseInt(readline()); // number of entities still in game
    wizard = [];
    opponentWizard = [];
    snaffle = [];
    bludger = []; //Initialize the arrays for each entityType
    commandW0 = '';
    commandW1 = '';
    

    function isInShootableZone(wizard){
        if (scoreRight){
            var inImpossibleZone = ((wizard[1] > 14000 && wizard[2] < 1750) || (wizard[1] > 14000 && wizard[2] > 5750));
        } else {
            var inImpossibleZone = ((wizard[1] < 2000 && wizard[2] < 1750) || (wizard[1] < 2000 && wizard[2] > 5750));
        }

        return !inImpossibleZone;
    }


    //To know if it is good to use FLIPENDO on a Snaffle
    //The Wizard and the Snaffle forms an imaginary line that will intersect with the vertical line of the goal
    //line of Wizard and Snaffle is y = mx + p where m = (Sy - Wy)/(Sx - Wx) and p = Sy-mSx
    //The intersection is where x = 16000  if we score on the right or 0 if we score on the left
    //If the intersection has a vertical coordinate (interY) that is between the 2 goal posts, then we shoot (use FLIPPENDO)
    //Take rebounds into account:  just target the reflection off the top horizontal border or the bottom one
    //So we can target 3 goals, the normal one + its 2 reflections: interY has to be in between any of the 3 goalposts
    //improvement: check that there is no Bludgers or Enemies in the trajectory before shooting
    //They are in the trajectory if they match the y=mx+p AND if they are in front of the Wizard
    function canShoot(wizard, snaffle){
        var m = (snaffle[2] - wizard[2]) / (snaffle[1] - wizard[1]);
        var p = snaffle[2] - (m * snaffle[1]);
        var interX = scoreRight ? 16000 : 0;
        var interY = (m * interX) + p;
        var hasTargetShot = (interY > goalY1 && interY < goalY2) || (interY > goalTopY1 && interY < goalTopY2) || (interY > goalBottomY1 && interY < goalBottomY2);
        var isShootable = isInShootableZone(snaffle);
        
        return hasTargetShot && isShootable;
    }

    function isInFront(a,b){
        return ((scoreRight && (b[1] > a[1])) || (scoreLeft && (a[1] > b[1])));
    }

    //a threatening Snaffle is one moving inside the DangerZone and moving towards my own Goal
    function isThreatening(snaffle){
        if (scoreRight){
            var isInDangerZone = snaffle[1] < 4000;
            var isMovingFast = snaffle[3] < -600;
            return isInDangerZone && isMovingFast;
        } else {
            var isInDangerZone = snaffle[1] > 12000;
            var isMovingFast = snaffle[3] > 600;
            return isInDangerZone && isMovingFast;
        }
    }

    function distance (a,b){
        var distance = Math.sqrt(Math.pow(a[1] - b[1],2) + Math.pow(a[2] - b[2],2));
        return distance;
    }

    function isDefendable(){
        var distanceWizard0ToMyGoal = Math.sqrt(Math.pow(wizard[0][1] - myGoalCenter[1],2) + Math.pow(wizard[0][2] - myGoalCenter[2],2));
        var distanceWizard1ToMyGoal = Math.sqrt(Math.pow(wizard[1][1] - myGoalCenter[1],2) + Math.pow(wizard[1][2] - myGoalCenter[2],2));
        var distanceOpponentWizard0ToMyGoal = Math.sqrt(Math.pow(opponentWizard[0][1] - myGoalCenter[1],2) + Math.pow(opponentWizard[0][2] - myGoalCenter[2],2));
        var distanceOpponentWizard1ToMyGoal = Math.sqrt(Math.pow(opponentWizard[1][1] - myGoalCenter[1],2) + Math.pow(opponentWizard[1][2] - myGoalCenter[2],2));
        var W0CanDefend = (distanceWizard0ToMyGoal <= distanceOpponentWizard0ToMyGoal && distanceWizard0ToMyGoal <= distanceOpponentWizard1ToMyGoal);
        var W1CanDefent = (distanceWizard1ToMyGoal <= distanceOpponentWizard0ToMyGoal && distanceWizard1ToMyGoal <= distanceOpponentWizard1ToMyGoal);

        if (W0CanDefend || W1CanDefent) {
            return true;
        } else {
            return false;
        }
    }

    //////// Initialize parameters //////////   
    for (var i = 0; i < entities; i++) {
        var inputs = readline().split(' ');
        var entityId = parseInt(inputs[0]); // entity identifier
        var entityType = inputs[1]; // "WIZARD", "OPPONENT_WIZARD" or "SNAFFLE" (or "BLUDGER" after first league)
        var x = parseInt(inputs[2]); // position
        var y = parseInt(inputs[3]); // position
        var vx = parseInt(inputs[4]); // velocity
        var vy = parseInt(inputs[5]); // velocity
        var state = parseInt(inputs[6]); // 1 if the wizard is holding a Snaffle, 0 otherwise
        
        //Build an array for each entityType
        if (entityType == 'WIZARD'){
            x = Math.round(x + vx * 0.75); //we are interested in the next position, not the current one (the next postion is theoretical for the other objects)
            y = Math.round(y + vy * 0.75);
            wizard.push([entityId,x,y,vx,vy,state]);
        }

        if (entityType == 'OPPONENT_WIZARD'){
            x = Math.round(x + vx * 0.75);
            y = Math.round(y + vy * 0.75);
            opponentWizard.push([entityId,x,y,vx,vy,state]);
        }

        if (entityType == 'SNAFFLE'){
            x = Math.round(x + vx * 0.75);
            y = Math.round(y + vy * 0.75);
            snaffle.push([entityId,x,y,vx,vy]);
        }

        if (entityType == 'BLUDGER'){
            x = Math.round(x + vx * 0.9);
            y = Math.round(y + vy * 0.9);
            bludger.push([entityId,x,y,vx,vy]);
        }
        
    }

    /// Check which Snaffle each Wizard should target

    if (snaffle.length <= 1) {

        nearestSnaffleW0 = 0;
        nearestSnaffleW1 = 0;
        shortDistanceW0 = distance(wizard[0],snaffle[0]);
        shortDistanceW1 = distance(wizard[1],snaffle[0]);

    } else {

        var snaffleW0 = []; //Store the index of each Snaffle, we will sort them by their distance to Wizard0
        var snaffleW1 = []; //Store the index of each Snaffle, we will sort them by their distance to Wizard1
        var snaffleDistanceW0 = []; //Array to store the distance of each Snaffle to Wizard0
        var snaffleDistanceW1 = []; //Array to store the distance of each Snaffle to Wizard1
        var distanceTempW0;
        var distanceTempW1;
        for (var i = 0; i < snaffle.length; i++){
            distanceTempW0 = distance(wizard[0], snaffle[i]);
            distanceTempW1 = distance(wizard[1], snaffle[i]);
            snaffleDistanceW0.push(distanceTempW0);
            snaffleW0.push(i);
            snaffleDistanceW1.push(distanceTempW1);
            snaffleW1.push(i);
        }

        snaffleW0.sort(function (a,b) {return snaffleDistanceW0[a] - snaffleDistanceW0[b];}); //sort the snaffleW0 by distance (nearest Snaffle to Wizard0 first)
        snaffleW1.sort(function (a,b) {return snaffleDistanceW1[a] - snaffleDistanceW1[b];}); //sort the snaffleW1 by distance (nearest Snaffle to Wizard1 first)

        //We want Wizard0 to ignore the Snaffles that are closer to Wizard1, so we remove them from his array (same for Wizard1)
        for(var i = snaffle.length - 1; i >= 0; i--) {
            if(distance(wizard[1],snaffle[snaffleW0[i]]) < distance(wizard[0],snaffle[snaffleW0[i]])) {
                snaffleW0.splice(i, 1);
            }
        
            if(distance(wizard[1],snaffle[snaffleW1[i]]) > distance(wizard[0],snaffle[snaffleW1[i]])) {
                snaffleW1.splice(i, 1);
            }
        }

        if (snaffleW0.length == 0){ //if Wizard0 has no Snaffles to target, make him target the last of the Wizard1
            snaffleW0.push(snaffleW1[snaffleW1.length - 1]);
        }

        if (snaffleW1.length == 0){ //if Wizard1 has no Snaffles to target, make him target the last of the Wizard0
            snaffleW1.push(snaffleW0[snaffleW0.length - 1]);
        }

        if (snaffleW0[0] == snaffleW1[0]){ //Both Wizards target the same Snaffle, one of them needs to change to the 2nd choice, let's find the minimum distance as a team

            if (snaffleW0.length == 1){ //Note: both snaffleW0 and snaffleW1 cannot be single at the same time
                nearestSnaffleW0 = snaffleW0[0];
                nearestSnaffleW1 = snaffleW1[1];
            } else if (snaffleW1.length == 1){
                nearestSnaffleW0 = snaffleW0[1];
                nearestSnaffleW1 = snaffleW1[0];

            } else if ((snaffleDistanceW0[snaffleW0[0]] + snaffleDistanceW1[snaffleW1[1]]) < (snaffleDistanceW0[snaffleW0[1]] + snaffleDistanceW1[snaffleW1[0]])){
                nearestSnaffleW0 = snaffleW0[0];
                nearestSnaffleW1 = snaffleW1[1];
            } else {
                nearestSnaffleW0 = snaffleW0[1];
                nearestSnaffleW1 = snaffleW1[0];
            }

        } else { //The two wizards target different Snaffles
            nearestSnaffleW0 = snaffleW0[0];
            nearestSnaffleW1 = snaffleW1[0];
            shortDistanceW0 = distance(wizard[0],snaffle[nearestSnaffleW0]);
            shortDistanceW1 = distance(wizard[1],snaffle[nearestSnaffleW1]);
        }

    }

    /// check if a Snaffle is threatening our Goal
    var threateningSnaffleIndex = -1;
    for (var i = 0; i < snaffle.length; i++){
        
        if (isThreatening(snaffle[i])){
            threateningSnaffleIndex = -1;
        }
    }

    bludgerW0 = -1;
    bludgerW1 = -1;
    /// Chek if a Bludger is theatening a Wizard ///
    for (var i = 0; i < bludger.length; i++){
        if (distance(wizard[0],bludger[i]) < 800 && isInFront(wizard[0],bludger[i])){
            bludgerW0 = i;
        }

        if (distance(wizard[1],bludger[i]) < 800 && isInFront(wizard[1],bludger[i])){
            bludgerW1 = i;
        }

    }

    /////////////////////   Wizard0 ////////////////////////
    if (wizard[0][5] == 1){ //If Wizard0 holds a snaffle then Throw
        if (isInShootableZone(wizard[0])){
            commandW0 = 'THROW ' + goalCenter[1] + ' ' + goalCenter[2] + ' ' + 500;
        } else {
            commandW0 = 'THROW ' + safeCenter[1] + ' ' + safeCenter[2] + ' ' + 500;
        }
        
    } else if(bludgerW0 >= 0 && magicGauge >= 5){
        commandW0 = 'OBLIVIATE '+ bludger[bludgerW0][0];
        magicGauge -= 5;

    } else if (W0didAccio){
        commandW0 = 'MOVE ' + goalCenter[1] + ' ' + goalCenter[2] + ' ' + 150;
        W0didAccio = false;
    } else if (threateningSnaffleIndex >= 0 && isDefendable() && magicGauge >= 10){
        commandW0 = 'PETRIFICUS '+ snaffle[threateningSnaffleIndex][0];
        magicGauge -= 10;
        threateningSnaffleIndex = -1;
    } else { 
        //If the Snaffle in front then try FLIPENDO, if behind then try ACCIO
        if (isInFront(wizard[0],snaffle[nearestSnaffleW0])){
            
            var hasShoot = canShoot(wizard[0],snaffle[nearestSnaffleW0]);

            if (hasShoot && magicGauge >= 20){
                commandW0 = 'FLIPENDO ' + snaffle[nearestSnaffleW0][0];
                magicGauge -= 20;
            } else {
                commandW0 = 'MOVE ' + snaffle[nearestSnaffleW0][1] + ' ' + snaffle[nearestSnaffleW0][2] + ' ' + 150;
            }
        } else { //the Snaffle is behind
            if (magicGauge >= 20 && shortDistanceW0 < 4000){
                commandW0 = 'ACCIO ' + snaffle[nearestSnaffleW0][0];
                magicGauge -= 20;
                W0didAccio = true;
            } else {
                commandW0 = 'MOVE ' + snaffle[nearestSnaffleW0][1] + ' ' + snaffle[nearestSnaffleW0][2] + ' ' + 150;
            }
        }
    }    

    /////////////////////   Wizard1 ////////////////////////
    //If Wizard1 holds a snaffle then Throw, otherwize Move to nearest Snaffle or use magic
    if (wizard[1][5] == 1){
        if (isInShootableZone(wizard[1])){
            commandW1 = 'THROW ' + goalCenter[1] + ' ' + goalCenter[2] + ' ' + 500;
        } else {
            commandW1 = 'THROW ' + safeCenter[1] + ' ' + safeCenter[2] + ' ' + 500;
        }

    } else if(bludgerW1 >= 0 && magicGauge >= 5){
        commandW1 = 'OBLIVIATE '+ bludger[bludgerW1][0];
        magicGauge -= 5;
    } else if (W1didAccio){
        commandW1 = 'MOVE ' + goalCenter[1] + ' ' + goalCenter[2] + ' ' + 150;
        W1didAccio = false;
    } else if (threateningSnaffleIndex >= 0 && isDefendable() && magicGauge >= 10){
        commandW1 = 'PETRIFICUS '+ snaffle[threateningSnaffleIndex][0];
        magicGauge -= 10;
        threateningSnaffleIndex = -1;

    } else {   
        //If the Snaffle is in front then try to FLIPENDO, if behind then try to ACCIO
        if (isInFront(wizard[1],snaffle[nearestSnaffleW1])){

            var hasShoot = canShoot(wizard[1],snaffle[nearestSnaffleW1]);

            if (hasShoot && magicGauge >= 20){
                commandW1 = 'FLIPENDO ' + snaffle[nearestSnaffleW1][0];
                magicGauge -= 20;
            } else {
                commandW1 = 'MOVE ' + snaffle[nearestSnaffleW1][1] + ' ' + snaffle[nearestSnaffleW1][2] + ' ' + 150;
            }
        } else { //the Snaffle is behind
            if (magicGauge >= 20 && shortDistanceW1 < 4000){
                commandW1 = 'ACCIO ' + snaffle[nearestSnaffleW1][0];
                magicGauge -= 20;
                W1didAccio = true;
            } else {
                commandW1 = 'MOVE ' + snaffle[nearestSnaffleW1][1] + ' ' + snaffle[nearestSnaffleW1][2] + ' ' + 150;
            }
        }
    }

    commandW0 = snaffleW0;
    commandW1= snaffleW1;

    magicGauge += 2;
    print(commandW0);
    print(commandW1);
}