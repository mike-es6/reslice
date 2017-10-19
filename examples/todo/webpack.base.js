// Base file for webpack configurations.
//
// Note that all "values" are accessed as functions, so that any global
// variables (like __dirname) are correct when the code is executed rather
// than when imported. In most cases this is not an issue, but for consistency
// all are functions.
//
var path                     = require('path') ;
var webpack                  = require('webpack') ;

module.exports = {

    rules: {

        js: function () {
                //
                // ES2015, JSX, etc. transpile
                //
                return {
                    test: /\.js$/,
                    loader: 'babel-loader',
                    exclude: /node_modules/,
                    query: {
                        presets: [
                            'es2015'
                            ],
                        plugins: [
                            'transform-class-properties',
                            'transform-react-jsx',
                            'transform-object-rest-spread'
                            ],
                        cacheDirectory: true
                        }
                    } ;
                },

        cover: function () {
                //
                // Coverage instrumentation. see:
                // http://zinserjan.github.io/mocha-webpack/index.html
                //
                return {
                    test: /\.js$/,
                    include: path.resolve('src'),
                    loader: 'istanbul-instrumenter-loader'
                    } ;
                }
        },

    plugins: {

        uglify: function () {
            //
            // Minification
            //
            return new webpack.optimize.UglifyJsPlugin({
                sourceMap: true,
                compress: {
                    warnings: false
                    },
                prefix: 'relative'
                }) ;
            },

        env: function () {
            //
            // Map NODE_ENV into process.env
            //
            return new webpack.EnvironmentPlugin(['NODE_ENV']) ;
            },
        },

    alias: function () {
        return {
            } ;
        },

    entry: function () {
            //
            // Bundles to build. Output
            //
            return {
                'index': './src/index.js',
                } ;
            },

    output: function (suffix) {
            //
            // Output to react/js with files and source maps named
            // by the the entry name. For use in IDEs, it may be
            // neccessary to use 'absolute-resource-path'.
            //
            if (!suffix)
                suffix = "" ;
            return {
                filename: '[name]' + suffix +'.js',
                sourceMapFilename: '[name]' + suffix + '.js.map',
                path: path.resolve(__dirname, '.'),
                devtoolModuleFilenameTemplate: '[resource-path]',
                devtoolFallbackModuleFilenameTemplate: '[resource-path]?[hash]'
                } ;
            }
    } ;
