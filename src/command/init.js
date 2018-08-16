const program = require('commander');
const path = require('path');
const {prompt} = require('inquirer');
const Metalsmith = require('metalsmith');
const Handlebars = require('handlebars');

const option = program.parse(process.argv).args[1];
const defaultName = typeof option === 'string' ? option : 'swan-project';

const questions = [
    {
        type: 'input',
        name: 'name',
        message: 'Project name',
        default: defaultName,
        filter(val) {
            return val.trim();
        },
        validate(val) {
            const validate = (val.trim().split(' ').length) === 1;
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
    }
];

module.exports = () => {
    prompt(questions).then(res => {
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
                    console.log('创建成功，请在开发者工具中打开');
                }
            });
    });
}