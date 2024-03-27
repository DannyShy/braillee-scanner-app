import { PYTHON_EXE } from './constants';

let pythonExecutable: string;

if (process.platform === 'win32') {
  pythonExecutable = PYTHON_EXE;
} else {
  pythonExecutable = 'python3.11';
}

export { pythonExecutable };
