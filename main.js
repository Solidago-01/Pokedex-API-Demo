
const apiURL = "https://pokeapi.co/api/v2/pokemon/";

// Pokedex Functions
function updateScreen(data) {
    const pokemonSprite = data.sprites.front_default;
    const imgElement = document.getElementById("pokemonSprite");
    imgElement.src = pokemonSprite;
    imgElement.style.display = "block";

    const pokemonNumber = data.id;
    document.getElementById("pokemonNumber").innerHTML = `number: ${pokemonNumber}`;
    
    const pokemonDisplayName = data.name;
    document.getElementById("pokemonDisplayName").innerHTML = `name: ${pokemonDisplayName}`;
    
    const pokemonHeight = data.height;
    document.getElementById("pokemonHeight").innerHTML = `height: ${pokemonHeight}`;
    
    const pokemonMove1 = data.moves[0].move['name'];
    const pokemonMove2 = data.moves[1].move['name'];
    const pokemonMove3 = data.moves[2].move['name'];
    document.getElementById("pokemonMoves1").innerHTML = `moves: ${pokemonMove1},`;
    document.getElementById("pokemonMoves2").innerHTML = `${pokemonMove2}, ${pokemonMove3}`;

    const pokemonType = data.types[0].type['name'];
    document.getElementById("pokemonType").innerHTML = `type: ${pokemonType}`;
    
    // Reset input field to blank
    document.getElementById("pokemonName").value = "";

    // update number tracker
    // disabled to investigate bug
    // document.getElementById("numberTracker").innerHTML = pokemonNumber;
}

async function requestPokemonData(inputType = undefined) {
    
    // Select search method
    if (inputType == undefined) {
        // Will fetch json with the user-entered name
        var pokemonSearchMethod = document.getElementById("pokemonName").value.toLowerCase();
        var needsNumberUpdate = true;
    } else {
        // Will fetch json with the current pokemon number/index
        var pokemonSearchMethod = inputType;
    }

    // Check for cry button press
    if (inputType == "cry") {
        // If cry, set var cry to true and reuse existing pokemon number
        var cry = true;
        pokemonSearchMethod = document.getElementById("numberTracker").innerHTML;
    } else {
        var cry = false;
    }

    try {
        
        var neededData = `${apiURL}${pokemonSearchMethod}`;

        if (caches.has(neededData)) {
            console.log("this already exists in cache");
            let cachedData = JSON.parse(localStorage.getItem(neededData));
            
            // checking cache is not null or invalid
            if (cachedData) {
                console.log("this is cached data:");
                console.log(cachedData);
                var data = cachedData;
                console.log(`cached data id is: ${data.id}`);
                console.log(`current number tracker is ${document.getElementById("numberTracker").innerHTML}`);

                if (data.id == document.getElementById("numberTracker").innerHTML) {
                    console.log("numbers match");
                    // do nothing
                } else {
                    console.log("data id does not match number tracker. Possibly invalid cache. fetch new data");
                    const response = await fetch(neededData)
                    if(!response.ok) {
                        throw new Error("Could not fetch resource");
                    }
                    var data = await response.json();
                    console.log("No cache found. This is fresh data:");
                    console.log(data);
                    // Try to cache data
                    tryCache(data);
                }

            } else {
                console.log("existing data might be null");
                const response = await fetch(neededData)
                if(!response.ok) {
                    throw new Error("Could not fetch resource");
                }
                var data = await response.json();
                console.log("No cache found. This is fresh data:");
                console.log(data);
                // Try to cache data
                tryCache(data);
            }

        } else {
            // Fetch data using specified search method (either name or number)
            const response = await fetch(neededData)
            if(!response.ok) {
                throw new Error("Could not fetch resource");
            }
            var data = await response.json();
            console.log("this is fresh data:");
            console.log(data);

            // Try to cache data
            tryCache(data);
        }

        // Play cry if true
        if (cry) {
            var cryAudioFile = new Audio(data.cries['latest']);
            // var cryAudioFile = data.cries['latest'];
            cryAudioFile.play();   
        }

        // update number tracker if true
        if (needsNumberUpdate) {
            document.getElementById("numberTracker").innerHTML = data.id;
            console.log("attempted to update number");
        }
        
        // Sends either the cached or newly fetched data
        //  to the updateScreen function
        updateScreen(data);
    
    }
    catch(error){
        console.error(error);
    }
}

function eventHandler(event = undefined){

    if (event == "up") {
        const numberTracker = Number(document.getElementById("numberTracker").innerHTML);

        if (numberTracker > 1024) {
            // Do nothing if number exceeds number of all total pokemon     
        } else {
            // Run request with incremented number
            const newNumber = numberTracker + 1;
            document.getElementById("numberTracker").innerHTML = newNumber;
            // RequestPokemonByNumber(newNumber);
            requestPokemonData(newNumber);
        }

    } else if (event == "down") {
        const numberTracker = Number(document.getElementById("numberTracker").innerHTML);
        console.log(`current number tracker is ${numberTracker}`);
        
        if (numberTracker < 2) {
            // Do nothing
            return;
        } else {
            // Run request with decremented number
            const newNumber = numberTracker - 1;
            document.getElementById("numberTracker").innerHTML = newNumber;
            console.log(`decremented number is now ${numberTracker}`);
            // requestPokemonByNumber(newNumber);
            requestPokemonData(newNumber);
        }

    } else if (event == "cry") {
        // Will trigger cry sound to play
        requestPokemonData("cry");
    } else {
        // Will request pokemon by name
        requestPokemonData();
    }

}

// Receive User Input
function buttonUp () {
    // Initiate logic for search with number increment
    eventHandler("up");
}
function buttonDown () {
    // Initiate logic for search with number decrement
    console.log("down button pressed");
    eventHandler("down");
}
function playCry () {
    // Initiate logic for sound effect "play cry"
    eventHandler("cry");
}


// Cache json responses to local storage
function tryCache(data) {
    currentNum = document.getElementById("numberTracker").innerHTML;
    var tryURL = `https://pokeapi.co/api/v2/pokemon/${currentNum}`;
    try {
        localStorage.setItem(tryURL, JSON.stringify(data));
    } catch (error) {
        return;
    }
}

// fetch json responses from local storage
// function tryGetCache() {
//     currentNum = document.getElementById("numberTracker").innerHTML;
//     var tryURL = `https://pokeapi.co/api/v2/pokemon/${currentNum}`;
//     let cachedData = JSON.parse(localStorage.getItem(tryURL));
//     console.log("this is cached data:");
//     console.log(cachedData);
// }