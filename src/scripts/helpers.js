const hbs = require('hbs')
module.exports = () => {
    hbs.registerPartials(__dirname + '/src/views/partials')
    hbs.registerHelper('prettyDate', (date) => {
        return date.getDate() + '/' + date.getMonth() + '/' + date.getFullYear()
    })
    hbs.registerHelper('drawPath', (url) => {
        return '/d/' + url
    })
    hbs.registerHelper('upPath', (index) => {
        return '/d/upload/' + index
    })
    hbs.registerHelper('imPath', (index) => {
        return '/d/imload/' + index
    })
    hbs.registerHelper('dPath', (index) => {
        return '/d/dload/' + index
    })
}