# Errors

There are many errors that are possible in PATH. Most of them are rare.

*If there is no reason for the error provided, that means that it is unknown why the error occurs. This information **must be provided** when reporting the error.*

**Table of contents**

- [Errors](#errors)
  - [pre=>internetfail](#preinternetfail)
  - [pre=>internetfail=>menufail](#preinternetfailmenufail)
  - [pre=>internetsuccess=>menufail](#preinternetsuccessmenufail)
  - [main=>menufail](#mainmenufail)
  - [newgame=>name](#newgamename)
  - [newgame=>invalidname](#newgameinvalidname)
  - [loadgame=>name](#loadgamename)
  - [startloaded=>badgame](#startloadedbadgame)
  - [game=>randomgen=>menufail](#gamerandomgenmenufail)
  - [game=>loadenviro=>menufail](#gameloadenviromenufail)
  - [game=>loadfromsaved=>unknowngameerr](#gameloadfromsavedunknowngameerr)
  - [game=>loadfromsaved=>menufail](#gameloadfromsavedmenufail)
  - [action=>give=>badmethod](#actiongivebadmethod)
  - [action=>unknown](#actionunknown)
  - [showoptions=>menufail](#showoptionsmenufail)
  - [spawn=>random=>monster](#spawnrandommonster)
  - [spawn=>random=>monster=>runawaymenufail](#spawnrandommonsterrunawaymenufail)
  - [spawn=>random=>monster=>caughtmenufail](#spawnrandommonstercaughtmenufail)
  - [spawn=>random=>monster=>preparemenufail](#spawnrandommonsterpreparemenufail)
  - [spawn=>random=>monster=>prepareokmeufail](#spawnrandommonsterprepareokmeufail)
  - [spawn=>random=>monster=>prepareok=>menufail](#spawnrandommonsterprepareokmenufail)
  - [spawn=>random=>monster=>prepareok=>successmenufail](#spawnrandommonsterprepareoksuccessmenufail)
  - [spawn=>continue=>monster=>menufail](#spawncontinuemonstermenufail)
  - [spawn=>continue=>monster=>escapemenufail](#spawncontinuemonsterescapemenufail)
  - [spawn=>continue=>monster=>caughtmenufail](#spawncontinuemonstercaughtmenufail)

## pre=>internetfail

Your internet connection failed and PATH couldn't check for updates.

**Non-fatal**

**Reason**: PATH cannot connect to the internet.

## pre=>internetfail=>menufail

The continue menu telling you that your internet failed, failed.

**Fatal**

## pre=>internetsuccess=>menufail

The continue menu tellng you that there is an updated version of PATH available failed.

**Fatal**

## main=>menufail

The main menu failed.

**Fatal**

## newgame=>name

The input field for a new game name failed.

**Fatal**

## newgame=>invalidname

The game name provided was invalid.

**Non-fatal**

**Reason**: you may already have a game named that name, or it is a name that PATH could not create.

## loadgame=>name

The input field for loading a game failed.

**Fatal**

## startloaded=>badgame

The game file for the selected game is bad.

**Fatal**

## game=>randomgen=>menufail

The random gen menu failed.

**Fatal**

## game=>loadenviro=>menufail

The load enviro menu failed.

**Fatal**

## game=>loadfromsaved=>unknowngameerr

An unknown error occured while trying to load an enviroment file.

**Fatal**

## game=>loadfromsaved=>menufail

The load from saved menu failed.

**Fatal**

## action=>give=>badmethod

The give action function was sent a bad method that is not supported.

**Fatal**

## action=>unknown

The action function was sent an unknown action command.

**Fatal**

## showoptions=>menufail

The show options menu failed.

**Fatal**

## spawn=>random=>monster

The monster random spawn menu failed.

**Fatal**

## spawn=>random=>monster=>runawaymenufail

The runaway menu for the random monster spawn failed.

**Fatal**

## spawn=>random=>monster=>caughtmenufail

The caught menu for the random monster spawn failed.

**Fatal**

## spawn=>random=>monster=>preparemenufail

The prepare menu for the random monster spawn failed.

**Fatal**

## spawn=>random=>monster=>prepareokmeufail

The prepare menu for the random monster spawn failed.

**Fatal**

## spawn=>random=>monster=>prepareok=>menufail

The prepare continue menu for the random monster spawn failed.

**Fatal**

## spawn=>random=>monster=>prepareok=>successmenufail

The prepaer continue menu for the random monster spawn failed.

**Fatal**

## spawn=>continue=>monster=>menufail

The continue spawn continue menu failed.

**Fatal**

## spawn=>continue=>monster=>escapemenufail

The escape continue menu failed.

**Fatal**

## spawn=>continue=>monster=>caughtmenufail

The caught continue menu failed.

**Fatal**