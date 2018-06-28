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
    externals: {
        react: 'React',
        'react-dom': 'ReactDOM',
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
