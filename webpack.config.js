const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    module: {
        loaders: [
            {
                test: /(\.jsx|\.js)$/,
                loader: 'babel-loader',
            },
        ],
    },
    plugins: [
        new UglifyJsPlugin({
            uglifyOptions: {
                output: {
                    comments: /^!/,
                },
            },
        }),
    ],
};
