import GameState from '../SearchBeam/GameState';
import { TAiField, TAiInfo, TAiPlayerInfo, TAiVector2, fieldHeight, fieldWidth } from '../AiInfoDef';
import { playerAt, bombsOfPlayer, bombAt, playerInfo } from '../AiInfo';
import { getBombBlastRadius } from '../Environment/bomb';
import GameStateGenerator from '../SearchBeam/GameStateGenerator';
import save from './save';
import Ai1, { AiInterface } from '../AIs/Ai1';

export default {
  boardCells: {} as { [key: string]: Element },
  keydown: '',
  shiftDown: false,
  ctrlDown: false,
  altDown: false,
  saveIntervall: null as any,
  aiInfo: {} as TAiInfo,
  ais: [] as AiInterface[],
  aiIsRunning: false,

  clickCell(event: Event, x: number, y: number): void {
    console.log(x, y);
    let cell: Element | null = document.getElementById(`cell-${x}-${y}`);


    if (!cell) {
      return
    }

    this.setData({ x, y });

    if (this.keydown === 'c') {
      this.aiInfo.Field[x][y] = TAiField.fBlank;
      this.aiInfo.Bombs = this.aiInfo.Bombs.filter(b => bombAt(this.aiInfo, x, y) !== b);
      this.fillFieldWithAiInfo(cell, this.aiInfo);
      return;
    }


    const ctrl = this.ctrlDown;
    const keydown = this.keydown;

    const number0to8KeyPressed = this.keydown && this.keydown >= '0' && this.keydown <= '8';

    if (number0to8KeyPressed) {
      const playerNumber = +this.keydown;

      if (this.altDown) {
        return this.toggleBomb(cell, playerNumber, x, y);
      }
      return this.togglePlayer(cell, playerNumber, x, y);
    }

    if (ctrl) {
      return this.toggleCell(cell, x, y)
    }
  },

  toggleBomb(cell: Element, playerNumber: number, x: number, y: number) {
    if (playerAt(this.aiInfo, x, y) !== -1) {
      console.log('Cannot set bomb on player position')
      return;
    }
    if (this.aiInfo.Field[x][y] !== TAiField.fBlank) {
      console.log('Cannot set bomb on non blank position')
      return;
    }

    this.aiInfo.Field[x][y] = TAiField.fBlank;

    const bombHere = bombAt(this.aiInfo, x, y);

    if (bombHere) {
      this.aiInfo.Bombs = this.aiInfo.Bombs.filter(b => b !== bombHere);
      this.aiInfo.PlayerInfos[bombHere.Owner].AvailableBombs++;
      this.aiInfo.BombsCount = this.aiInfo.Bombs.length;

      this.fillFieldWithAiInfo(cell, this.aiInfo);

      console.log(`Bomb for player ${bombHere.Owner} removed`);

      if (bombHere.Owner === playerNumber) {
        return;
      }
    }

    this.aiInfo.Bombs.push(GameStateGenerator.newTAiBombInfo({ Position: { x, y }, Owner: playerNumber }));
    this.aiInfo.PlayerInfos[playerNumber].AvailableBombs++;

    this.aiInfo.BombsCount = this.aiInfo.Bombs.length;

    console.log(`Bomb for player ${playerNumber} set to ${x} ${y}`);

    this.fillFieldWithAiInfo(cell, this.aiInfo);
  },

  togglePlayer(cell: Element, playerNumber: number, x: number, y: number) {
    if (bombAt(this.aiInfo, x, y)) {
      console.log('Cannot set player on bomb position')
      return;
    }

    if (this.aiInfo.PlayerInfos[playerNumber].Position.x < 0) {
      console.log('Player not set');
    }

    const playerHereNumber: number = playerAt(this.aiInfo, x, y);

    if (playerHereNumber === playerNumber) {
      const playerHere = playerInfo(this.aiInfo, playerNumber);

      playerHere.Position.x = -1;
      playerHere.Position.y = -1;
      playerHere.Alive = false;

      this.aiInfo.Field[x][y] = TAiField.fBlank;

      this.aiInfo.Bombs = this.aiInfo.Bombs.filter(b => b.Owner !== playerNumber);

      this.fillFieldWithAiInfo(cell, this.aiInfo);

      return;
    }

    let player = this.aiInfo.PlayerInfos[+playerNumber];

    player.Position.x = x;
    player.Position.y = y;
    player.Flying = false;
    player.Alive = true;

    this.aiInfo.Field[x][y] = TAiField.fBlank;

    this.fillFieldWithAiInfo(cell, this.aiInfo);

    console.log(`Player ${playerNumber} set to ${player.Position.x} ${player.Position.y}`);
  },

  toggleCell(cell: Element, x: number, y: number) {
    if (playerAt(this.aiInfo, x, y) !== -1) {
      console.log('Cannot set field on player position')
      return;
    }

    const direction = this.shiftDown ? -1 : 1;
    const max = 28;

    let newValue = (this.aiInfo.Field[x][y] + direction)
    if (newValue < 0) {
      newValue = max - 1;
    }

    this.aiInfo.Field[x][y] = Math.max(0, Math.min(max, newValue % max));

    console.log(`${TAiField[this.aiInfo.Field[x][y]]} ${this.aiInfo.Field[x][y]}`);

    this.fillFieldWithAiInfo(cell, this.aiInfo);
  },

  createGameBoard() {
    this.boardCells = {};

    let game: any = document.getElementById('gameboard');
    // Höhe 11, Breite 15
    let width = fieldWidth;
    let height = fieldHeight;
    let board = [];

    game.innerHTML = '';

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // ein div overlay hinzufügen
        let wrapper: Element = document.createElement('div');
        wrapper.id = `wrapper-${x}-${y}`;
        wrapper.classList.add('cell', 'wrapper');

        let overlay: Element = document.createElement('div');
        overlay.id = `overlay-${x}-${y}`;
        overlay.classList.add('overlay');
        overlay.addEventListener('click', (event) => this.clickCell(event, x, y));
        overlay.addEventListener('contextmenu', (event) => this.clickCell(event, x, y));


        let label: Element = document.createElement('div');
        label.classList.add('label');

        let cell: Element = document.createElement('div');
        cell.id = `cell-${x}-${y}`;
        cell.classList.add('cell', 'blank', 'any');
        cell.addEventListener('click', (event) => this.clickCell(event, x, y));
        cell.addEventListener('contextmenu', (event) => this.clickCell(event, x, y));

        wrapper.appendChild(cell);
        wrapper.appendChild(overlay);
        wrapper.appendChild(label);
        game.appendChild(wrapper);

        this.fillFieldWithAiInfo(cell, this.aiInfo);

        this.boardCells[`${x}-${y}`] = cell;
      }
    }
    // mouse move handler for cells. call setData with x,y
    window.addEventListener('mousemove', (e) => {
      // cell unter dem mauszeiger finden und id auslesen
      let cell: Element | null = document.elementFromPoint(e.clientX, e.clientY);
      let id = cell?.id;
      if (id && id.startsWith('cell-')) {
        let [_, x, y] = id.split('-');
        this.updatePosition(x, y);
      }
    });

    this.keydown = '';
    this.shiftDown = false;
    this.ctrlDown = false;
    this.altDown = false;
    // merke keydown event
    window.addEventListener('keydown', (e) => {
      this.shiftDown = e.shiftKey;
      this.ctrlDown = e.ctrlKey;
      this.altDown = e.altKey;

      // 0..8 nicht überschreiben, wenn nicht ESC gedrückt
      if (this.keydown >= '0' && this.keydown <= '8') {
        this.keydown = e.key;

        this.updateCheckboxes()

        return;
      }

      this.keydown = e.key;
      console.log('keydown', e.key);

      this.updateCheckboxes()
    });
    window.addEventListener('keyup', (e) => {
      this.shiftDown = e.shiftKey;
      this.ctrlDown = e.ctrlKey;
      this.altDown = e.altKey;

      // 0..8 nicht überschreiben, wenn nicht ESC gedrückt
      if (this.keydown >= '0' && this.keydown <= '8' && e.key !== 'Escape') {
        this.updateCheckboxes()
        return;
      }
      this.keydown = e.key;
      console.log('keyup', e.key);
      this.updateCheckboxes()
    });

    this.updateInternalData();
  },

  updateCheckboxes() {
    let playerToggle: HTMLInputElement | null = document.getElementById('player-toggle') as HTMLInputElement;
    let fieldToggle: HTMLInputElement | null = document.getElementById('field-toggle') as HTMLInputElement;
    let bombToggle: HTMLInputElement | null = document.getElementById('bomb-toggle') as HTMLInputElement;
    let clearToggle: HTMLInputElement | null = document.getElementById('clear-toggle') as HTMLInputElement;

    if (!playerToggle || !fieldToggle || !bombToggle || !clearToggle) {
      return;
    }

    playerToggle.checked = this.keydown >= '0' && this.keydown <= '8';
    fieldToggle.checked = this.ctrlDown;
    bombToggle.checked = this.altDown;
    clearToggle.checked = this.keydown === 'c';
  },

  setKeysFromCheckbox() {
    let fieldToggle: HTMLInputElement | null = document.getElementById('field-toggle') as HTMLInputElement;
    let clearToggle: HTMLInputElement | null = document.getElementById('clear-toggle') as HTMLInputElement;

    if (!fieldToggle || !clearToggle) {
      return;
    }

    this.keydown = clearToggle.checked ? 'c' : '';
    this.ctrlDown = fieldToggle.checked && !clearToggle.checked;

    this.updateCheckboxes()
  },

  fillFieldWithAiInfo(cell: Element, aiInfo: TAiInfo) {
    let [_, xs, ys] = cell.id.split('-');
    let x = +xs;
    let y = +ys;
    let field = aiInfo.Field[x][y];
    // all TAiField names, remove f prefix and replace to small letter first char
    let classes = Object.keys(TAiField).filter(k => isNaN(+k)).map(name => name.substr(1).replace(/^(.)/, (c) => c.toLowerCase()));

    classes.forEach(c => cell.classList.remove(c));
    cell.classList.remove('undefined')
    cell.classList.add(classes[field]);

    this.updatePlayerPositions(aiInfo);
    this.updateBombPositions(aiInfo);
  },

  updatePlayerPositions(aiInfo: TAiInfo) {
    Object.keys(this.boardCells).forEach((key) => {
      let [x, y] = key.split('-');
      let cell = this.boardCells[key];
      let playerClasses = ['player-number', 'player', 'player0', 'player1', 'player2', 'player3', 'player4', 'player5', 'player6', 'player7', 'player8'];
      playerClasses.forEach(c => cell.classList.remove(c));
    });

    aiInfo.PlayerInfos.forEach((player, i) => {
      if (player.Position.x < 0 || player.Position.y < 0) {
        return;
      }
      let cell = this.boardCells[`${player.Position.x}-${player.Position.y}`];
      cell?.classList.add(`player`);
      cell?.classList.add(`player-number`);
      cell?.classList.add(`player${i}`);
    });
  },

  updateOverlays(aiInfo: TAiInfo) {
    const overlayCheckBox: HTMLInputElement | null = document.getElementById('overlay-toggle') as HTMLInputElement;
    if (!overlayCheckBox) {
      return;
    }

    Object.keys(this.boardCells).forEach((key) => {
      let [x, y] = key.split('-');
      let overlay: Element | null = document.getElementById(`overlay-${x}-${y}`);
      if (!overlay) {
        return;
      }
      let playerClasses = ['overlay-danger'];
      playerClasses.forEach(c => overlay?.classList.remove(c));
    });

    if (!overlayCheckBox.checked) {
      return;
    }

    aiInfo.Bombs.forEach((bomb, i) => {
      const bombRadius: TAiVector2[] = getBombBlastRadius(bomb, aiInfo,
        { stopAtNotBlankFields: true, includeEatenPowerUp: true }).flat()

      const addFlame = (x: number, y: number) => {
        let overlay: Element | null = document.getElementById(`overlay-${x}-${y}`);
        if (!overlay) {
          return;
        }
        overlay.classList.add(`overlay-danger`);
      }

      bombRadius.forEach((pos) => {
        addFlame(pos.x, pos.y);
      });
    });
  },
  toggleOverlays() {
    const overlayCheckBox: HTMLInputElement | null = document.getElementById('overlay-toggle') as HTMLInputElement;
    if (!overlayCheckBox) {
      return;
    }

    this.updateOverlays(this.aiInfo);
  },

  updateBombPositions(aiInfo: TAiInfo) {
    Object.keys(this.boardCells).forEach((key) => {
      let [x, y] = key.split('-');
      let cell = this.boardCells[key];
      let playerClasses = ['bomb', 'bomb-number', 'bomb0', 'bomb1', 'bomb2', 'bomb3', 'bomb4', 'bomb5', 'bomb6', 'bomb7', 'bomb8'];
      playerClasses.forEach(c => cell.classList.remove(c));
    });

    aiInfo.Bombs.forEach((bomb, i) => {
      let cell = this.boardCells[`${bomb.Position.x}-${bomb.Position.y}`];
      cell?.classList.add(`bomb`);
      cell?.classList.add(`bomb-number`);
      cell?.classList.add(`bomb${bomb.Owner}`);
    });

    aiInfo.BombsCount = aiInfo.Bombs.length;

    this.updateOverlays(aiInfo);
  },

  setData(data: {}) {
    // pre id=data das data als json ausgeben
    let pre: Element | null = document.getElementById('data');

    if (!pre) {
      throw new Error('pre#data not found');
    }

    let cache: Object[] = [];
    pre.innerHTML = JSON.stringify(data, (key: string, value: any) => {
      if (typeof value === 'object' && value !== null) {
        if (cache.includes(value)) {
          return;
        }
        cache.push(value);
      }
      return value;
    }, 2);
  },

  updatePosition(x: string, y: string) {
    let position: Element | null = document.getElementById('mouse-position');

    if (!position) {
      return
    }

    position.textContent = `x: ${x}, y: ${y}`;

    let fieldContent: Element | null = document.getElementById('field-content');
    if (!fieldContent) {
      return;
    }

    fieldContent.textContent = `Field: ${TAiField[this.aiInfo.Field[+x][+y]]} ${this.aiInfo.Field[+x][+y]}`;
  },

  async newGame() {
    this.aiInfo = GameStateGenerator.newTAiInfo();
    this.aiInfo.PlayerInfos.forEach((player) => { player.Position = { x: -1, y: -1 } });
    this.aiInfo.Bombs = [];
    this.aiInfo.BombsCount = this.aiInfo.Bombs.length;

    this.createGameBoard();

    // reset game state
    this.setData({});

    this.initAis()
  },

  initAis() {
    this.ais = [
      new Ai1(this.aiInfo, 0)
    ]
  },

  step() {
    try {
      this.aiIsRunning = true;
      this.ais.forEach(ai => {
        const command = ai.act(this.aiInfo)
        console.log(command)
      })

      this.updatePlayerPositions(this.aiInfo);
    } finally {
      this.aiIsRunning = false;
    }
  },

  saveToLocalStorage(isAutoSave: boolean = false) {
    if (isAutoSave && this.aiIsRunning) {
      return;
    }

    try {
      // console.group('saveToLocalStorage')
      const saveStateElement: HTMLInputElement | null = document.getElementById('save-state-name') as HTMLInputElement;
      const saveStateNameValue: string = saveStateElement.value || localStorage.getItem('last-save-state-name') || 'default';

      if (saveStateNameValue === 'Normal2') {
        console.error('invalid save state name', saveStateNameValue)
        return
      }

      localStorage.setItem('last-save-state-name', saveStateNameValue);

      // console.debug('saveToLocalStorage', saveStateNameValue)

      if (saveStateElement && saveStateNameValue !== '') {
        saveStateElement.value = saveStateNameValue;
      }


      const data = Object.assign({
        saveTime: new Date().toISOString(),
        tabID: sessionStorage.tabID          
      }, this.aiInfo);
      const dataAsStr = JSON.stringify(data);
      localStorage.setItem('save-state_' + saveStateNameValue, dataAsStr);

      this.updateInternalData();

      setTimeout(() => {
        const restoredData: any = localStorage.getItem('save-state_' + saveStateNameValue);

        if (dataAsStr != restoredData) {
          console.error('saveToLocalStorage: data not equal. Is there any other other tab with the same game running?')
        }
      }, 100);

    }
    finally {
      console.groupEnd()
    }
  },

  loadFromSave() {
    try {
      console.group('loadFromSave')
      const saveStateList: HTMLSelectElement | null = document.getElementById('save-states-list') as HTMLSelectElement;
      if (!saveStateList) {
        return;
      }
      const saveStateName = saveStateList.value;

      let data = localStorage.getItem('save-state_' + saveStateName);
      if (data) {
        try {
          const newAiInfo = JSON.parse(data);

          if (newAiInfo.tabID !== sessionStorage.tabID) {
            console.error('loadFromSave: tabID not equal')
          }

          this.aiInfo = newAiInfo;
          this.aiInfo.BombsCount = this.aiInfo.Bombs.length;
        } catch (e) {
          console.error(e);
          return
        }
      }

      const saveStateElement: HTMLInputElement | null = document.getElementById('save-state-name') as HTMLInputElement;
      if (saveStateElement) {
        saveStateElement.value = saveStateName;
      }

      this.createGameBoard();
    }
    finally {
      console.groupEnd()
    }
  },

  loadFromLocalStorage() {
    const saveStateElement: HTMLInputElement | null = document.getElementById('save-state-name') as HTMLInputElement;
    const saveStateNameValue: string = saveStateElement.value || localStorage.getItem('last-save-state-name') || 'default';

    let data = localStorage.getItem('save-state_' + saveStateNameValue);
    if (data) {
      try {
        this.aiInfo = JSON.parse(data);
        this.aiInfo.BombsCount = this.aiInfo.Bombs.length;
      } catch (e) {
        console.error(e);
        this.newGame();
        return
      }
    } else {
      this.newGame();
    }



    if (saveStateElement) {
      saveStateElement.value = saveStateNameValue;
    }

    this.updateSaveStatesList(saveStateNameValue)

    this.updateInternalData();
  },

  updateSaveStatesList(currentSaveStateName: string) {
    const saveStatesElement: HTMLSelectElement | null = document.getElementById('save-states-list') as HTMLSelectElement;
    if (saveStatesElement) {
      const sortedList = []

      saveStatesElement.innerHTML = '';

      if (localStorage.length === 0) {
        sortedList.push('default');
      }

      for (let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i);
        if (key && key.startsWith('save-state_')) {
          sortedList.push(key.substr(11));
        }
      }
      sortedList.sort().forEach((key) => {
        let option = document.createElement('option');
        option.value = key;
        option.textContent = key;
        saveStatesElement.appendChild(option);
      });

      if (currentSaveStateName) {
        saveStatesElement.value = currentSaveStateName;
      }
    }
  },

  updateInternalData() {
    let pre: Element | null = document.getElementById('internal-data');
    let showInternal: HTMLInputElement | null = document.getElementById('data-toggle') as HTMLInputElement;

    if (!pre || !showInternal) {
      return;
    }

    if (showInternal.checked) {

      return pre.innerHTML = JSON.stringify(this.aiInfo, (key, value) => {
        if (key === 'Field') {
          // als 2d kompaklte matrix anzeigen
          let result: string[] = [''];
          for (let y = 0; y < value[0].length; y++) {
            let row = value.map((f: any[]) => {
              return f[y].toString().padStart(3, " ")
            });
            result.push(row.join(""));
          }
          return result.join('<br>');
        }
        return value;
      }, 2);

    }

    pre.textContent = save.save(this.aiInfo);
  },

  setAutoSave(event: Event | null, setChecked: boolean | null = null) {
    let autoSave: HTMLInputElement | null = document.getElementById('auto-save') as HTMLInputElement;
    let saveStateElement: HTMLInputElement | null = document.getElementById('save-state-name') as HTMLInputElement;

    if (!autoSave) {
      return;
    }

    if (autoSave.checked || setChecked === true) {
      saveStateElement.disabled = true;
      clearInterval(this.saveIntervall);
      this.saveIntervall = setInterval(() => this.saveToLocalStorage(true), 1000);
    } else {
      saveStateElement.disabled = false;
      clearInterval(this.saveIntervall);
    }
  },


  init() {
    sessionStorage.tabID = sessionStorage.tabID || Math.random()

    this.loadFromLocalStorage();

    setTimeout(() => {
      this.setAutoSave(null, true)
    }, 1)

    this.createGameBoard()

    this.initAis()
  }

}
