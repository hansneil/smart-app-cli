/**
 * @file user.js
 * @author zhanghui33
 */

const path = require('path');
const fse = require('fs-extra');
const git = require('./git');
const configDir = path.join(__dirname, '../../config.json');

module.exports.get = async () => {
    let user;

    try {
        user = await git();
    } 
    catch (error) {
        const config = fse.readJsonSync(configDir);
        user = config.user;
        if (!user.name || !user.email) {
            user = config.default; 
        }
    }

    return user;
};

module.exports.set = (prop, value) => {
    let config = fse.readJsonSync(configDir);
    if (typeof value=== 'string' && value.length > 0) {
        config['user'][prop] = value;
        fse.writeJsonSync(configDir, config, {spaces: '\t'});
    }
};