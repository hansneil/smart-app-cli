/**
 * @file page.js
 * @author hansneil
 */

const program = require('commander');
const path = require('path');
const prompt = require('inquirer').prompt;
const Metalsmith = require('metalsmith');
const Handlebars = require('handlebars');
const git = require('../utils/git');
const fse = require('fs-extra');

const option = program.parse(process.argv).args[1];
const defaultName = typeof option === 'string' ? option : 'index';

const oldName = 'page';

function getPromptQuestions(name, email) {
    return [
        {
            type: 'input',
            name: 'filename',
            message: 'Filename',
            default: defaultName,
            filter(val) {
                return val.trim();
            },
            validate(val) {
                val = val.trim();
                const validate = val.split(' ').length === 1;
                if (validate) {
                    const jsonPath = path.join(process.cwd(), 'pages', val);
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
        },
        {
            type: 'input',
            name: 'barTitle',
            message: '页面标题',
            default: '子页面标题',
            filter(val) {
                return val.trim();
            },
            validate(val) {
                return true;
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

        return prompt(promptQuestions).then(res => {
            let promise = new Promise((resolve, reject) => {
                Metalsmith(path.join(__dirname, '../../'))
                .source('./templates/page')
                .destination(path.join(process.cwd(), 'pages/', res.filename))
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
                        console.log('页面创建成功');
                        resolve(`pages/${res.filename}/${res.filename}`);
                    }
                });
            });

            return promise;
        });
    }).then(createPath => {
        const cwd = process.cwd();
        const jsonPath = path.join(cwd, 'app.json');
        let appJson = fse.readJSONSync(jsonPath);
        appJson.pages = appJson.pages.concat(createPath);
        fse.outputJsonSync(jsonPath, appJson, {
            spaces: 4
        });
    });
};
