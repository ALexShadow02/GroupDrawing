const path = require('path')
module.exports = {
    entry : './jsx/app.jsx',
    output : {
        path : path.join(__dirname, 'dist'),
        filename : 'bundle.js'
    },
    module : {
        rules : [
            {
                test: /\.jsx?$/, 
                exclude: /(node_modules)/, 
                loader: 'babel-loader'
            }
        ]
    }
}