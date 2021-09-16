# [DEV] Items

This doc contains instructions for how to use and manage items.

- [[DEV] Items](#dev-items)

## Access

**To access an item** within the code:

```js
gamedata.items.items[{item_id}]
```

Since the items are part of a JSON object which is not an array, you cannot cycle through all of them, so instead you should cycle through the `gamedata.items.list` array.

```js
gamedata.items.list.forEach(el => {
    const item = gamedata.items.items[el]
})
```

## JSON Syntax

Sample item:

```json
"logs": {
    "dname": "Logs",
    "desc": "Basically a broken tree.",
    "type": "material",
    "worth": 0.2,
    "craft": null
}
```

### `dname`

This property is what the user will see, at least for most of the time. Usually this value should be a pretty version of the item ID.

### `desc`

This property is a comedic description of the item. The user will see this in the inventory menus. There is no recommended description, just make it funny.

### `type`

This property helps the game identify the item and seperate it from others.

Check the [items](../items.md) doc for the full list of items.

**`tool`** This item has a strength value and can be used to defeat mobs.

**`material`** This item can be used to craft other items.

### `worth`

This property gives an item a sell value per item. Even though there is no rarity property for items, this value should be related to how often one would come across it and whether it can craft a lot of items.

### `craft`

The item example above didn't quite show a proper example of a crafting recipe. So here's one below:

```json
"ironsword": {
    "...": "...",
    "craft": [
        ["iron", 2],
        ["stick", 1]
    ]
}
```

As one can see from above, the `craft` property is an array. Each element of the array is another array which contains the or one of the items needed to craft and how much is needed. **These craft arrays do not need to have more than one element in the array!** For example, a stick is crafted by using only two logs.