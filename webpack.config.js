const webpack = require('webpack');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebPackPlugin = require('html-webpack-plugin');

const path = require('path');

require('dotenv').config();

module.exports = (env, argv) => ({
    entry: {
        'main': './src/index.ts',
        'documents/documents': './src/documents/index.ts',
        'editor/editor': './src/editor/index.tsx'
    },
    output: {
        path: path.join(__dirname, argv.mode === 'production' ? 'dist' : 'dist_dev')
    },
    devServer: {
        contentBase: argv.mode === 'production' ? './dist' : './dist_dev'
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'awesome-typescript-loader'
                }
            },
            {
                test: /\.html$/,
                use: {
                    loader: 'html-loader',
                    options: { minimize: true }
                }
            },
            {
                test: /\.sass$/,
                use: [
                    MiniCssExtractPlugin.loader, {
                        loader: 'css-loader'
                    }, {
                        loader: 'sass-loader'
                    }
                ]
            },
            {
                test: /\.elm$/,
                use: {
                    loader: 'elm-webpack-loader?verbose=true&warn=true'
                }
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.elm']
    },
    plugins: [
        new webpack.DefinePlugin({
            SERIATIM_SERVER_URL: JSON.stringify(argv.mode == 'production' ? process.env.PROD_SERVER_URL : process.env.DEV_SERVER_URL),
            SERIATIM_CLIENT_URL: JSON.stringify(argv.mode == 'production' ? process.env.PROD_CLIENT_URL : process.env.DEV_CLIENT_URL)
        }),
        new HtmlWebPackPlugin({
            template: './src/index.html',
            filename: './index.html',
            favicon: './src/favicon.ico',
            inject: true,
            chunks: ['main']
        }),
        new HtmlWebPackPlugin({
            template: './src/documents/index.html',
            filename: './documents/index.html',
            favicon: './src/favicon.ico',
            inject: true,
            chunks: ['documents/documents']
        }),
        new HtmlWebPackPlugin({
            template: './src/editor/index.html',
            filename: './editor/index.html',
            favicon: './src/favicon.ico',
            inject: true,
            chunks: ['editor/editor']
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css'
        })
    ]
});