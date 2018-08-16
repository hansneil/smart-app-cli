/**
 * @file git.js
 * @author hansneil
 */

let exec = require('child_process').exec;

module.exports = function () {
    return Promise.all([
        'git config --get user.name',
        'git config --get user.email'
    ].map(function (cmd) {
        return new Promise(function (resolve) {
            exec(cmd, {
                cwd: __dirname
            }, function (error, stdout, stderr) {
                if (error) {
                    throw error;
                }

                resolve(stdout.trim());
            });
        });
    })).then(function (info) {
        return {
            name: info[0],
            email: info[1]
        };
    });
};
