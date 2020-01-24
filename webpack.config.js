const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = (env) => {
    const pageId = (env && env.pageId) || "123456789";
    const apiHost = (env && env.apiUrl) || "127.0.0.1";
    console.log("Page ID: " + pageId);
    console.log("API host: " + apiHost);
    return {
        entry: "./src/index.js",
        devServer: {
            contentBase: "public",
        },
        output: {
            filename: "bundle.js",
            path: path.resolve(__dirname, "public"),
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
            new HtmlWebpackPlugin({
                // NOTE if you pass plain object it will be passed as is. no default values there, so be aware!
                // for implementation detail, please see index.js and search for "userOptions" variable
                templateParameters: (compilation, assets, assetTags, options) => {
                    return {
                        compilation,
                        webpackConfig: compilation.options,
                        htmlWebpackPlugin: {
                            tags: assetTags,
                            files: assets,
                            options
                        },
                        "pageId": pageId,
                        "apiHost": apiHost
                    };
                },
                template: "./views/index.hbs"
            }),
            new CopyWebpackPlugin([
                {from: "./favicon.ico", to: "favicon.ico"},
                {from: "./views/legal.html", to: "legal.html"}
            ])
        ]
    }
};