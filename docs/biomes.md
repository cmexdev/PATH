# Biomes

- [Biomes](#biomes)
  - [Full list of biomes](#full-list-of-biomes)
  - [Syntax](#syntax)
- [Next steps](#next-steps)

## Full list of biomes

|Name|ID|
|-|-|
|Plain|`plain`|
|Cave|`cave`|

## Syntax

There are multiple properties included in an environment JSON file.

**`type`**
```json
{
  "type": "continue"
}
```

If the type is `continue`, the game will continue to the same type of biome.

```json
{
  "type": "exit"
}
```

However, if the type is `exit`, the game will continue in a different biome type.

**action**

```json
{
  "action": "go:plain"
}
```

This sample action will take the player to a plain boime variant when that option is chosen. Actions can hold any [commands](commands.md).

It is also possible to have a callback action if the action does not involve going to another biome.

```json
{
  "action": "give:wood=>go:cave"
}
```

This sample action will first, give the player wood, and then send the player to a cave biome variant.

# Next steps

[<== Back (items)](items.md) | [Next (commands) ==>](commands.md)