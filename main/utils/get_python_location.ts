import {exec} from 'child_process';
import {logger } from '../logger';

//get python location for non win32 systems to allow using python scripts
const getPythonLocation = async (): Promise<string> => {
    logger.info('Determining python path for darwin/linux systems!');
    let PYTHON_PATH = null;
    return new Promise<string>((resolve, reject) => {
        exec('which python3', (error, stdout, stderr) => {
            if(error){
                logger.error(error);
                reject(error);
            }
            if(stderr){
                logger.error(`Error occured : ${stderr}`);
                reject(stderr);
            }
            if(stdout){
                PYTHON_PATH = stdout.trim().toString();
                logger.info(`Python3 location found in ${PYTHON_PATH}!`);
                resolve(PYTHON_PATH);
            }
        });
    });
}

export { getPythonLocation };
