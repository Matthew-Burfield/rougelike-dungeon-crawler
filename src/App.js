

import React, { Component } from 'react';
import './App.css';
import Map from './Game/Map';
import HUD from './Game/HUD';
import generateMap from './MapGenerator';
import { f,
  GAME_STATE_PLAYING,
  // GAME_STATE_START_MENU,
  GAME_STATE_DEATH,
  CONTAINER_WIDTH,
  CONTAINER_HEIGHT,
  LEFT,
  RIGHT,
  UP,
  DOWN,
} from './Utility';
import getNewPlayer from './Utility/player';


/**
 * Helper function to update the hero position and action any
 * consumable items if the new tile has any
 *
 * @param {object} tile
 * @param {object} state
 * @param {array} newCoords
 * @returns {object} newState
 */
function checkTileAndMove(tile, state, newCoords) {
  const newState = Object.assign({}, state);
  const newRow = newCoords[0];
  const newCol = newCoords[1];

  // If the player is moving onto a health square, increase the players health
  if (tile.type === 'health potion') {
    newState.map[newRow][newCol] = f;
    newState.player.consumeHealthPotion(tile);
  }

  // If the player is moving onto a weapon, assign the new weapon and increase the players attack
  if (tile.type === 'weapon') {
    newState.map[newRow][newCol] = f;
    newState.player.equipWeapon(tile);
  }

  // If the player is moving onto a monster, adjust health of characters
  // and prevent player from moving onto the square
  if (tile.type === 'monster') {
    const monster = tile;
    newState.player.fight(monster);

    if (monster.isDead()) {
      newState.map[newRow][newCol] = f;
    }
    if (newState.player.isDead()) {
      newState.gameState = GAME_STATE_DEATH;
      document.removeEventListener('keydown', this.keyPressEvents);
      newState.player.image = 'images/tombstone.gif';
    }
  } else {
    newState.player.row = newRow;
    newState.player.col = newCol;
  }

  return newState;
}


/**
 * The project isn't using redux, so all state changes happen here.
 *
 * @class App
 * @extends {Component}
 */
class App extends Component {
  constructor() {
    super();
    this.state = {
      gameState: GAME_STATE_PLAYING,
      map: generateMap(),
      hudPlayerImage: 1,
      player: getNewPlayer(),
    };
    this.tick = this.tick.bind(this);
  }

  /**
   * The method runs before this component gets rendered for the
   * first time. We can add the event listener for movement keypresses here
   *
   * @memberOf App
   */
  componentDidMount() {
    document.addEventListener('keydown', this.keyPressEvents);
  }


  /**
   * The player position is set depending on the key pressed.
   * The player's getImage() function will use the direction to determine
   * which image to display.
   *
   * @param {string} direction
   *
   * @memberOf App
   */
  setPlayerPosition(direction) {
    const newState = Object.assign({}, this.state);
    newState.player.currentDirection = direction;
    this.setState({
      newState,
    });
  }


  /**
   * Updates the player image in the HUD on a set interval in
   * order to give it an animation effect
   *
   * @memberOf App
   */
  tick() {
    this.setState(prevState => ({
      hudPlayerImage: prevState.hudPlayerImage === 1 ? 2 : 1,
    }));
  }


  /**
   * User has pressed a directional key. We need to determine if the hero
   * is allowed to move, and if there are any consumables on the tile
   * he is moving to
   *
   * @param {number} relRow
   * @param {number} relCol
   *
   * @memberOf App
   */
  movePlayerPosition(relRow, relCol) {
    const moveToRow = this.state.player.row + relRow;
    const moveToCol = this.state.player.col + relCol;

    // Don't update the position if player will be moving onto a blocking square
    if (this.state.map[moveToRow][moveToCol].type === 'wall') {
      return;
    }

    const tile = this.state.map[moveToRow][moveToCol];
    const newState = checkTileAndMove(tile, this.state, [moveToRow, moveToCol]);

    // remove the key event listeners if the player dies
    if (newState.player.isDead()) {
      document.removeEventListener('keydown', this.keyPressEvents);
    }

    this.setState({
      newState,
    });
  }


  /**
   * Allow both the WASD and arrow keys to be used
   *
   * @memberOf App
   */
  keyPressEvents = (e) => {
    switch (e.keyCode) {
      case 65:// a
      case 37:// left arrow
        this.setPlayerPosition(LEFT);
        this.movePlayerPosition(0, -1); // move left
        break;
      case 68:// d
      case 39:// right arrow
        this.setPlayerPosition(RIGHT);
        this.movePlayerPosition(0, 1); // move right
        break;
      case 87:// w
      case 38:// up arrow
        this.setPlayerPosition(UP);
        this.movePlayerPosition(-1, 0); // move up
        break;
      case 83:// s
      case 40:// down arrow
        this.setPlayerPosition(DOWN);
        this.movePlayerPosition(1, 0); // move down
        break;
      default:
    }
  };


  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>Rogue-like Dungeon Crawler</h2>
        </div>
        <Map
          map={this.state.map}
          player={this.state.player}
          width={CONTAINER_WIDTH}
          height={CONTAINER_HEIGHT}
        />
        <HUD
          player={this.state.player}
          heroImage={this.state.hudPlayerImage}
          tick={this.tick}
        />
      </div>
    );
  }
}


export default App;
