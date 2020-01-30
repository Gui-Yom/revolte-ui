const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
    entry: "./src/index.js",
    devServer: {
        contentBase: "public",
    },
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "public"),
        publicPath: "public/"
    },
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin()]
    },
    module: {
        rules: [
            {
                test: /\.hbs$/,
                use: [{
                    loader: "handlebars-loader"
                }]
            },
            {
                test: /\.ico$/,
                use: [{
                    loader: "static-files-loader"
                }]
            },
            {
                test: /\.(scss)$/,
                use: [{
                    loader: 'style-loader', // inject CSS to page
                }, {
                    loader: 'css-loader', // translates CSS into CommonJS modules
                }, {
                    loader: 'postcss-loader', // Run postcss actions
                    options: {
                        plugins: function () { // postcss plugins, can be exported to postcss.config.js
                            return [
                                require('autoprefixer')
                            ];
                        }
                    }
                }, {
                    loader: 'sass-loader' // compiles Sass to CSS
                }]
            }
        ]
    },
    plugins: [
        new CopyWebpackPlugin([
            {from: "./favicon.ico", to: "favicon.ico"},
            {from: "./views/legal.html", to: "legal.html"},
            {from: "./views/index.html", to: "index.html"}
        ])
    ]
};