import { OWGames, OWGamesEvents, OWHotkeys } from "@overwolf/overwolf-api-ts";

import { AppWindow } from "../AppWindow";
import { kHotkeys, kWindowNames, kGamesFeatures } from "../consts";
import WindowState = overwolf.windows.WindowStateEx;

// The window displayed in-game while a game is running.
// It listens to all info events and to the game events listed in the consts.ts file
// and writes them to the relevant log using <pre> tags.
// The window also sets up Ctrl+F as the minimize/restore hotkey.
// Like the background window, it also implements the Singleton design pattern.

//GLOBALS
const MIN_STACK_TIME = 40;
const MAX_STACK_TIME = 52;
const STACK_MESSAGE = "STACK";
const WARD_MESSAGE = "OBS IS AVAILABLE";
const MIN_ROSHAN_SPAWN = 480;
const MAX_ROSHAN_SPAWN = 660;

class InGame extends AppWindow {
  private static _instance: InGame;
  private _gameEventsListener: OWGamesEvents;
  private _stackLog: HTMLElement;
  private _wardUpdates: HTMLElement;
  private _buybackUpdates: HTMLElement;

  private currentTime: number;
  private minRoshSpawn: number;
  private maxRoshSpawn: number;
  private isLategame = false;

  //#region sounds
  private obsSound = new Audio("../../sounds/Obs.mp3");
  private stackSound = new Audio("../../sounds/stack.wav");
  private roshSound = new Audio("../../sounds/roshan.mp3");
  private roshMaxSound = new Audio("../../sounds/roshan2.mp3");
  private bkbSound = new Audio("../../sounds/bkb.mp3");
  //#endregion

  private constructor() {
    super(kWindowNames.inGame);

    this._stackLog = document.getElementById("stackLog");
    this._wardUpdates = document.getElementById("wardUpdates");
    this._buybackUpdates = document.getElementById("buybackUpdates");

    this.setToggleHotkeyBehavior();
    this.setToggleHotkeyText();
  }

  public playSound(sound) {
    sound.play();
  }

  public static instance() {
    if (!this._instance) {
      this._instance = new InGame();
    }

    return this._instance;
  }

  public async run() {
    const gameClassId = await this.getCurrentGameClassId();

    const gameFeatures = kGamesFeatures.get(gameClassId);

    if (gameFeatures && gameFeatures.length) {
      this._gameEventsListener = new OWGamesEvents(
        {
          onInfoUpdates: this.onInfoUpdates.bind(this),
          onNewEvents: this.onNewEvents.bind(this),
        },
        gameFeatures
      );

      this._gameEventsListener.start();
    }
  }

  private onInfoUpdates(info) {
    // this.logLine(this._wardUpdates, info, false);
  }

  // Special events will be highlighted in the event log
  private onNewEvents(e) {
    e.events.some((event) => {
      switch (event.name) {
        case "clock_time_changed":
          this.stackNotification(e);
          this.roshNotification(e);
          break;
        case "ward_purchase_cooldown_changed":
          this.wardNotification(e);
          break;
        case "hero_item_changed":
          this.isAegis(e);
          break;
        case "hero_item_cooldown_changed":
          this.bkbNotification(e);
          break;
      }
    });
  }

  //#region stack and wards
  private stackNotification(e) {
    this.currentTime = JSON.parse(e.events[0].data).clock_time;
    const clocktime = this.currentTime % 60;
    if (clocktime == MIN_STACK_TIME) {
      this.playSound(this.stackSound);
    }
    if (clocktime >= MIN_STACK_TIME && clocktime <= MAX_STACK_TIME) {
      this.logLine(this._stackLog, STACK_MESSAGE, "red");
    } else {
      this.logLine(this._stackLog, clocktime + "", "lightBlue");
    }
  }
  private wardNotification(e) {
    const wardCooldown = JSON.parse(e.events[0].data).ward_purchase_cooldown;
    if (wardCooldown == 0) {
      this.logLine(this._wardUpdates, WARD_MESSAGE, "lightBlue");
      this.playSound(this.obsSound);
    }
  }
  //#endregion

  //#region aegis and bkb stuff
  private isAegis(e) {
    if (JSON.parse(e.events[0].data).name == "item_aegis") {
      console.log("it do be aegis");
      this.minRoshSpawn = this.currentTime + MIN_ROSHAN_SPAWN;
      this.maxRoshSpawn = this.currentTime + MAX_ROSHAN_SPAWN;
      console.log(this.minRoshSpawn, this.maxRoshSpawn);
    }
  }
  private roshNotification(e) {
    if (JSON.parse(e.events[0].data).clock_time == this.minRoshSpawn) {
      this.playSound(this.roshSound);
    } else if (JSON.parse(e.events[0].data).clock_time == this.maxRoshSpawn) {
      this.playSound(this.roshMaxSound);
    }
  }

  private bkbNotification(e) {
    console.log(JSON.parse(e.events[0].data));

    if (JSON.parse(e.events[0].data).name == "item_black_king_bar") {
      if (JSON.parse(e.events[0].data).can_cast == true)
        this.playSound(this.bkbSound);
    }
  }
  //#endregion

  //#region window stuffs
  // Displays the toggle minimize/restore hotkey in the window header
  private async setToggleHotkeyText() {
    const gameClassId = await this.getCurrentGameClassId();
    const hotkeyText = await OWHotkeys.getHotkeyText(
      kHotkeys.toggle,
      gameClassId
    );
    const hotkeyElem = document.getElementById("hotkey");
    hotkeyElem.textContent = hotkeyText;
  }

  // Sets toggleInGameWindow as the behavior for the Ctrl+F hotkey
  private async setToggleHotkeyBehavior() {
    const toggleInGameWindow = async (
      hotkeyResult: overwolf.settings.hotkeys.OnPressedEvent
    ): Promise<void> => {
      console.log(`pressed hotkey for ${hotkeyResult.name}`);
      const inGameState = await this.getWindowState();

      if (
        inGameState.window_state === WindowState.NORMAL ||
        inGameState.window_state === WindowState.MAXIMIZED
      ) {
        this.currWindow.minimize();
      } else if (
        inGameState.window_state === WindowState.MINIMIZED ||
        inGameState.window_state === WindowState.CLOSED
      ) {
        this.currWindow.restore();
      }
    };

    OWHotkeys.onHotkeyDown(kHotkeys.toggle, toggleInGameWindow);
  }

  // Appends a new line to the specified log
  private logLine(log: HTMLElement, data, color: string) {
    const line = document.createElement("h1");
    line.textContent = JSON.stringify(data);

    line.className = color;

    // Check if scroll is near bottom
    const shouldAutoScroll =
      log.scrollTop + log.offsetHeight >= log.scrollHeight - 10;

    log.appendChild(line);

    if (shouldAutoScroll) {
      log.scrollTop = log.scrollHeight;
    }
  }

  private async getCurrentGameClassId(): Promise<number | null> {
    const info = await OWGames.getRunningGameInfo();

    return info && info.isRunning && info.classId ? info.classId : null;
  }
  //#endregion
}

InGame.instance().run();
