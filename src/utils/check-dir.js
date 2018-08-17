/**
 * @file check dir
 * @author hansneil
 */

const fse = require('fs-extra');
const path = require('path');
const prompt = require('inquirer').prompt;

const {log, chalk} = require('./log');

module.exports = dir => {
    const pagePath = path.join(process.cwd(), dir);

    const promise = new Promise((resolve, reject) => {
        if (!fse.pathExistsSync(pagePath)) {
            log(chalk.red(`未在当前目录下找到 ${dir} 子目录，请确保在小程序根目录下`));
            prompt([{
                type: 'confirm',
                name: 'needCreateDir',
                message: `Create ./${dir} dir?`,
                default: false
            }]).then(answer => {
                if (answer.needCreateDir) {
                    resolve();
                }
                else {
                    reject();
                }
            });
        }
        else {
            resolve();
        }
    });

    return promise;
};
