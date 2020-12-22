const colors = require('colors')
const boxen = require('boxen')
const readline = require('readline')
const fs = require('fs')
const dec = new TextDecoder('utf-8')
const term = require('terminal-kit').terminal
const termkit = require('terminal-kit')
const jason = require('ezjason')
const package = jason.read('package.json')
const fetch = require('node-fetch')
const dns = require('dns')
const http = require('http')
const shell = require('child_process')
var githubpackage = {}

//set globals empty to prepare for load
const player = {}
player.inventory = []
player.discovered = {
    biomes: [],
    items: []
}
player.level = 0

//inventory object
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
    },
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
    }
}

function checkInternet() {
    return 'not_in_use'
}

//set gamedata
const gamedata = {}
gamedata.items = jason.read('game\\items.json')
gamedata.levels = jason.read('game\\levels.json')
gamedata.spawning = jason.read('game\\spawning.json')
gamedata.mob = jason.read('game\\mob.json')
gamedata.state = []

const enviros = fs.readdirSync('game\\environments\\')

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

//level up function
function levelUp(text) {
    console.log(boxen('LEVEL UP '.green + text, {
        padding: 1,
        borderStyle: 'classic',
        borderColor: 'green'
    }))
}

pre()

function pre() {
    //check connection
    dns.resolve('www.google.com', function (e) {
        if (e) {
            err(e)
            term.singleLineMenu(['Continue'], function (e, r) {
                if (e) {
                    err(e)
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
                        }
                        else {
                            if (r.selectedIndex == 1) {
                                return mainMenu()
                            }
                            else if (r.selectedIndex == 0) {
                                var fn = 'install-' + json.version + '.exe'
                                const install = fs.createWriteStream(fn)
                                const req = http.get('http://i3.ytimg.com/vi/J---aiyznGQ/mqdefault.jpg', function(r) {
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

//create files for new game
function createValidGame(name) {
    console.log('Creating game: ' + name)

    fs.mkdirSync('game\\games\\' + name)

    return loadEmptyGame(name)
}

//load a saved game
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

                    //continue loading game & set current game
                    gamedata.currentgame = i
                    return startLoadedGame(i)
                }
            }
        }
    )
}

//load a game that has no data
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
        var environmentslen = fs.readdirSync('game\\environments\\').length
        var environments = fs.readdirSync('game\\environments\\')
        var rn = Math.floor(Math.random() * environmentslen)

        const environment = environments[rn]
        const envirom = environment.split('.json')[0]
        const enviro = fs.readFileSync('game\\environments\\' + environment)
        const envi = dec.decode(enviro)
        const e = JSON.parse(envi)

        var envirovarians = e.variants.length
        var rn = Math.floor(Math.random() * envirovarians)

        const en = e.variants[rn]

        gamedata.state = ['enviro', environment.split('.json')[0], en.id]

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
            opt.push(el.title)
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

        const environment = game

        const e = jason.read('game\\environments\\' + environment + '.json')

        //GET RANDOM VARIANT
        var envirovarians = e.variants.length
        var rn = Math.floor(Math.random() * envirovarians)

        //VARIANT
        const en = e.variants[rn]

        gamedata.state = ['enviro', environment, en.id]

        var pd = 0

        player.discovered.biomes.forEach(el => {
            if (el == environment) {
                pd++
            }
        })

        if (pd == 0) {
            //player has not discovered biome
            levelUp('You discovered a new biome! (' + environment + ')')
            player.discovered.biomes.push(environment)
            player.level += gamedata.levels.biomes[environment]
        }

        saveGame(environment, en.id, gamedata.currentgame, player.inventory, player.level, player.discovered, gamedata.state)

        //SPAWN MONSTER?
        var sm = 0
        gamedata.spawning.monster.biome.forEach(el => {
            if (el == environment) {
                if (player.level > gamedata.spawning.monster.level - 1) {
                    if (Math.floor(Math.random() * 10) == 6) {
                        sm++
                    }
                }
            }
        })

        if (sm > 0) {
            return spawn('monster', gamedata.currentgame, 'spawnrandom', null, [environment, en.id])
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
            opt.push(el.title)
        })

        term.singleColumnMenu(opt, function (e, resp) {
            if (e) {
                err(e)
            }
            action(en.options[resp.selectedIndex].action)
        })
    }
    else if (task == 'loadfromsaved') {
        const environment = game
        const varianid = enviroid

        gamedata.state = ['enviro', environment, varianid]

        var e = ''

        try {
            e = jason.read('game\\environments\\' + environment + '.json')
        } catch (er) {
            console.log('An unknown error occured!'.white.bgRed + ' See error details below.'.gray)
            err(er)
            process.exit()
        }

        var index = 0

        //FIND VARIANT THAT HAS ID OF varianid
        for (let i = 0; i < e.variants.length; i++) {
            const el = e.variants[i];
            if (el.id == varianid) {
                index = i
            }
        }

        const en = e.variants[index]

        saveGame(environment, varianid, gamedata.currentgame, player.inventory, player.level, player.discovered, gamedata.state)

        console.log(boxen(en.message, {
            padding: 1,
            borderColor: 'grey',
            borderStyle: 'round'
        }))

        var opt = []
        var arr = 0

        en.options.forEach(el => {
            arr++
            opt.push(el.title)
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
    else if (act == 'mob-runaway') {
        if (Math.floor(Math.random() * 2) == 1) {
            return true
        }
        else {
            return false
        }
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
            err('method not supported @action=>give-only')
            process.exit()
        }
        else {
            var itemtogive = as[1].split('=>')[0]
            var callbackaction = as[1].split('=>')[1] + ':' + as[2]
            var invenhasitem = 0

            player.inventory.forEach(el => {
                if (el.id == itemtogive) {
                    invenhasitem++
                    var rn = Math.floor(Math.random() * 10)
                    el.amount += rn
                    if (itemtogive == 'iron') {
                        player.level += rn / 2
                    }
                }
            })

            if (invenhasitem == 0) {
                var iv = {}
                iv.id = itemtogive
                var rn = Math.floor(Math.random() * 10)
                iv.amount = rn
                if (itemtogive == 'iron') {
                    player.level += rn / 2
                }
                player.inventory.push(iv)
            }

            return action(callbackaction)
        }
    }
    else {
        err('method not supported @action=>unknown')
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
    console.log('Player level: '.blue + player.level)
    console.log('\nCurrent game: '.blue + gamedata.currentgame)
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
                    ['Name', 'Type', 'Description', 'Amount', 'Strength']
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

                term.singleRowMenu(['Continue'], function (e, r) {
                    if (g.gamestate[0] == 'mob') {
                        return spawn(g.gamestate[3], g.name, 'spawncontinue', g.gamestate[1], g.gamestate[2])
                    }
                    else if (g.gamestate[0] == 'enviro') {
                        return startLoadedGame(game)
                    }
                })
            }
            else if (r.selectedIndex == 2) {
                if (g.gamestate[0] == 'mob') {
                    return spawn(g.gamestate[3], g.name, 'spawncontinue', g.gamestate[1], g.gamestate[2])
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
                        if (action('mob-runaway') == true) {
                            good('You escaped!')

                            term.singleLineMenu(['Take a breather'], function (e, r) {
                                if (e) {
                                    err(e)
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
                            console.log('You lost '.cyan + m.level / 2 + ' levels!'.cyan)
                            player.level += -(m.level / 2)
                            term.singleLineMenu(['Take a breather'], function (e, r) {
                                if (e) {
                                    err(e)
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
                        var i = inventory.hasType(m.defeat[0])
                        if (i[0] == true) {
                            var itu = []
                            var itur = []
                            i[1].forEach(el => {
                                var tt = m.defeat[1].split(':')

                                if (tt[1] >= tt[1]) {
                                    itu.push(gamedata.items.items[el[0]].dname)
                                    itur.push(el[0])
                                }
                            })

                            console.log('\n')
                            console.log('Select which weapon you want to use:'.cyan)

                            term.singleColumnMenu(itu, function (e, r) {
                                if (e) {
                                    err(e)
                                }
                                else {
                                    //item id
                                    var id = itur[r.selectedIndex]

                                    //rare chance of losing the fight
                                    if (Math.floor(Math.random() * 10) == Math.floor(Math.random() * 10)) {
                                        err('You swung badly and missed the monster!')
                                        console.log('He gotcha'.gray)
                                        //lose levels
                                        player.level += -(m.level)

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
                        if (action('mob-runaway') == true) {
                            good('You escaped!')

                            term.singleLineMenu(['Take a breather'], function (e, r) {
                                if (e) {
                                    err(e)
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
                        var i = inventory.hasType(m.defeat[0])
                        if (i[0] == true) {
                            var itu = []
                            var itur = []
                            i[1].forEach(el => {
                                var tt = m.defeat[1].split(':')

                                if (tt[1] >= tt[1]) {
                                    itu.push(gamedata.items.items[el[0]].dname)
                                    itur.push(el[0])
                                }
                            })

                            console.log('\n')
                            console.log('Select which weapon you want to use:'.cyan)

                            term.singleColumnMenu(itu, function (e, r) {
                                if (e) {
                                    err(e)
                                }
                                else {
                                    //item id
                                    var id = itur[r.selectedIndex]

                                    //rare chance of losing the fight
                                    if (Math.floor(Math.random() * 10) == Math.floor(Math.random() * 10)) {
                                        err('You swung badly and missed the monster!')
                                        console.log('He gotcha'.gray)
                                        //lose levels
                                        player.level += -(m.level)

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
                    else if (r.selectedIndex == 2) {
                        return showOptions(gn)
                    }
                }
            })
        }
    }
}

function randomize(array) {
    //causes bugs to occur
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