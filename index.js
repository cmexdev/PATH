const colors = require('colors')
const boxen = require('boxen')
const readline = require('readline')
const fs = require('fs')
const dec = new TextDecoder('utf-8')
const term = require('terminal-kit').terminal
const termkit = require('terminal-kit')
const jason = require('ezjason')
const package = jason.read('package.json')

const player = {}
player.inventory = []
player.discovered = {
    biomes: [],
    items: []
}
player.level = 0

const inventory = {
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
    }
}

const gamedata = {}

gamedata.items = jason.read('game\\items.json')
gamedata.levels = jason.read('game\\levels.json')
gamedata.spawning = jason.read('game\\spawning.json')
gamedata.mob = jason.read('game\\mob.json')
gamedata.state = []

const enviros = fs.readdirSync('game\\enviroments\\')

var gamefile = {}

function err(errtext) {
    console.log(boxen('[!] '.red + errtext, {
        padding: 1,
        borderStyle: 'round',
        borderColor: 'red',
        margin: 1
    }))
}

function levelUp(text) {
    console.log(boxen('LEVEL UP '.green + text, {
        padding: 1,
        borderStyle: 'classic',
        borderColor: 'green'
    }))
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

mainMenu()

function mainMenu(preinfo) {
    console.clear()
    if (preinfo) {
        console.log(preinfo)
    }
    console.log(boxen('PATH'.underline + ': A simple console-based game built in Node.js', {
        borderColor: 'yellow',
        padding: 2,
        borderStyle: 'round',
        margin: 2,
        float: 'center'
    }))

    //INIT PHASE
    console.log('Welcome to ' + 'PATH'.underline + '! ' + 'Select an option below to continue.'.gray)

    term.singleRowMenu(['[1] Start a new game', '[2] Load a saved game', '[3] Options', '[4] Exit'], function (e, r) {
        if (e) {
            err(e)
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
                return mainMenu()
            }
            else if (r.selectedIndex == 3) {
                console.clear()
                console.log('See ya!'.cyan + ' PATH Version '.grey + package.version.toString().cyan)
                process.exit()
            }
        }
    })
}

function newGame() {
    //THIS FUNCTION WILL DEAL WITH CREATING A NEW GAME FILE(S) AND CHECKING IF IT ALREADY EXISTS
    console.log(boxen('Create a new game', {
        padding: 1,
        borderStyle: 'round'
    }))

    console.log('What should we call this game? '.cyan)
    term.inputField({
        cancelable: true,
        echo: false
    }, function (e, r) {
        if (e) {
            err(e)
        }
        else {
            //CHECK TO SEE IF GAME EXISTS
            var games = fs.readdirSync('game\\games\\')

            var invalidname = 0

            games.forEach(el => {
                if (el == r || r.includes('\\') || r.includes('/') || r.includes('&') || r == 'con' || r == 'aux') {
                    invalidname++
                }
            })

            if (invalidname > 0) {
                console.clear()
                err('Invalid game name!')
                return newGame()
            }
            else {
                return createValidGame(r)
            }
        }
    })
}

function createValidGame(name) {
    console.log('Creating game: ' + name)

    fs.mkdirSync('game\\games\\' + name)

    return loadEmptyGame(name)
}

function loadGame() {
    console.clear()
    var games = fs.readdirSync('game\\games\\')

    console.log(boxen('Enter the name of the game. ' + ('(Press TAB to view list of games & Press ESC to cancel)').gray, {
        padding: 1,
        margin: 1,
        borderStyle: 'round'
    }))

    term.bold('game: ')

    term.inputField(
        { autoComplete: games, autoCompleteMenu: true, autoCompleteHint: true, default: '', cancelable: true },
        function (e, i) {
            if (e) {
                err(e)
            }
            else {
                if (i == undefined) {
                    return mainMenu()
                }
                else {
                    console.log('\n\nSelecting game: ', i.green.underline)

                    //continue loading game
                    gamedata.currentgame = i
                    return startLoadedGame(i)
                }
            }
        }
    )
}

function loadEmptyGame(name) {
    var egmd = {
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
    fs.writeFileSync('game\\games\\' + name + '\\game.json', JSON.stringify(egmd))

    gamedata.currentgame = name
    player.inventory = []
    player.discovered = {
        biomes: [],
        items: []
    }

    return game('randomgen')
}

function startLoadedGame(name) {
    var gamefile = ''
    try {
        gamefile = jason.read('game\\games\\' + name + '\\game.json')

        player.level = gamefile.player.level
        player.inventory = gamefile.player.inventory
        player.discovered = gamefile.discovered

        if (gamefile.gamestate[0] == 'enviro') {
            return game('loadfromsaved', gamefile.enviro[0], gamefile.enviro[1])
        }
        else if (gamefile.gamestate[0] == 'mob') {
            return spawn(gamefile.gamestate[3], name, 'spawncontinue', gamefile.gamestate[1], gamefile.gamestate[2])
        }
    } catch (e) {
        var p = 'Bad or corrupted game file!'.bgRed.white + '\nError data: ' + JSON.stringify(e).gray
        return mainMenu(p)
    }
}

function game(task, game, enviroid) {
    console.clear()

    if (task == 'randomgen') {
        var enviromentslen = fs.readdirSync('game\\enviroments\\').length
        var enviroments = fs.readdirSync('game\\enviroments\\')
        var rn = Math.floor(Math.random() * enviromentslen)

        const enviroment = enviroments[rn]
        const envirom = enviroment.split('.json')[0]
        const enviro = fs.readFileSync('game\\enviroments\\' + enviroment)
        const envi = dec.decode(enviro)
        const e = JSON.parse(envi)

        var envirovarians = e.variants.length
        var rn = Math.floor(Math.random() * envirovarians)

        const en = e.variants[rn]

        gamedata.state = ['enviro', enviroment.split('.json')[0], en.id]

        saveGame(envirom, en.id, gamedata.currentgame, player.inventory, player.level, player.discovered, gamedata.state)

        console.log(boxen(en.message, {
            padding: 1,
            borderStyle: 'round',
            borderColor: 'gray'
        }))

        var opt = []
        var arr = 0

        en.options.forEach(el => {
            arr++
            opt.push('[' + arr + '] ' + el.title)
        })

        term.singleColumnMenu(opt, function (e, resp) {
            if (e) {
                err(e)
            }
            action(en.options[resp.selectedIndex].action)
        })
    }
    else if (task == 'loadenviro') {

        //GAME SHOULD BE SAVED

        const enviroment = game

        const e = jason.read('game\\enviroments\\' + enviroment + '.json')

        //GET RANDOM VARIANT
        var envirovarians = e.variants.length
        var rn = Math.floor(Math.random() * envirovarians)

        //VARIANT
        const en = e.variants[rn]

        gamedata.state = ['enviro', enviroment, en.id]

        var pd = 0

        player.discovered.biomes.forEach(el => {
            if (el == enviroment) {
                pd++
            }
        })

        if (pd == 0) {
            //player has not discovered biome
            levelUp('You discovered a new biome! (' + enviroment + ')')
            player.discovered.biomes.push(enviroment)
            player.level += gamedata.levels.biomes[enviroment]
        }

        saveGame(enviroment, en.id, gamedata.currentgame, player.inventory, player.level, player.discovered, gamedata.state)

        //SPAWN MONSTER?
        var sm = 0
        gamedata.spawning.monster.biome.forEach(el => {
            if (el == enviroment) {
                if (player.level > gamedata.spawning.monster.level - 1) {
                    if (Math.floor(Math.random() * 10) == 6) {
                        sm++
                    }
                } ``
            }
        })

        if (sm > 0) {
            return spawn('monster', gamedata.currentgame, 'spawnrandom', null, [enviroment, en.id])
        }

        console.log(boxen(en.message, {
            padding: 1,
            borderStyle: 'round',
            borderColor: 'gray'
        }))

        var opt = []
        var arr = 0

        en.options.forEach(el => {
            arr++
            opt.push('[' + arr + '] ' + el.title)
        })

        term.singleColumnMenu(opt, function (e, resp) {
            if (e) {
                err(e)
            }
            action(en.options[resp.selectedIndex].action)
        })
    }
    else if (task == 'loadfromsaved') {
        const enviroment = game
        const varianid = enviroid

        gamedata.state = ['enviro', enviroment, varianid]

        const e = jason.read('game\\enviroments\\' + enviroment + '.json')

        var index = 0

        //FIND VARIANT THAT HAS ID OF varianid
        for (let i = 0; i < e.variants.length; i++) {
            const el = e.variants[i];
            if (el.id == varianid) {
                index = i
            }
        }

        const en = e.variants[index]

        console.log(boxen(en.message, {
            padding: 1,
            borderColor: 'grey',
            borderStyle: 'round'
        }))

        var opt = []
        var arr = 0

        en.options.forEach(el => {
            arr++
            opt.push('[' + arr + '] ' + el.title)
        })

        term.singleColumnMenu(opt, function (e, resp) {
            if (e) {
                err(e)
            }
            action(en.options[resp.selectedIndex].action)
        })
    }
}

function action(act) {

    if (act == 'show:options') {
        return showOptions(gamedata.currentgame)
    }

    //DECODE ACTION
    var as = act.split(':')

    var task = as[0]

    if (task == 'go') {
        if (as[1].includes('=>') == false) {
            return game('loadenviro', as[1])
        }
    }
    else if (task == 'give') {
        if (as[1].includes('=>') == false) {
            console.log('give: ' + as[1])
        }
        else {
            var itemtogive = as[1].split('=>')[0]
            var callbackaction = as[1].split('=>')[1] + ':' + as[2]

            player.inventory.forEach(el => {
                if (el.id == itemtogive) {
                    el.amount += Math.floor(Math.random() * 10)
                }
            })

            return action(callbackaction)
        }
    }
    else {
        err('method not supported')
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
    var gmd = {}
    gmd.name = gamename
    gmd.enviro = [enviro, envirovarianid]
    gmd.player = {}
    gmd.player.level = playerlev
    gmd.player.inventory = playerinven
    gmd.discovered = discover
    gmd.gamestate = gamedata.state

    var str = JSON.stringify(gmd)

    fs.writeFileSync('game\\games\\' + gamename + '\\game.json', str)

    gamefile = gmd
}

function showOptions(game) {
    const g = jason.read('game\\games\\' + game + '\\game.json')
    var opt = ['Exit to menu', 'View inventory', 'Cancel']
    term.singleRowMenu(opt, function (e, r) {
        if (e) {
            err(e)
        }
        else {
            if (r.selectedIndex == 0) {
                console.clear()
                return mainMenu()
            }
            else if (r.selectedIndex == 1) {
                console.clear()

                var inven = [
                    ['Name', 'Description', 'Amount', 'Uses']
                ]

                player.inventory.forEach(el => {
                    var i = gamedata.items.items[el.id]
                    var e = []
                    e[0] = i.dname
                    e[1] = '^B' + i.desc
                    e[2] = '^G' + el.amount
                    e[3] = null
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

                term.singleRowMenu(['Continue'], function (e, r) {
                    if (g.gamestate[0] == 'mob') {
                        return spawn(g.gamestate[3], g.name, 'spawncontinue', g.gamestate[1], g.gamestate[1])
                    }
                    else if (g.gamestate[0] == 'enviro') {
                        return startLoadedGame(game)
                    }
                })
            }
            else if (r.selectedIndex == 2) {
                if (g.gamestate[0] == 'mob') {
                    return spawn(g.gamestate[3], g.name, 'spawncontinue', g.gamestate[1], g.gamestate[1])
                }
                else if (g.gamestate[0] == 'enviro') {
                    return startLoadedGame(game)
                }
            }
        }
    })
}

function spawn(mobtype, gn, task, mob, gamed) {
    if (task == 'spawnrandom') {
        if (mobtype == 'monster') {
            var arr = 0
            var a = []
            gamedata.mob.forEach(el => {
                if (el.type == 'monster') {
                    a.push(el)
                    arr++
                }
            })
            var m = a[Math.floor(Math.random() * arr)]
            console.log(boxen('A wild ' + m.name + ' has spawned!', {
                padding: 1,
                margin: 1,
                borderColor: 'redBright'
            }))

            gamedata.state = ['mob', m.name, gamed, 'monster']

            saveGame(gamefile.enviro[0], gamefile.enviro[1], gamefile.name, gamefile.player.inventory, gamefile.player.level, gamefile.discovered, gamedata.state)

            console.log('Prepare to attack!'.cyan)

            var opt = ['Run away', 'Prepare', 'More options']

            term.singleLineMenu(opt, function (e, r) {
                if (e) {
                    err(e)
                }
                else {
                    if (r.selectedIndex == 0) {
                        //run away
                    }
                    else if (r.selectedIndex == 1) {
                        //prepare
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
            var m = {}
            gamedata.mob.forEach(el => {
                if (el.type == 'monster' && el.name == mob) {
                    m = el
                }
            })

            gamedata.state = ['mob', m.name, gamed, 'monster']

            console.log(boxen('A wild ' + m.name + ' has spawned!', {
                borderColor: 'redBright',
                padding: 1,
                margin: 1
            }))

            console.log('Prepare to attack!'.cyan)

            var opt = ['rUn aWaY', 'Prepare', 'More options']

            term.singleLineMenu(opt, function (e, r) {
                if (e) {
                    err(e)
                }
                else {
                    if (r.selectedIndex == 0) {
                        //run away
                    }
                    else if (r.selectedIndex == 1) {
                        //prepare
                        console.log(inventory.has('iron'))
                    }
                    else if (r.selectedIndex == 2) {
                        return showOptions(gn)
                    }
                }
            })
        }
    }
}