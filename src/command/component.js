/**
 * @file component.js
 * @author hansneil
 */

const program = require('commander');
const path = require('path');
const prompt = require('inquirer').prompt;
const Metalsmith = require('metalsmith');
const Handlebars = require('handlebars');
const fse = require('fs-extra');

const git = require('../utils/git');
const checkDir = require('../utils/check-dir');
const {log, chalk} = require('../utils/log');

// 默认工程名
const DEFAULT_NAME = 'component';

const option = program.parse(process.argv).args[1];
const defaultName = typeof option === 'string' ? option : DEFAULT_NAME;

const oldName = 'component';

function getPromptQuestions(name, email) {
    return [
        {
            type: 'input',
            name: 'filename',
            message: 'Filename',
            default: defaultName,
            when() {
                return defaultName === DEFAULT_NAME;
            },
            filter(val) {
                return val.trim();
            },
            validate(val) {
                val = val.trim();
                const validate = val.split(' ').length === 1;
                if (validate) {
                    const jsonPath = path.join(process.cwd(), 'components', val);
                    return !fse.pathExistsSync(jsonPath) || `A file named ${val} has already existed.`;
                }
                return 'Filename is not allowed to have spaces';
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
    checkDir('components').then(() => {
        git().then(({name, email}) => {
            let promptQuestions = getPromptQuestions(name, email);

            prompt(promptQuestions).then(res => {
                Metalsmith(path.join(__dirname, '../../'))
                .source('./templates/component')
                .destination(path.join(process.cwd(), 'components', res.filename))
                .metadata(res)
                .use((files, metalsmith, done) => {
                    const meta = metalsmith.metadata();
                    Object.keys(files).forEach(filename => {
                        const t = files[filename].contents.toString();
                        files[filename].contents = Buffer.from(Handlebars.compile(t)(meta));

                        let newFilename = filename.replace(oldName, res.filename);
                        if (newFilename === filename) {
                            return;
                        }

                        files[newFilename] = files[filename];
                        delete files[filename];
                    });
                    done();
                }).build(err => {
                    if (err) {
                        console.error(err);
                    }
                    else {
                        log(chalk.green('自定义组件创建成功'));
                    }
                });
            });
        });
    }, () => {
        log(chalk.yellow('create component aborted'));
    });
};
