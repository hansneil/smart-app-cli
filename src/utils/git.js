/**
 * @file git.js
 * @author hansneil
 */

let exec = require('child_process').exec;

module.exports = () => {
    return Promise.all([
        'git config --get user.name',
        'git config --get user.email'
    ].map(cmd => {
        return new Promise(resolve => {
            exec(cmd, {
                cwd: __dirname
            }, (error, stdout, stderr) => {
                if (error) {
                    throw error;
                }

                resolve(stdout.trim());
            });
        });
    })).then(([name, email]) => {
        return {
            name,
            email
        };
    });
};
