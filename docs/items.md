# Items

A list of items in PATH.

- [Items](#items)
  - [Types of items](#types-of-items)
  - [Full list of items](#full-list-of-items)
  - [Syntax](#syntax)
- [Next steps](#next-steps)
- [Dev Doc](#dev-doc)

## Types of items

There are a few types of items so that PATH can distinguish whether an item can be used for a certain task or not.

**Current item types**

|Type|Type explanation|
|-|-|
|`material`|An item that can be used in crafting|
|`tool`|An item that can be used to complete tasks|

## Full list of items

"Available" can also mean "naturally found".

|Item name|ID|Type|Strength|Available|
|-|-|-|-|-|
|Logs|`logs`|`material`|N/A|✅|
|Coal|`coal`|`material`|N/A|✅|
|Iron|`iron`|`material`|N/A|✅|
|Iron Sword|`ironsword`|`tool`|`+10`|✅|
|Wood Sword|`woodsword`|`tool`|`+5`|✅|
|Stick|`stick`|`material`|N/A|✅|

## Crafting

### Logs

Cannot be crafted.

### Coal

Cannot be crafted.

### Iron

Cannot be crafted.

### Iron Sword

2 iron, 1 stick

### Wood Sword

2 logs, 1 stick

### Stick

2 logs

## Syntax

Example item:

```json
"logs": {
    "dname": "Logs",
    "desc": "Basically a broken tree.",
    "type": "material"
}
```

**`dname`**

```json
"": {
    "dname": "WhatTheUserSees"
}
```

**`desc`**

```json
"": {
    "desc": "A quick description of the item, usually comedic."
}
```

**`type`**

```json
"": {
    "type": "tool"
}
```

# Next steps

[<== Back (errors)](errors.md) | [Next (biomes) ==>](biomes.md)

# [Dev Doc](dev/items.md)