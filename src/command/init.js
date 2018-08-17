/**
 * @file init.js
 * @author hansneil
 */

const program = require('commander');
const path = require('path');
const prompt = require('inquirer').prompt;
const Metalsmith = require('metalsmith');
const Handlebars = require('handlebars');
const fse = require('fs-extra');

const git = require('../utils/git');
const {log, chalk} = require('../utils/log');

const option = program.parse(process.argv).args[1];
const defaultName = typeof option === 'string' ? option : 'swan-project';

function getPromptQuestions(name, email) {
    return [
        {
            type: 'input',
            name: 'name',
            message: 'Project name',
            default: defaultName,
            filter(val) {
                return val.trim();
            },
            validate(val) {
                val = val.trim();
                const validate = val.split(' ').length === 1;
                if (validate) {
                    const jsonPath = path.join(process.cwd(), val);
                    return !fse.pathExistsSync(jsonPath) || `A project named ${val} has already existed.`;
                }
                return validate || 'Project name is not allowed to have spaces';
            },
            transformer(val) {
                return val;
            }
        },
        {
            type: 'input',
            name: 'appid',
            message: 'App ID(智能小程序ID)',
            default: 'test',
            filter(val) {
                return val.trim();
            },
            validate(val) {
                return true;
            },
            transformer(val) {
                return val;
            }
        },
        {
            type: 'input',
            name: 'appName',
            message: 'App Name(小程序名称)',
            default: '小程序示例',
            filter(val) {
                return val.trim();
            },
            validate(val) {
                return true;
            },
            transformer(val) {
                return val;
            }
        },
        {
            type: 'input',
            name: 'author',
            message: 'author',
            default: name,
            filter(val) {
                return val.trim();
            },
            validate(val) {
                const validate = val.trim().length > 0;
                return validate || 'Please input author name';
            },
            transformer(val) {
                return val;
            }
        },
        {
            type: 'input',
            name: 'email',
            message: 'email',
            default: email,
            filter(val) {
                return val.trim();
            },
            validate(val) {
                const validate = val.trim().length > 0;
                return validate || 'Please input email address';
            },
            transformer(val) {
                return val;
            }
        }
    ];
}

module.exports = () => {
    git().then(({name, email}) => {
        let promptQuestions = getPromptQuestions(name, email);

        prompt(promptQuestions).then(res => {
            Metalsmith(path.join(__dirname, '../../'))
                .source('./templates/project')
                .destination(path.join(process.cwd(), res.name))
                .metadata(res)
                .use((files, metalsmith, done) => {
                    const meta = metalsmith.metadata();
                    Object.keys(files).forEach(filename => {
                        if (filename.indexOf('images') > -1) {
                            return;
                        }
                        const t = files[filename].contents.toString();
                        files[filename].contents = Buffer.from(Handlebars.compile(t)(meta));
                    });
                    done();
                }).build(err => {
                    if (err) {
                        console.error(err);
                    }
                    else {
                        log(chalk.green('^.^ 创建成功，请在开发者工具中打开'));
                        log(chalk.green(`\n\t cd ${res.name}`));
                        log(chalk.green('\t swan create-page (新增页面)'));
                        log(chalk.green('\t swan create-component (新增组件)'));
                    }
                });
        });
    });
};
