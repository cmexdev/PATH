# **Path**

A simple, but exciting console-based game.

## Game data
<hr>

**NOTE**: The words enviroments and biomes will both be used. *They are the same.*

### Biomes

- `cave`
- `plain`

**To access the JSON file for a biome**, simply put a `.json` on the end of it and that's the file. (*Files located in `game\\enviroments\\{enviroment}.json`*)

### Items

- `wood`
- `coal`
- `iron`

### Menus

- `options`

### Enviroment JSON syntax

There are different properties in the biome JSON file.

**`type`**
<hr>

```json
{
    "type": "continue"
}
```

On exit of the biome variant, the program will continue in the *same* biome type.

```json
{
    "type": "exit"
}
```

On exit of the biome variant, the program will continue in a *differnt* biome type.

**`action`**
<hr>

```json
{
    "action": "go:plain"
}
```

This sample will take the player to a plain variant when that option is chosen. These actions are similar to commands in Minecraft.

You can also have a callback action if the action does not involve going to another biome.

```json
{
    "action": "give:wood=>go:cave"
}
```

**A list of the commands**

|Action|Action description|Requires callback|
|-|-|-|
|`go:{enviroment}`|Transports the player to `{enviroment}`|`false`|
|`give:{item}`|Gives the player the item `{item}`|`true`: `give:{item}=>go:{enviroment}`|
|`show:{menu}`|Shows specified `{menu}`|`false`|

*A list of items, enviroments, and menus is listed above.*

## Game mechanics
<hr>

### Monster spawning

This occurence is chosen at random. It varies from mob to mob.

**Required** for a monster to spawn:

- Certain player level
    - 5
- Specific biome
    - Cave

**Actions**

When a monster spawns, player have two options: `Run away`, or `Prepare`

**Run away**

This option is best selected when a player does not have the correct items to fight the monster.

It is decided by a small random number generator.

If the player is lucky enough, they will have successfully run away. If not, the consequences will be as if the player died.

**Monsters will not spawn until these requirements are met.**

### Rarity equations

`common` code

```js
Math.floor(Math.random() * 2) == 1
```

`uncommon` code

```js
Math.floor(Math.random() * 10) == 6
```

`rare` code

```js
Math.floor(Math.random() * 10) == Math.floor(Math.random() * 10)
```

### `player` object

#### `inventory`

**Functions**:

- **`inventory.has(item)`**

```js
if (inventory.has('logs')[0] == true) {
    console.log(inventory.has('logs'))
}
```

Returns a boolean stating whether the player's inventory has a certain item and returns the amount in the inventory.

*Result* (if function completes successfully)

It returns an array.

```js
[hasItemBool, amountNumber]
```

**Result table**

|Result|Meaning|
|-|-|
|`undefined`|The player has no inventory|
|`[true, Number]`|The player has that item in their inventory. Number is the amount in the inventory|
|`[false, 0]`|The player does not have that item in their inventory|

## Souce code
<hr>

### Files and folders

*Not here* (coming soon)

### Programming

**This game was written in vanilla JavaScript.**

Data files in JSON.

#### Common code

**List of options in row**

```js
term.singleLineMenu(array, function(e, r) {
    if (e) {
        err(e)
    }
    if (r.selectedIndex == 0) {
        //do something
    }
})
```

**Game state**

`enviro`

```js
['enviro', enviroment, enviroment_id]
```

`mob`

```js
['mob', mobname, [enviroment, enviroment_id], mobtype]
```

### Packages

**Actively used packages**.

- `boxen`: Creates boxes.
- `electron`: Creates browser windows.
- `ezjason`: Reads JSON files.
- `terminal-kit`: Does a lot of stuff, it's good.

## ezjason
<hr>

**ezjason** is a package dedicated for reading JSON files in one line of code, developed because of this project.

View on [npm](https://npmjs.com/package/ezjason "The package on npm").