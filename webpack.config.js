const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    module: {
        loaders: [
            {
                test: /(\.jsx|\.js)$/,
                loader: 'babel-loader',
            }, {
                test: /\.svg$/,
                use: [
                    '@svgr/webpack',
                ],
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
