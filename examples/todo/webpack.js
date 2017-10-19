// Webpack configuration used when running the unit test cases.
//
var base      = require('./webpack.base') ;

process.env.NODE_ENV = 'development';

module.exports = {

    entry : base.entry (),
    output: base.output(""),

    module: {
        rules: [
            base.rules.js(),
            ]
        },
    plugins: [
        base.plugins.env   (),
        ],

    target: 'node',
    resolve: {
        unsafeCache: true,
        alias: base.alias(),
        },
    devtool: 'source-map',
    node: {
        fs: 'empty',
        },
    } ;
