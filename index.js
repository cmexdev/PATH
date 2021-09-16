const colors = require('colors')
const boxen = require('boxen')
const fs = require('fs')
const dec = new TextDecoder('utf-8')
const term = require('terminal-kit').terminal
const jason = require('ezjason')
const package = jason.read('package.json')
const fetch = require('node-fetch')
const dns = require('dns')
const http = require('http')
const open = require('opn')
const termhistory = []

// COMMENTS
//! ALERT
//TODO TODO
//* HIGHLIGHTED
//// STRICKED OUT

console.log('PATH is starting!'.bgBlue.white)

//Set global variables for usage
const player = {}
player.inventory = []
player.discovered = {
    biomes: [],
    items: []
}
player.level = 0

//Define inventory methods
const inventory = {
    //has: checking to see if inventory has certain item
    has: function invenHas(item) {
        if (player.inventory == []) {
            return undefined
        }
        else {
            var a = 0
            player.inventory.forEach(el => {
                if (el.id == item) {
                    a = el
                }
            })

            if (a != 0) {
                return [true, a.amount]
            }
            else {
                return [false, 0]
            }
        }
    },
    //hasType: checking to see if inventory has certain item type
    hasType: function invenHasType(itemtype) {
        if (player.inventory == []) {
            return undefined
        }
        else {
            var a = []
            player.inventory.forEach(el => {
                if (gamedata.items.items[el.id].type == itemtype) {
                    var h = [el.id, el.amount, gamedata.items.items[el.id].strength]
                    a.push(h)
                }
            })

            if (a != []) {
                return [true, a]
            }
            else {
                return [false, []]
            }
        }
    },
    //Remove empty items
    clean: function cleanInventory() {
        for (let i = 0; i < player.inventory.length; i++) {
            const el = player.inventory[i]
            //Check to see if it's less than or equal to 0
            //Less than shouldn't happen, but it's good to have it
            if (el.amount <= 0) {
                player.inventory.splice(i, 1)
            }
        }

        //Find and fix broken amounts
        for (let i = 0; i < player.inventory.length; i++) {
            const el = player.inventory[i]
            
            //Check to see if it is broken
            if (typeof el.amount === 'string') {
                var finalArray = []
                el.amount.split('-').forEach(amountSplit => {
                    var j = amountSplit.split('')
                    var total = 0
                    j.forEach(num => {
                        total += parseFloat(num)
                    })
                    finalArray.push(total)
                })
                var finalString = finalArray.join(' - ')
                player.inventory[i].amount = parseFloat(eval(finalString))
            }
        }
    }
}

//Set default menu options
const menuOptions = {
    selectedStyle: term.bgBlue.white,
    submittedStyle: term.bgBlue.white,
    cancelable: false,
}

//Allow for exiting with simple function call (w/ code)
function exit(code) {
    process.exit(code)
}

//Set gamedata
const gamedata = {}
gamedata.items = jason.read('game\\items.json')
gamedata.levels = jason.read('game\\levels.json')
gamedata.spawning = jason.read('game\\spawning.json')
gamedata.mob = jason.read('game\\mob.json')
gamedata.chest = jason.read('game\\chest.json')
gamedata.state = []
gamedata.commands = jason.read('game\\commands.json')
gamedata.usage = jason.read('game\\commandsusage.json')

//set gamefile
var gamefile = {}

//err function
function err(errtext) {
    console.log(boxen('[!] '.red + errtext, {
        padding: 1,
        borderStyle: 'round',
        borderColor: 'red',
        margin: 1
    }))
}

//success function
function good(text) {
    console.log(boxen(text, {
        padding: 1,
        margin: 1,
        borderColor: 'green'
    }))
}

//Usage box function
function u() {
    console.log(boxen('== USAGE ==', {
        borderStyle: 'classic',
        padding: 1
    }))
}

//level up function
function levelUp(text) {
    console.log(boxen('LEVEL UP '.green + text, {
        padding: 1,
        borderStyle: 'classic',
        borderColor: 'green'
    }))
}

//Return an error with provided code
function code(code) {
    console.log('Error code: ' + code)
}

//! this is the function that gets called on load
//pre checks the internet and update
//main menu simply returns to the main menu
pre()

function pre() {
    //check connection
    console.log('Checking internet connection...'.magenta)
    dns.resolve('www.google.com', function (e) {
        if (e) {
            console.log('An error occured while trying to check for updates...'.bgRed.white)
            err(e)
            console.log('Failed to check for updates. (check your internet connection and try again later)')
            code('pre=>internetfail')
            term.singleLineMenu(['Continue'], function (e, r) {
                if (e) {
                    err(e)
                    code('pre=>internetfail=>menufail')
                }
                else {
                    return mainMenu()
                }
            })
        }
        else {
            fetch('https://raw.githubusercontent.com/cmexdev/PATH/main/package.json', { method: 'Get' }).then(res => res.json()).then((json) => {
                if (json.version == package.version) {
                    good('Using current version of PATH!')
                    return mainMenu()
                }
                else {
                    good('There is an updated version of PATH available!')
                    term.singleLineMenu(['Update now', 'Cancel'], function (e, r) {
                        if (e) {
                            err(e)
                            code('pre=>internetsuccess=>menufail')
                        }
                        else {
                            if (r.selectedIndex == 1) {
                                return mainMenu()
                            }
                            else if (r.selectedIndex == 0) {
                                var filename = 'install-' + json.version + '.exe'
                                const install = fs.createWriteStream(filename)
                                const request = http.get('http://i3.ytimg.com/vi/J---aiyznGQ/mqdefault.jpg', function (r) {
                                    r.pipe(install)
                                })
                            }
                        }
                    })
                }
            })
        }
    })
}

//main menu function
function mainMenu(preinfo) {
    console.clear()
    if (preinfo) {
        console.log(preinfo)
        code('startloaded=>badgame')
    }
    console.log(boxen('PATH'.underline + ': ' + '<INSERT FUNNY TEXT>'.rainbow, {
        borderColor: 'yellow',
        padding: 2,
        borderStyle: 'round',
        margin: 2,
        float: 'center'
    }))

    //INIT PHASE
    console.log('Welcome to ' + 'PATH'.underline + '! ' + 'Select an option below to continue.'.gray)

    term.singleRowMenu(['Start a new game', 'Load a saved game', 'Options', 'Exit'.bgRed], menuOptions, function (e, r) {
        if (e) {
            err(e)
            code('main=>menufail')
        }
        else {
            if (r.selectedIndex == 0) {
                //START NEW GAME
                console.clear()
                return newGame()
            }
            else if (r.selectedIndex == 1) {
                //LOAD EXISTING GAME
                return loadGame()
            }
            else if (r.selectedIndex == 2) {
                return options('frommenu')
            }
            else if (r.selectedIndex == 3) {
                console.clear()
                console.log('See ya!'.cyan + ' PATH Version '.grey + package.version.toString().cyan)
                process.exit()
            }
        }
    })
}

//handle creation of new game
function newGame() {
    //THIS FUNCTION WILL DEAL WITH CREATING A NEW GAME FILE(S) AND CHECKING IF IT ALREADY EXISTS
    console.log(boxen('Create a new game', {
        padding: 1,
        borderStyle: 'round'
    }))

    console.log('What should we call this game? '.cyan)
    term.inputField({
        cancelable: true
    }, function (e, userInput) {
        if (e) {
            err(e)
            code('newgame=>name')
        }
        else {
            //check to see if user canceled
            if (userInput == undefined) {
                return mainMenu()
            }
            else {
                //CHECK TO SEE IF GAME EXISTS
                var games = fs.readdirSync('game\\games\\')

                var invalidName = 0

                games.forEach(game => {
                    if (game == userInput || userInput.includes('\\') || userInput.includes('/') || userInput.includes('&') || userInput == 'con' || userInput == 'aux') {
                        invalidName++
                    }
                })

                if (invalidName > 0) {
                    //Gamefile already exists (do not overwrite existing files)
                    console.clear()
                    err('Invalid game name!')
                    code('newgame=>invalidname')
                    return newGame()
                }
                else {
                    //Gamefile does not already exist
                    return createValidGame(userInput)
                }
            }
        }
    })
}

//create files for new game
function createValidGame(name) {
    //The JSON file will be created later
    console.log('Creating game: ' + name)

    fs.mkdirSync('game\\games\\' + name)

    return loadEmptyGame(name)
}

//load a saved game
function loadGame() {
    console.clear()
    //Start list with 'Cancel' option
    var gamesList = ['Cancel']
    var gamesFolder = fs.readdirSync('game\\games\\')
    gamesFolder.forEach(game => {
        gamesList.push(game)
    })

    console.log(boxen('Choose a game below', {
        padding: 1,
        borderStyle: 'round'
    }))

    term.singleColumnMenu(gamesList, menuOptions, function(e, r) {
        if (e) {
            err(e)
            code('loadgame=>name')
        }
        else {
            if (r.selectedIndex == 0) {
                //If user canceled, return to main menu
                return mainMenu()
            }
            else {
                //Otherwise, alert of selected game and start loading the game
                console.log('\n\nSelecting game: ', r.selectedText.underline.green)

                //Case sensitive
                gamedata.currentgame = r.selectedText
                return startLoadedGame(r.selectedText)
            }
        }
    })
}

//load a game that has no data
function loadEmptyGame(name) {
    //Create an empty gamefile then write it
    var emptyGamedata = {
        name: name,
        enviro: [],
        player: {
            level: 0,
            inventory: []
        },
        discovered: {
            biomes: [],
            items: []
        }
    }
    fs.writeFileSync('game\\games\\' + name + '\\game.json', JSON.stringify(emptyGamedata))

    //Update current game and player details
    gamedata.currentgame = name
    player.level = 0
    player.inventory = []
    player.discovered = {
        biomes: [],
        items: []
    }

    return game('randomgen')
}

//start a game from saved state
function startLoadedGame(name) {
    //Try to open game, if not return to main menu with error message
    try {
        gamefile = jason.read('game\\games\\' + name + '\\game.json')

        player.level = gamefile.player.level
        player.inventory = gamefile.player.inventory
        player.discovered = gamefile.discovered

        if (gamefile.gamestate[0] == 'enviro') {
            return game('loadfromsaved', gamefile.enviro[0], gamefile.enviro[1], true)
        }
        else if (gamefile.gamestate[0] == 'mob') {
            return spawn(gamefile.gamestate[3], name, 'spawncontinue', gamefile.gamestate[1], gamefile.gamestate[2])
        }
    } catch (e) {
        var p = 'Bad or corrupted game file!'.bgRed.white + '\nError data: ' + JSON.stringify(e).gray
        return mainMenu(p)
    }
}

function game(task, game, enviroid, ignorechests) {
    console.clear()

    //* requires 'task'
    if (task == 'randomgen') {
        var lengthOfEnvironments = fs.readdirSync('game\\environments\\').length
        var environments = fs.readdirSync('game\\environments\\')
        var randomNumber = Math.floor(Math.random() * lengthOfEnvironments)

        const environment = environments[randomNumber]
        const environmentName = environment.split('.json')[0]
        const environmentData = jason.read('game\\environments\\' + environment)

        var lengthOfEvironmentVariants = environmentData.variants.length
        var randomNumber = Math.floor(Math.random() * lengthOfEvironmentVariants)

        const environmentVariant = environmentData.variants[randomNumber]

        gamedata.state = ['enviro', environment.split('.json')[0], environmentVariant.id]

        saveGame(environmentName, environmentVariant.id, gamedata.currentgame, player.inventory, player.level, player.discovered, gamedata.state)

        console.log(boxen(environmentVariant.message, {
            padding: 1,
            borderStyle: 'round',
            borderColor: 'gray'
        }))

        var options = []
        var arr = 0

        environmentVariant.options.forEach(currentOption => {
            arr++
            options.push(currentOption.title)
        })

        //Add the 'More options' button
        options.push('More options')

        term.singleColumnMenu(options, menuOptions, function (e, selectedOption) {
            if (e) {
                err(e)
                code('game=>randomgen=>menufail')
            }
            else {
                if (selectedOption.selectedIndex != 3) {
                    action(environmentVariant.options[selectedOption.selectedIndex].action)
                }
                else {
                    action('show:options')
                }
            }
        })
    }
    //* requires 'task', 'game', 'ignorechests'
    else if (task == 'loadenviro') {

        //GAME SHOULD BE SAVED

        const environment = game

        const environmentData = jason.read('game\\environments\\' + environment + '.json')

        //Get random variant
        var lengthOfEvironmentVariants = environmentData.variants.length
        var randomNumber = Math.floor(Math.random() * lengthOfEvironmentVariants)

        //Variant
        const environmentVariant = environmentData.variants[randomNumber]

        gamedata.state = ['enviro', environment, environmentVariant.id]

        var playerDiscoveredBiome = 0

        player.discovered.biomes.forEach(el => {
            if (el == environment) {
                playerDiscoveredBiome++
            }
        })

        if (playerDiscoveredBiome == 0) {
            //player has not discovered biome
            levelUp('You discovered a new biome! (' + environment + ')')
            player.discovered.biomes.push(environment)
            player.level += gamedata.levels.biomes[environment]
        }

        saveGame(environment, environmentVariant.id, gamedata.currentgame, player.inventory, player.level, player.discovered, gamedata.state)

        //SPAWN MONSTER?
        var spawnMonster = 0
        gamedata.spawning.monster.biome.forEach(el => {
            if (el == environment) {
                if (player.level > gamedata.spawning.monster.level - 1) {
                    if (Math.floor(Math.random() * 10) == 6) {
                        spawnMonster++
                    }
                }
            }
        })

        if (spawnMonster > 0) {
            return spawn('monster', gamedata.currentgame, 'spawnrandom', null, [environment, environmentVariant.id])
        }

        if (ignorechests != true) {
            return chestInit(gamedata.currentgame, gamedata.state)
        }

        console.log(boxen(environmentVariant.message, {
            padding: 1,
            borderStyle: 'round',
            borderColor: 'gray'
        }))

        var options = []
        var arr = 0

        environmentVariant.options.forEach(el => {
            arr++
            options.push(el.title)
        })

        options.push('More options')

        term.singleColumnMenu(options, menuOptions, function (e, resp) {
            if (e) {
                err(e)
                code('game=>loadenviro=>menufail')
            }
            else {
                if (resp.selectedIndex != 3) {
                    action(environmentVariant.options[resp.selectedIndex].action)
                }
                else {
                    action('show:options')
                }
            }
        })
    }
    //* requires 'task', 'game', 'enviroid'
    else if (task == 'loadfromsaved') {
        const environment = game
        const variantId = enviroid

        gamedata.state = ['enviro', environment, variantId]

        var environmentVariant = ''

        try {
            environmentVariant = jason.read('game\\environments\\' + environment + '.json')
        } catch (er) {
            console.log('An unknown error occured!'.white.bgRed + ' See error details below.'.gray)
            err(er)
            code('game=>loadfromsaved=>unknowngameerr')
            process.exit()
        }

        var index = 0

        //FIND VARIANT THAT HAS ID OF varianid
        for (let i = 0; i < environmentVariant.variants.length; i++) {
            const el = environmentVariant.variants[i];
            if (el.id == variantId) {
                index = i
            }
        }

        const en = environmentVariant.variants[index]

        var playerDiscoveredBiome = 0

        player.discovered.biomes.forEach(el => {
            if (el == environment) {
                playerDiscoveredBiome++
            }
        })

        if (playerDiscoveredBiome == 0) {
            //player has not discovered biome
            levelUp('You discovered a new biome! (' + environment + ')')
            player.discovered.biomes.push(environment)
            player.level += gamedata.levels.biomes[environment]
        }

        saveGame(environment, variantId, gamedata.currentgame, player.inventory, player.level, player.discovered, gamedata.state)

        console.log(boxen(en.message, {
            padding: 1,
            borderColor: 'grey',
            borderStyle: 'round'
        }))

        var options = []
        var arr = 0

        en.options.forEach(el => {
            arr++
            options.push(el.title)
        })

        options.push('More options')

        term.singleColumnMenu(options, menuOptions, function (e, resp) {
            if (e) {
                err(e)
                code('game=>loadfromsaved=>menufail')
            }
            else {
                if (resp.selectedIndex != 3) {
                    action(en.options[resp.selectedIndex].action)
                }
                else {
                    action('show:options')
                }
            }
        })
    }
}

function action(act) {
    if (act == 'show:options') {
        return showOptions(gamedata.currentgame)
    }
    else if (act == 'exit') {
        return exit()
    }
    else if (act == 'mob-runaway') {
        if (rarity('rare') == true) {
            return true
        }
        else {
            return false
        }
    }
    else if (act == 'show:craft') {
        return craft()
    }

    //DECODE ACTION
    var actionSplit = act.split(':')

    var task = actionSplit[0]

    if (task == 'go') {
        if (actionSplit[1].includes('=>') == false) {
            //TODO incomplete??
            return game('loadenviro', actionSplit[1], null, false)
        }
    }
    else if (task == 'take') {
        const itemToTake = actionSplit[1].split('&')[0]
        const amountToTake = actionSplit[1].split('&')[1]
        const amount = new Number(amountToTake).valueOf()

        player.inventory.forEach(item => {
            if (item.id == itemToTake) {
                item.amount -= amount
            }
        })

        inventory.clean()
    }
    else if (task == 'give') {
        if (actionSplit[1].includes('=>') == false) {
            const itemToGive = actionSplit[1].split('&')[0] //* AS itemed
            const amountToTake = actionSplit[1].split('&')[1]
            const amount = new Number(amountToTake).valueOf()
            let float = parseFloat(amount)
            var inventoryHasItem = 0

            player.inventory.forEach(el => {
                if (el.id == itemToGive) {
                    inventoryHasItem++
                    el.amount += float
                }
            })

            if (inventoryHasItem == 0) {
                var playerInventory = {}
                playerInventory.id = itemToGive
                playerInventory.amount = float
                player.inventory.push(playerInventory)
            }
        }
        else {
            var itemtogive = actionSplit[1].split('=>')[0] //* AS itemid
            var callbackaction = actionSplit[1].split('=>')[1] + ':' + actionSplit[2]
            var inventoryHasItem = 0

            player.inventory.forEach(el => {
                if (el.id == itemtogive) {
                    inventoryHasItem++
                    var randomNumber = Math.floor(Math.random() * 10)
                    el.amount += randomNumber
                    if (itemtogive == 'iron') {
                        player.level += randomNumber / 5
                    }
                }
            })

            if (inventoryHasItem == 0) {
                var playerInventory = {}
                playerInventory.id = itemtogive
                var randomNumber = Math.floor(Math.random() * 10)
                playerInventory.amount = randomNumber
                if (itemtogive == 'iron') {
                    player.level += randomNumber / 2
                }
                player.inventory.push(playerInventory)
            }

            return action(callbackaction)
        }
    }
    else {
        err('method not supported @action=>unknown')
        code('action=>unknown')
        process.exit()
    }
}

//FOR DEVELOPMENT PURPOSES
function listItems() {
    const items = jason.read('game\\items.json')

    items.items.forEach(el => {
        console.log(boxen((el.dname).green.underline + (' (' + el.id + ')').gray + '\n\n' + el.desc + '\n\n' + boxen(JSON.stringify(el.properties), {
            margin: 1,
            padding: 1,
            borderStyle: 'round',
        }), {
            padding: 1,
            borderStyle: 'round',
            align: 'center',
            margin: 1,
            float: 'center'
        }))
    })

    process.exit()
}

function saveGame(enviro, envirovarianid, gamename, playerinven, playerlev, discover, gs) {
    var gamedataToSave = {}
    gamedataToSave.name = gamename
    gamedataToSave.enviro = [enviro, envirovarianid]
    gamedataToSave.player = {}
    gamedataToSave.player.level = playerlev
    gamedataToSave.player.inventory = playerinven
    gamedataToSave.discovered = discover
    gamedataToSave.gamestate = gamedata.state

    var gamedataAsString = JSON.stringify(gamedataToSave)

    fs.writeFileSync('game\\games\\' + gamename + '\\game.json', gamedataAsString)

    gamefile = gamedataToSave
}

function showOptions(gamed) {
    const gameData = jason.read('game\\games\\' + gamed + '\\game.json')
    var options = ['Exit to menu', 'View inventory', 'Terminal', 'Cancel']
    console.log('Player level: '.blue + player.level)
    console.log('\nCurrent game: '.blue + gamedata.currentgame)

    term.singleRowMenu(options, function (e, r) {
        if (e) {
            err(e)
            code('showoptions=>menufail')
        }
        else {
            if (r.selectedIndex == 0) {
                console.clear()
                return mainMenu()
            }
            else if (r.selectedIndex == 1) {
                console.clear()

                var inventoryTable = [
                    ['Name', 'Type', 'Description', 'Amount', 'Strength (# of uses)', 'Worth']
                ]

                player.inventory.forEach(el => {
                    var i = gamedata.items.items[el.id]
                    var e = []
                    e[0] = i.dname
                    e[1] = i.type
                    e[2] = '^B' + i.desc
                    e[3] = '^G' + el.amount
                    e[4] = i.strength,
                    e[5] = i.worth + ' per item'
                    inventoryTable.push(e)
                })

                term.table(inventoryTable, {
                    hasBorder: true,
                    borderChars: 'lightRounded',
                    width: term.width,
                    fit: true,
                    borderAttr: {
                        color: 'blue'
                    },
                    textAttr: {
                        color: 'default'
                    },
                    firstCellTextAttr: {
                        bgColor: 'blue'
                    },
                    firstRowTextAttr: {
                        bgColor: 'blue'
                    },
                    firstColumnTextAttr: {
                        bgColor: 'red'
                    },
                    contentHasMarkup: true
                })

                term.singleRowMenu(['Continue', 'Craft', 'Sell'], function (e, r) {
                    if (e) {
                        err(e)
                        //todo add err code
                    }
                    else {
                        if (r.selectedIndex == 0) {
                            if (gameData.gamestate[0] == 'mob') {
                                return spawn(gameData.gamestate[3], gameData.name, 'spawncontinue', gameData.gamestate[1], gameData.gamestate[2])
                            }
                            else if (gameData.gamestate[0] == 'enviro') {
                                return startLoadedGame(gamed)
                            }
                        }
                        else if (r.selectedIndex == 2) {
                            //* show sell menu
                            console.clear()
                            if (player.inventory.length == 0) {
                                err('Nothing to sell!')
                                console.log('Try collecting some items first!'.gray)
                                term.singleLineMenu(['Ok! I will!'], function (e, r) {
                                    if (gameData.gamestate[0] == 'mob') {
                                        return spawn(gameData.gamestate[3], gameData.name, 'spawncontinue', gameData.gamestate[1], gameData.gamestate[2])
                                    }
                                    else if (gameData.gamestate[0] == 'enviro') {
                                        return game('loadfromsaved', gameData.gamestate[1], gameData.gamestate[2])
                                    }
                                })
                            }
                            else {
                                console.log(boxen('Sell items', {
                                    padding: 1,
                                    borderStyle: 'round'
                                }))
                                console.log('Need more levels? Sell your items here!\n\n'.gray + 'Select an option below to get started!'.cyan)

                                var sellingInventoryTable = [
                                    ['Name', 'Amount', 'Strength (# of uses)', 'Worth']
                                ]
                                var sellingInventoryOptions = []
                                var sellReference = {}

                                player.inventory.forEach(el => {
                                    var i = gamedata.items.items[el.id]
                                    var e = []
                                    e[0] = i.dname
                                    e[1] = '^G' + el.amount
                                    e[2] = i.strength
                                    e[3] = i.worth + ' per item'
                                    sellingInventoryTable.push(e)
                                    sellingInventoryOptions.push(i.dname)
                                    sellReference[i.dname] = [el.id, el.amount]
                                })

                                sellingInventoryOptions.push('Cancel'.bgRed)

                                term.table(sellingInventoryTable, {
                                    hasBorder: true,
                                    borderChars: 'lightRounded',
                                    width: term.width,
                                    fit: true,
                                    borderAttr: {
                                        color: 'blue'
                                    },
                                    textAttr: {
                                        color: 'default'
                                    },
                                    firstCellTextAttr: {
                                        bgColor: 'blue'
                                    },
                                    firstRowTextAttr: {
                                        bgColor: 'blue'
                                    },
                                    firstColumnTextAttr: {
                                        bgColor: 'red'
                                    },
                                    contentHasMarkup: true
                                })

                                console.log('Select an item to sell:'.underline)

                                term.singleColumnMenu(sellingInventoryOptions, function (e, r) {
                                    if (e) {
                                        err(e)
                                    }
                                    else {
                                        if (r.selectedIndex == sellingInventoryTable.length - 1) {
                                            if (gameData.gamestate[0] == 'mob') {
                                                return spawn(gameData.gamestate[3], gameData.name, 'spawncontinue', gameData.gamestate[1], gameData.gamestate[2])
                                            }
                                            else if (gameData.gamestate[0] == 'enviro') {
                                                return game('loadfromsaved', gameData.gamestate[1], gameData.gamestate[2])
                                            }
                                        }
                                        else {
                                            const itemid = sellReference[r.selectedText] //* array: 0=itemid, 1=amountofitem
                                            const item = gamedata.items.items[itemid[0]]
                                            const itemworth = item.worth

                                            console.log('\n' + 'What amount to sell?'.bgBlue + ' (' + r.selectedText + ')')

                                            term.singleLineMenu(['All of it', 'Half of it', 'A specific amount', 'Cancel'], function (e, r) {
                                                //! no err handle
                                                if (r.selectedIndex == 0) {
                                                    //* sell all of that item
                                                    var itemtotake = itemid[0]

                                                    player.inventory.forEach(el => {
                                                        if (el.id === itemtotake) {
                                                            el.amount += -itemid[1]
                                                            player.level += itemworth * itemid[1]
                                                        }
                                                    })

                                                    console.log('\n\nYou ' + 'sold'.underline + ' all of your ' + itemtotake.toString().underline + '!')
                                                    console.log('You gained ' + (itemworth * itemid[1]).toString().underline + ' levels!')

                                                    inventory.clean()

                                                    term.singleLineMenu(['OK'], function (e, r) {
                                                        if (gameData.gamestate[0] == 'mob') {
                                                            return spawn(gameData.gamestate[3], gameData.name, 'spawncontinue', gameData.gamestate[1], gameData.gamestate[2])
                                                        }
                                                        else if (gameData.gamestate[0] == 'enviro') {
                                                            return game('loadfromsaved', gameData.gamestate[1], gameData.gamestate[2])
                                                        }
                                                    })
                                                }
                                                else if (r.selectedIndex == 1) {
                                                    //* sell half of that item
                                                    var itemtotake = itemid[0]

                                                    player.inventory.forEach(item => {
                                                        if (item.id === itemtotake) {
                                                            item.amount += -(itemid[1] / 2)
                                                            player.level += itemworth * (itemid[1] / 2)
                                                        }
                                                    })

                                                    console.log('\n\nYou ' + 'sold'.underline + ' half of your ' + itemtotake.toString().underline + '!')
                                                    console.log('You gained ' + (itemworth * (itemid[1] / 2)).toString().underline + ' levels!')

                                                    inventory.clean()

                                                    term.singleLineMenu(['OK'], function (e, r) {
                                                        if (gameData.gamestate[0] == 'mob') {
                                                            return spawn(gameData.gamestate[3], gameData.name, 'spawncontinue', gameData.gamestate[1], gameData.gamestate[2])
                                                        }
                                                        else if (gameData.gamestate[0] == 'enviro') {
                                                            return game('loadfromsaved', gameData.gamestate[1], gameData.gamestate[2])
                                                        }
                                                    })
                                                }
                                                else if (r.selectedIndex == 2) {
                                                    console.clear()
                                                    //* sell a specific amount
                                                    console.log('Enter number to sell.'.cyan + ' Press esc to cancel.'.gray + '\n')
                                                    //! input, check if number, else return to last available menu
                                                    term.inputField({ autoComplete: false, cancelable: true }, function (e, r) {
                                                        if (e) {
                                                            err(e)
                                                            //todo add err code
                                                        }
                                                        else {
                                                            if (r != undefined) {
                                                                var num = new Number(r).valueOf()
                                                                if (num == NaN) {
                                                                    err('Not a number!')
                                                                }
                                                                else {
                                                                    //*sell amount 'num'

                                                                    var itemToTake = itemid[0]

                                                                    player.inventory.forEach(el => {
                                                                        if (el.id === itemToTake) {
                                                                            el.amount += -num
                                                                            player.level += itemworth * num
                                                                        }
                                                                    })

                                                                    console.log('\n\nYou ' + 'sold'.underline + ' ' + num + ' of your ' + itemToTake.toString().underline + '!')
                                                                    console.log('You gained ' + (itemworth * num).toString().underline + ' levels!')

                                                                    inventory.clean()

                                                                    term.singleLineMenu(['OK'], function (e, r) {
                                                                        if (gameData.gamestate[0] == 'mob') {
                                                                            return spawn(gameData.gamestate[3], gameData.name, 'spawncontinue', gameData.gamestate[1], gameData.gamestate[2])
                                                                        }
                                                                        else if (gameData.gamestate[0] == 'enviro') {
                                                                            return game('loadfromsaved', gameData.gamestate[1], gameData.gamestate[2])
                                                                        }
                                                                    })
                                                                }
                                                            }
                                                            else {
                                                                inventory.clean()

                                                                if (gameData.gamestate[0] == 'mob') {
                                                                    return spawn(gameData.gamestate[3], gameData.name, 'spawncontinue', gameData.gamestate[1], gameData.gamestate[2])
                                                                }
                                                                else if (gameData.gamestate[0] == 'enviro') {
                                                                    return game('loadfromsaved', gameData.gamestate[1], gameData.gamestate[2])
                                                                }
                                                            }
                                                        }
                                                    })
                                                }
                                                else if (r.selectedIndex == 3) {
                                                    //! instead of returning to game, return to options menu?
                                                    if (gameData.gamestate[0] == 'mob') {
                                                        return spawn(gameData.gamestate[3], gameData.name, 'spawncontinue', gameData.gamestate[1], gameData.gamestate[2])
                                                    }
                                                    else if (gameData.gamestate[0] == 'enviro') {
                                                        return game('loadfromsaved', gameData.gamestate[1], gameData.gamestate[2])
                                                    }
                                                }
                                            })
                                        }
                                    }
                                })
                            }
                        }
                        else if (r.selectedIndex == 1) {
                            //* show craft menu
                            //! return to craft function
                            return craft(gameData)
                        }
                    }
                })
            }
            //* terminal
            else if (r.selectedIndex == 2) {
                return terminal()
            }
            //* cancel
            else if (r.selectedIndex == 3) {
                if (gameData.gamestate[0] == 'mob') {
                    return spawn(gameData.gamestate[3], gameData.name, 'spawncontinue', gameData.gamestate[1], gameData.gamestate[2])
                }
                else if (gameData.gamestate[0] == 'enviro') {
                    return startLoadedGame(gamed)
                }
            }
        }
    })
}

function spawn(mobtype, gn, task, mob, gamed) {
    if (task == 'spawnrandom') {
        if (mobtype == 'monster') {
            var arr = 0
            var monsterMobList = []
            gamedata.mob.forEach(mob => {
                if (mob.type == 'monster') {
                    monsterMobList.push(mob)
                    arr++
                }
            })
            var randomMonster = monsterMobList[Math.floor(Math.random() * arr)]
            console.log(boxen('A wild ' + randomMonster.name + ' has spawned!', {
                padding: 1,
                margin: 1,
                borderColor: 'redBright'
            }))

            gamedata.state = ['mob', randomMonster.name, gamed, 'monster']

            saveGame(gamefile.enviro[0], gamefile.enviro[1], gamefile.name, gamefile.player.inventory, gamefile.player.level, gamefile.discovered, gamedata.state)

            console.log('Prepare to attack!'.cyan)

            var options = ['Run away', 'Prepare', 'More options']

            term.singleLineMenu(options, function (e, r) {
                if (e) {
                    err(e)
                    code('spawn=>random=>monster')
                }
                else {
                    if (r.selectedIndex == 0) {
                        //run away
                        if (action('mob-runaway') == true) {
                            good('You escaped!')

                            term.singleLineMenu(['Take a breather'], function (e, r) {
                                if (e) {
                                    err(e)
                                    code('spawn=>random=>monster=>runawaymenufail')
                                }
                                else {
                                    if (r.selectedIndex == 0) {
                                        //continue the game
                                        return game('loadfromsaved', gamed[0], gamed[1])
                                    }
                                }
                            })
                        }
                        else {
                            err('You were caught!')
                            console.log('You lost '.cyan + randomMonster.level / 2 + ' levels!'.cyan)
                            player.level += -(randomMonster.level)
                            term.singleLineMenu(['Take a breather'], function (e, r) {
                                if (e) {
                                    err(e)
                                    code('spawn=>random=>monster=>caughtmenufail')
                                }
                                else {
                                    if (r.selectedIndex == 0) {
                                        //continue the game
                                        return game('loadfromsaved', gamed[0], gamed[1])
                                    }
                                }
                            })
                        }
                    }
                    else if (r.selectedIndex == 1) {
                        //prepare
                        var inventoryHasTypeToDefeat = inventory.hasType(randomMonster.defeat[0])
                        if (inventoryHasTypeToDefeat[0] == true) {
                            var itemToDefeatWithName = []
                            var itemToDefeatWith = []
                            inventoryHasTypeToDefeat[1].forEach(item => {
                                var toolStrength = randomMonster.defeat[1].split(':')

                                if (toolStrength[1] >= toolStrength[1]) {
                                    itemToDefeatWithName.push(gamedata.items.items[item[0]].dname)
                                    itemToDefeatWith.push(item[0])
                                }
                            })

                            console.log('\n')
                            console.log('Select which weapon you want to use:'.cyan)

                            if ((itemToDefeatWithName == []) == false) {
                                err('You failed to prepare in time because you didn\'t have the correct materials!')
                                console.log('He gotcha'.gray)
                                //lose levels
                                player.level += -(randomMonster.level)

                                term.singleLineMenu(['Continue'], function (e, r) {
                                    if (e) {
                                        err(e)
                                        code('spawn=>random=>monster=>preparemenufail')
                                    }
                                    else {
                                        return game('loadfromsaved', gamed[0], gamed[1])
                                    }
                                })
                            }
                            else {
                                term.singleColumnMenu(itemToDefeatWithName, function (e, r) {
                                    if (e) {
                                        err(e)
                                        code('spawn=>random=>monster=>prepareokmenufail')
                                    }
                                    else {
                                        //item id
                                        var itemId = itemToDefeatWith[r.selectedIndex]

                                        //rare chance of losing the fight
                                        if (Math.floor(Math.random() * 10) == Math.floor(Math.random() * 10)) {
                                            err('You swung badly and missed the monster!')
                                            console.log('He gotcha'.gray)
                                            //lose levels
                                            player.level += -(randomMonster.level)

                                            term.singleLineMenu(['Continue'], function (e, r) {
                                                if (e) {
                                                    err(e)
                                                    code('spawn=>random=>monster=>prepareok=>menufail')
                                                }
                                                else {
                                                    return game('loadfromsaved', gamed[0], gamed[1])
                                                }
                                            })
                                        }
                                        else {
                                            good('You stabbed him in the throat...and, well the rest is history.')
                                            console.log('Good news is you won!'.gray)

                                            term.singleLineMenu(['Continue'], function (e, r) {
                                                if (e) {
                                                    err(e)
                                                    code('spawn=>random=>monster=>prepareok=>successmenufail')
                                                }
                                                else {
                                                    return game('loadfromsaved', gamed[0], gamed[1])
                                                }
                                            })
                                        }
                                    }
                                })
                            }
                        }
                    }
                    else if (r.selectedIndex == 2) {
                        return showOptions(gn)
                    }
                }
            })
        }
    }
    else if ('spawncontinue') {
        console.clear()
        if (mobtype == 'monster') {
            var randomMonster = {}
            gamedata.mob.forEach(el => {
                if (el.type == 'monster' && el.name == mob) {
                    randomMonster = el
                }
            })

            gamedata.state = ['mob', randomMonster.name, gamed, 'monster']

            console.log(boxen('A wild ' + randomMonster.name + ' has spawned!', {
                borderColor: 'redBright',
                padding: 1,
                margin: 1
            }))

            console.log('Prepare to attack!'.cyan)

            var options = ['rUn aWaY'.bgMagenta, 'Prepare', 'More options']

            term.singleLineMenu(options, function (e, r) {
                if (e) {
                    err(e)
                    code('spawn=>continue=>monster=>menufail')
                }
                else {
                    if (r.selectedIndex == 0) {
                        //run away
                        if (action('mob-runaway') == true) {
                            good('You escaped!')

                            term.singleLineMenu(['Take a breather'], function (e, r) {
                                if (e) {
                                    err(e)
                                    code('spawn=>continue=>monster=>escapemenufail')
                                }
                                else {
                                    if (r.selectedIndex == 0) {
                                        //continue the game
                                        return game('loadfromsaved', gamed[0], gamed[1])
                                    }
                                }
                            })
                        }
                        else {
                            err('You were caught!')
                            term.singleLineMenu(['Take a breather'], function (e, r) {
                                if (e) {
                                    err(e)
                                    code('spawn=>continue=>monster=>caughtmenufail')
                                }
                                else {
                                    if (r.selectedIndex == 0) {
                                        //continue the game
                                        return game('loadfromsaved', gamed[0], gamed[1])
                                    }
                                }
                            })
                        }
                    }
                    else if (r.selectedIndex == 1) {
                        //prepare
                        var i = inventory.hasType(randomMonster.defeat[0])
                        if (i[0] == true) {
                            var itemToDefeatWithName = []
                            var itemToDefeatWith = []
                            i[1].forEach(el => {
                                var toolStrength = randomMonster.defeat[1].split(':')

                                if (toolStrength[1] >= toolStrength[1]) {
                                    itemToDefeatWithName.push(gamedata.items.items[el[0]].dname)
                                    itemToDefeatWith.push(el[0])
                                }
                            })

                            console.log('\n')
                            console.log('Select which weapon you want to use:'.cyan)

                            if ((itemToDefeatWithName == []) == false) {
                                err('You failed to prepare in time because you didn\'t have the correct materials!')
                                console.log('He gotcha'.gray)
                                //lose levels
                                player.level += -(randomMonster.level)

                                term.singleLineMenu(['Continue'], function (e, r) {
                                    if (e) {
                                        err(e)
                                    }
                                    else {
                                        return game('loadfromsaved', gamed[0], gamed[1])
                                    }
                                })
                            }
                            else {
                                term.singleColumnMenu(itemToDefeatWithName, function (e, r) {
                                    if (e) {
                                        err(e)
                                    }
                                    else {
                                        //item id
                                        var itemId = itemToDefeatWith[r.selectedIndex]

                                        //rare chance of losing the fight
                                        if (Math.floor(Math.random() * 10) == Math.floor(Math.random() * 10)) {
                                            err('You swung badly and missed the monster!')
                                            console.log('He gotcha'.gray)
                                            //lose levels
                                            player.level += -(randomMonster.level)

                                            term.singleLineMenu(['Continue'], function (e, r) {
                                                if (e) {
                                                    err(e)
                                                }
                                                else {
                                                    return game('loadfromsaved', gamed[0], gamed[1])
                                                }
                                            })
                                        }
                                        else {
                                            good('You stabbed him in the throat...and, well the rest is history.')
                                            console.log('Good news is you won!'.gray)

                                            term.singleLineMenu(['Continue'], function (e, r) {
                                                if (e) {
                                                    err(e)
                                                }
                                                else {
                                                    return game('loadfromsaved', gamed[0], gamed[1])
                                                }
                                            })
                                        }
                                    }
                                })
                            }
                        }
                    }
                    else if (r.selectedIndex == 2) {
                        return showOptions(gn)
                    }
                }
            })
        }
    }
}

function randomize(array) {
    //!causes bugs to occur
    var a = array
    var f = []
    var w = []

    var rn = Math.floor(Math.random() * a.length)

    for (let i = 0; i < a.length; i++) {
        const el = a[i]
        if (i == rn) {
            f.push(el)
        }
        else {
            w.push(el)
        }
    }

    for (let i = 0; i < w.length; i++) {
        const el = w[i]
        var rn2 = Math.floor(Math.random() * w.length)
        if (rn2 == i) {
            f.push(el)
        }
        else {
            f.push(el)
        }
    }
    return f
}

//TODO continue work on chest feature
function chestInit(gamename, gamestate) {
    console.clear()
    if (gamestate[0] == 'enviro') {
        if (rarity(gamedata.chest.biomerarity[gamestate[1]]) == true) {
            console.log(boxen('You stumbled upon a chest!', {
                padding: 1,
                borderStyle: 'round'
            }))
            term.singleLineMenu(['Open it', 'Don\'t open it'], function (e, r) {
                if (e) {
                    err(e)
                    //todo add err code
                }
                else {
                    if (r.selectedIndex == 0) {
                        //There's about a 25% chance that you don't get blown up?
                        var chestExplosionChance = Math.floor(Math.random() * 3)
                        if (chestExplosionChance == 0) {
                            //* chest goes boom
                            console.clear()
                            player.level += -2
                            err('You tried to open the chest, but it blew up!')
                            console.log('You lost ' + 2 + ' levels!')
                            term.singleLineMenu(['OK'], function (e, r) {
                                if (e) {
                                    err(e)
                                }
                                else {
                                    return game('loadenviro', gamestate[1])
                                }
                            })
                        }
                        else {
                            var amountOfPossibleItemsInBiome = gamedata.chest.biomes[gamestate[1]].length
                            var randomNumber = Math.floor(Math.random() * amountOfPossibleItemsInBiome)
                            console.log('\n\nYou got ' + gamedata.chest.biomes[gamestate[1]][randomNumber].toString().bgGreen + '!')
                            term.singleLineMenu(['OK'], function (e, r) {
                                if (e) {
                                    err(e)
                                }
                                else {
                                    return action('give:' + gamedata.chest.biomes[gamestate[1]][randomNumber] + '=>go:' + gamestate[1])
                                }
                            })
                        }
                    }
                    else if (r.selectedIndex == 1) {
                        return game('loadenviro', gamestate[1])
                    }
                }
            })
        }
        else {
            return game('loadfromsaved', gamestate[1], gamestate[2], false)
        }
    }
    else {
        return game('loadfromsaved', gamestate[1], gamestate[2], false)
    }
}

function rarity(rarity) {
    if (rarity == 'common') {
        if (Math.floor(Math.random() * 2) == 1) {
            return true
        }
        else {
            return false
        }
    }
    else if (rarity == 'uncommon') {
        if (Math.floor(Math.random() * 10) == 6) {
            return true
        }
        else {
            return false
        }
    }
    else if (rarity == 'rare') {
        if (Math.floor(Math.random() * 10) == Math.floor(Math.random() * 10)) {
            return true
        }
        else {
            return false
        }
    }
}

function options(task, option) {
    console.clear()
    if (task == 'frommenu') {
        console.log(boxen('GAME OPTIONS', {
            padding: 1,
            margin: 1,
            float: 'center',
            align: 'center',
            backgroundColor: 'blue',
            borderColor: 'yellow'
        }))
        var menuOptions = ['View games', 'View settings', 'GitHub', 'Wiki', 'Back']
        term.singleColumnMenu(menuOptions, function (e, r) {
            if (e) {
                err(e)
                //todo add error code
            }
            else {
                if (r.selectedIndex == 0) {
                    //* manage games
                    return options('specific', 'managegames')
                }
                else if (r.selectedIndex == 1) {
                    //* show settings
                    return options('specific', 'managesettings')
                }
                else if (r.selectedIndex == 2) {
                    //* open github page
                    return options('specific', 'opengithub')
                }
                else if (r.selectedIndex == 3) {
                    //* open wiki website
                    return options('specific', 'openwiki')
                }
                else if (r.selectedIndex == 4) {
                    return mainMenu()
                }
            }
        })
    }
    else if (task == 'specific') {
        if (option == 'managegames') {
            //* manage games
            console.clear()
            console.log(boxen('Manage games', {
                padding: 1,
                margin: 1,
                borderStyle: 'round'
            }))
            console.log('Select a game to manage it.'.gray)
            const games = fs.readdirSync('game\\games')
            const g = ['Return to options menu'.bgBlue]
            games.forEach(el => {
                g.push(el)
            })
            term.singleColumnMenu(g, function (e, r) {
                if (e) {
                    err(e)
                    //todo add err code
                }
                else {
                    //* g[0] is always cancel option
                    //* this way i always know where it is
                    if (r.selectedIndex == 0) {
                        return options('frommenu')
                    }
                    else {
                        console.clear()
                        const sg = games[r.selectedIndex - 1]
                        var go = ['Delete'.bgRed, 'View JSON data ' + '(nerd)'.gray, 'Cancel']
                        return manageGames(go, sg)
                    }
                }
            })
        }
        else if (option == 'managesettings') {
            //* manage settings
            err('There are no settings available!')
            term.singleLineMenu(['OK'], function (e, r) {
                if (e) {
                    err(e)
                    //todo add err code
                }
                else {
                    return options('frommenu')
                }
            })
        }
        else if (option == 'opengithub') {
            //* open github page
            open('https://github.com/cmexdev/PATH')
            return options('frommenu')
        }
        else if (option == 'openwiki') {
            //* open wiki
            open('https://cmexdev.github.io/PATH')
            return options('frommenu')
        }
    }
}

function manageGames(opt, selected) {
    console.log(boxen('Seleted game: ' + selected.toString().bgBlue, {
        padding: 1,
        borderStyle: 'classic'
    }))
    term.singleRowMenu(opt, function (e, r) {
        if (e) {
            err(e)
            //todo add err code
        }
        else {
            if (r.selectedIndex == 2) {
                //* cancel
                return options('specific', 'managegames')
            }
            else if (r.selectedIndex == 0) {
                console.log('Are you sure you want to delete game: ' + selected.toString().bgBlue + '? ' + '[Y/N]'.gray)
                term.yesOrNo({
                    yes: ['y', 'ENTER'],
                    no: ['n']
                }, function (e, r) {
                    if (e) {
                        err(e)
                        //todo add err code
                    }
                    else {
                        if (r == true) {
                            fs.rmSync('game\\games\\' + selected + '\\game.json')
                            fs.rmdirSync('game\\games\\' + selected)
                            return options('specific', 'managegames')
                        }
                        else {
                            return options('specific', 'managegames')
                        }
                    }
                })
            }
            else if (r.selectedIndex == 1) {
                console.clear()
                console.log(boxen('This game file can be found at: ' + 'game\\games\\' + selected + '\\game.json'))
                console.log(jason.read('game\\games\\' + selected + '\\game.json'))
                term.singleLineMenu(['OK'], function (e, r) {
                    if (e) {
                        err(e)
                        //todo add err code
                    }
                    else {
                        return options('specific', 'managegames')
                    }
                })
            }
        }
    })
}

function craft(gamed) {
    console.clear()
    const items = gamedata.items.items
    const list = gamedata.items.list
    const g = gamed
    const inv = player.inventory
    var possiblecraft = []

    var inven = [
        ['Name', 'Type', 'Description', 'Amount', 'Strength (# of uses)']
    ]

    player.inventory.forEach(el => {
        var i = gamedata.items.items[el.id]
        var e = []
        e[0] = i.dname
        e[1] = i.type
        e[2] = '^B' + i.desc
        e[3] = '^G' + el.amount
        e[4] = i.strength
        inven.push(e)
    })

    term.table(inven, {
        hasBorder: true,
        borderChars: 'lightRounded',
        width: term.width,
        fit: true,
        borderAttr: {
            color: 'blue'
        },
        textAttr: {
            color: 'default'
        },
        firstCellTextAttr: {
            bgColor: 'blue'
        },
        firstRowTextAttr: {
            bgColor: 'blue'
        },
        firstColumnTextAttr: {
            bgColor: 'red'
        },
        contentHasMarkup: true
    })

    const final = []
    const ref = []
    const preref = []

    list.forEach(el => {
        const c = items[el].craft
        if (c == null) {
            //! no craft
        }
        else {
            if (c.length == 1) {
                var invhas = inventory.has(c[0][0])
                if (invhas[1] >= c[0][1]) {
                    final.push(el)
                    preref.push(c[0])
                }
                else {
                    //not enough
                }
            }
            else {
                var len = c.length
                var cur = 0
                var prea = []
                c.forEach(ell => {
                    var invhas = inventory.has(ell[0])
                    if (invhas[1] >= ell[1]) {
                        cur++
                        prea.push(ell)
                    }
                })

                if (cur == len) {
                    //* can craft
                    final.push(el)
                    preref.push(prea)
                }
                else {
                    //* cannot craft
                }
            }

            ref.push(preref)
        }
    })

    return logCraft(final, ref)
}

function logCraft(array, ref) {
    array.push('Cancel'.bgRed)

    term.singleColumnMenu(array, function (e, r) {
        if (e) {
            err(e)
            //todo add err code
        }
        else {
            if (r.selectedText != 'Cancel'.bgRed) {
                const el = ref[r.selectedIndex][r.selectedIndex]

                if (typeof el[0] != 'string') {
                    el.forEach(i => {
                        action('take:' + i[0] + '&' + i[1])
                    })

                    action('give:' + r.selectedText + '&' + 1)
                }
                else {
                    action('take:' + el[0] + '&' + el[1])
                    action('give:' + r.selectedText + '&' + 1)
                }

                return craft()
            }
            else {
                if (gamefile.gamestate[0] == 'enviro') {
                    return game('loadfromsaved', gamefile.gamestate[1], gamefile.gamestate[2])
                }
                else if (gamefile.gamestate[0] == 'mob') {
                    return spawn(gamefile.gamestate[3], gamefile.name, 'spawncontinue', gamefile.gamestate[1], gamefile.gamestate[2])
                }
            }
        }
    })
}

function terminal(returnfrom) {
    const g = gamefile
    const usage = gamedata.usage
    if (returnfrom != 'inside') {
        console.clear()
    }
    term('PATH>> ')

    term.inputField(
        {
            autoComplete: gamedata.commands,
            autoCompleteHint: true,
            autoCompleteMenu: true,
            history: termhistory,
            tokenHook: function(token, isEndOfInput, prevTokens, term, config) {
                var prevText = prevTokens.join(' ')

                //1: blue
                //2: yellow
                //
                //{...}: brightBlue

                switch (token) {
                    case 'exit':
                        config.style = term.red
                        break

                    case 'cls':
                        config.style = term.green
                        break

                    case 'has':
                        config.style = term.yellow
                        break

                    case 'hasType':
                        config.style = term.yellow
                        break

                    case '{...}':
                        config.style = term.brightBlue
                        break

                    case 'inventory':
                        config.style = term.blue
                        break

                    case 'show':
                        config.style = term.blue
                        break
                }
            }
        },
        function(e, r) {
            if (e) {
                err(e)
            }
            else {
                //* if 'exit' return back to game

                console.log('\n')
                termhistory.push(r)

                if (r == 'exit') {
                    console.log('Exiting to game...')
                    term.singleLineMenu(['OK'], function (e, r) {
                        if (g.gamestate[0] == 'mob') {
                            return spawn(g.gamestate[3], g.name, 'spawncontinue', g.gamestate[1], g.gamestate[2])
                        }
                        else if (g.gamestate[0] == 'enviro') {
                            return game('loadfromsaved', g.gamestate[1], g.gamestate[2])
                        }
                    })
                }

                else if (r == 'cls') {
                    return terminal()
                }

                //* inventory

                else if (r == 'inventory' || r == 'inventory has' || r == 'inventory hasType') {
                    //* print usage
                    u()

                    term.table(usage.inventory, {
                        hasBorder: true,
                        width: term.width
                    })

                    return terminal('inside')
                }
                else if (r.includes('inventory has ')) {
                    console.log(inventory.has(r.split('inventory has ')[1]))
                    return terminal('inside')
                }
                else if (r.includes('inventory hasType ')) {
                    console.log(inventory.hasType(r.split('inventory hasType ')[1]))
                    return terminal('inside')
                }
                else if (r == 'inventory clean') {
                    inventory.clean()
                    return terminal('inside')
                }

                else if (r == 'show') {
                    u()

                    term.table(usage.show, {
                        hasBorder: true,
                        width: term.width
                    })

                    return terminal('inside')
                }
                else if (r == 'show inventory') {
                    console.log(player.inventory)

                    return terminal('inside')
                }

                else {
                    console.log('Err'.bgRed + ' Unknown command: ' + r.toString().underline)
                    return terminal('inside')
                }
            }
        }
    )
}