import path from 'path';
import { screen, BrowserWindow, BrowserWindowConstructorOptions } from 'electron';
import Store from 'electron-store';
import { ICON_PATH } from '../utils/constants';

type Dimensions = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const createWindow = (windowName: string, options: BrowserWindowConstructorOptions): BrowserWindow => {
  const key = 'window-state';
  const name = `window-state-${windowName}`;
  const store = new Store({ name });
  const defaultSize = {
    width: options.width,
    height: options.height,
  };
  let state = {};

  const restore = () => store.get(key, defaultSize) as Dimensions | undefined;

  const windowWithinBounds = (windowState: Dimensions, bounds: Dimensions) => {
    return (
      windowState.x >= bounds.x &&
      windowState.y >= bounds.y &&
      windowState.x + windowState.width <= bounds.x + bounds.width &&
      windowState.y + windowState.height <= bounds.y + bounds.height
    );
  };

  const resetToDefaults = () => {
    const bounds = screen.getPrimaryDisplay().bounds;
    return Object.assign({}, defaultSize, {
      x: (bounds.width - defaultSize.width) / 2,
      y: (bounds.height - defaultSize.height) / 2,
    });
  };

  const ensureVisibleOnSomeDisplay = (windowState: Dimensions) => {
    const visible = screen.getAllDisplays().some((display: { bounds: Dimensions }) => {
      return windowWithinBounds(windowState, display.bounds);
    });
    if (!visible) {
      // Window is partially or fully not visible now.
      // Reset it to safe defaults.
      return resetToDefaults();
    }
    return windowState;
  };

  state = ensureVisibleOnSomeDisplay(restore());

  const browserOptions: BrowserWindowConstructorOptions = {
    ...options,
    ...state,
    webPreferences: {
      ...options.webPreferences,
      preload: path.join(__dirname, '../app/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webSecurity: false,
    },
    frame: true,
    autoHideMenuBar: true,
    icon: ICON_PATH,
  };

  const getCurrentPosition = () => {
    const position = window.getPosition();
    const size = window.getSize();
    return {
      x: position[0],
      y: position[1],
      width: size[0],
      height: size[1],
    };
  };

  const saveState = () => {
    if (!window.isMinimized() && !window.isMaximized()) {
      Object.assign(state, getCurrentPosition());
    }
    store.set(key, state);
  };

  const window = new BrowserWindow(browserOptions);

  window.on('close', saveState);
  window.setAlwaysOnTop(false, 'normal');

  return window;
};

export default createWindow;
