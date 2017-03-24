

import React, { Component } from 'react';
import './App.css';
import Map from './Game/Map';
import HUI from './Game/HUI';
import generateMap from './MapGenerator';
import { f } from './utility';

class App extends Component {
  constructor() {
    super();
    this.state = {
      game: {
        width: window.innerWidth,
        height: 300,
      },
      map: generateMap(),
      player: {
        row: 5,
        col: 5,
        health: 100,
        level: 1,
        exp: 0,
        attack: 1,
        defense: 0,
        weapon: 'fists',
        shield: 'no shield',
        fight: function fight(monster) {
          monster.recieveDamage(this);
          if (monster.isAlive) {
            this.health -= monster.attack;
          }
          return this.health > 0;
        },
      },
    };
  }

  componentWillMount() {
    /* This is before the component gets rendered for the first time
       add some event listeners for keyboard presses
    */
    document.addEventListener('keydown', (e) => {
      switch (e.keyCode) {
        case 65:// a
        case 37:// left arrow
          this.movePlayerPosition(0, -1); // move left
          break;
        case 68:// d
        case 39:// right arrow
          this.movePlayerPosition(0, 1); // move right
          break;
        case 87:// w
        case 38:// up arrow
          this.movePlayerPosition(-1, 0); // move up
          break;
        case 83:// s
        case 40:// down arrow
          this.movePlayerPosition(1, 0); // move down
          break;
        default:
      }
    });
  }

  movePlayerPosition(relRow, relCol) {
    const moveToRow = this.state.player.row + relRow;
    const moveToCol = this.state.player.col + relCol;

    // Don't update the position if player will be moving onto a blocking square
    if (this.state.map[moveToRow][moveToCol].name === 'wall') {
      return;
    }

    const newState = Object.assign({}, this.state);

    // If the player is moving onto a health square, increase the players health
    if (newState.map[moveToRow][moveToCol].name === 'health potion') {
      newState.map[moveToRow][moveToCol] = f;
      newState.player.health += 10;
    }

    // If the player is moving onto a monster, adjust health of characters
    // and prevent player from moving onto the square
    if (newState.map[moveToRow][moveToCol].name === 'monster' &&
        newState.map[moveToRow][moveToCol].isAlive === true) {
      const monster = newState.map[moveToRow][moveToCol];
      newState.player.fight(monster);
    } else {
      newState.player.row = moveToRow;
      newState.player.col = moveToCol;
    }

    this.setState({
      newState,
    });
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>Roguelike Dungeon Crawler</h2>
        </div>
        <Map
          map={this.state.map}
          player={this.state.player}
          width={this.state.game.width}
          height={this.state.game.height}
        />
        <HUI
          player={this.state.player}
        />
      </div>
    );
  }
}

export default App;
