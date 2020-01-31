const development = require('./development')
const test = require('./test')
const production = require('./product')
const pre = require('./pre')

module.exports = {
    development,
    pre,
    test,
    production
}[process.env.NODE_ENV || 'development']
