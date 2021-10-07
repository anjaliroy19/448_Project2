/**
 * @desc This function runs the main gameplay loop, we allow it to access and modify global game data
 */
function gameplayLoop() {
    if (g_mode == "start" && g_opponent == "human") {
        if (g_currentPlayer == 1) {
            renderPlacementScreen(g_context, g_canvas, placeShip(g_player1arr, g_mousePos, g_currShipLength, g_currShipRotation));
            if (g_currShipLength > g_maxShips) {
                switchPlayers("start");
                g_currShipLength = 1;
                g_currShipRotation = 0;
                g_mousePos = 0;
            }
        }
        else if (g_currentPlayer == 2) {
            renderPlacementScreen(g_context, g_canvas, placeShip(g_player2arr, g_mousePos, g_currShipLength, g_currShipRotation));
            if (g_currShipLength > g_maxShips) {
                switchPlayers("game");
            }
        }
    }
    if (g_mode == "start" && g_opponent == "hard") {
        if (AI == 1){
            if (g_currentPlayer == 1) {
                renderPlacementScreen(g_context, g_canvas, placeShip(g_player1arr, g_mousePos, g_currShipLength, g_currShipRotation));
                if (g_currShipLength > g_maxShips) {
                    switchPlayers("start");
                    g_currShipLength = 1;
                    g_currShipRotation = 0;
                    g_mousePos = 0;
                }
            }
            else if (g_currentPlayer == 2){
                //generate randomPos and rotation (plus check that Ship length is updating)
                let AIpos = generateRandomPosition();
                placeShip(g_player2arr, AIpos, g_currShipLength, g_currShipRotation);
                if (g_currShipLength > g_maxShips) {
                    switchPlayers("game");
                }
            }
        }
        else{
            if (g_currentPlayer == 1) {
                renderPlacementScreen(g_context, g_canvas, placeShip(g_player1arr, g_mousePos, g_currShipLength, g_currShipRotation));
                if (g_currShipLength > g_maxShips) {
                    switchPlayers("start");
                    g_currShipLength = 1;
                    g_currShipRotation = 0;
                    g_mousePos = 0;
                }
            }
            else if (g_currentPlayer == 2) {
                renderPlacementScreen(g_context, g_canvas, placeShip(g_player2arr, g_mousePos, g_currShipLength, g_currShipRotation));
                if (g_currShipLength > g_maxShips) {
                    switchPlayers("game");
                }
            }
        }
    }
    else if(g_mode == "menu1"){
        renderMenu1(g_context, g_canvas);
    }
    else if(g_mode == "menu2"){
        renderMenu2(g_context, g_canvas);
    }
    else if (g_mode == "game" || g_mode == "switch2") {
        if (g_currentPlayer == 1) {
            renderGameplay(g_context, g_canvas, g_player1arr, g_player2arr);
        }
        else {
            renderGameplay(g_context, g_canvas, g_player2arr, g_player1arr);
        }
    }
    else if (g_mode == "win") {
        gameOver(g_context, g_canvas, g_winner);
    }
    else if (g_mode == "unstarted") {
        renderStartScreen(g_context, g_canvas);
    }
    window.requestAnimationFrame(gameplayLoop);
}

/**
 * @desc This function runs the switching screen, we allow it to access and modify global game data
 * @param {string} mode tells the function what the next mode is
 */
function switchPlayers(mode) {
    if (g_mode == "game" && mode == "game") {
        g_mode = "switch2";
    } else {
        g_mode = "switch1";
    }
    let waitToSwitch = new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, 2000);
    });
    let finishSwitch = new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, 5000);
    });
    waitToSwitch.then(() => {
        g_mode = "switch1";
        if (g_currentPlayer == 1) {
            switchTurn(g_context, g_canvas, 2);
            g_currentPlayer = 2;
        } else {
            switchTurn(g_context, g_canvas, 1);
            g_currentPlayer = 1;
        }
    });
    finishSwitch.then(() => {
        g_mode = mode;
    });
}

function generateRandomPosition(){
    let AIpos = 0;
    AIpos = Math.random() * 89; //generates random num betwene 0 and 89
    AIpos = parseInt(AIpos);
    console.log(AIpos);// for debugging purposes
    newShips = placeShip(g_player2arr, AIpos, g_currShipLength, g_currShipRotation); //taken from gage's code
    if (!newShips.every((el, ix) => el === g_player2arr[ix])) { //taken from gage's code
        g_player2arr = newShips;
        g_currShipLength++;
    }

    return AIpos;
}

/**
 * @desc This function checks if a shot is valid
 * @param {number[]} arr the grid being fired at
 * @param {number} pos the position being fired at
 * @returns {boolean} whether the position is valid
 */
 function fire(arr, pos) {
	
	//Get value stored where shot was placed
    if (arr[pos] == 1 || arr[pos] == 2 || arr[pos] == 3 || arr[pos] == 4 || arr[pos] == 5 || arr[pos] == 6) { //only executes if un-hit ship is detected
        arr[pos] = 7;
        return true;
    } else if (arr[pos] == 0) { //executes if uninteracted cell is detected
        arr[pos] = 8;
        return true;
    }
    return false;
}

function fireHard(arr) {
	for(let i = 0; i < arr.length; i++){
        if(arr[i] == 1 || arr[i] == 2 || arr[i] == 3 || arr[i] == 4 || arr[i] == 5 || arr[i] == 6){
            arr[i] = 7;
            console.log('hit');
            return true;
        }
    }
}

/**
 * @desc This function places ships
 * @param {number[]} arr the grid the ship is being placed on
 * @param {number} pos the position that a ship is being placed
 * @param {number} shipLength the length of the ship
 * @param {number} shipRotation the rotation of the ship (0=horz, 1=vert)
 * @returns {number[]} updated grid
 */
 function placeShip(arr, pos, shipLength, shipRotation) {
    let newArr = [...arr]; //make copy of array instead of using original, needed due to pass by reference
    if(shipRotation == 0 && unflattenY(pos) == unflattenY(pos + shipLength - 1))
    {
        for(let i = pos; i < pos + shipLength; i++)
        {
            if (newArr[i] == 1 || newArr[i] == 2 || newArr[i] == 3 || newArr[i] == 4 || newArr[i] == 5 || newArr[i] == 6 ) {
                return [...arr];
            }
            newArr[i] = shipLength;
        }
    }
    else if (shipRotation == 1 && (pos + (shipLength - 1)*10) <= 89) {
        for(let i = pos; i < pos + shipLength * 10; i+=10)
        {
            if (newArr[i] == 1 || newArr[i] == 2 || newArr[i] == 3 || newArr[i] == 4 || newArr[i] == 5 || newArr[i] == 6) {
                return [...arr];
            }
            newArr[i] = shipLength;
        }
    }

	return newArr;
}

/**
 * @desc This function checks to see if the game has a winner
 * @param {number[]} arr grid to check win
 * @return {boolean} whether the game is won or not
 *
 */
 function winCheck(arr) {

    //If player 1's turn, checks if any ships remaining on player 2's board
    if (!arr.includes(1) && !arr.includes(2) && !arr.includes(3) && !arr.includes(4) && !arr.includes(5) && !arr.includes(6))
    {
        return true;
    }
    return false;
}
