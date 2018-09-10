const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const md5 = require('md5');

module.exports = {
    module: {
        loaders: [
            {
                test: /(\.jsx|\.js)$/,
                loader: 'babel-loader',
            }, {
                test: /\.svg$/,
                use: ({ resource }) => ({
                    loader: '@svgr/webpack',
                    options: {
                        svgoConfig: {
                            plugins: [{
                                cleanupIDs: {
                                    prefix: `awb-${md5(resource)}-`,
                                },
                            }],
                        },
                    },
                }),
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
