const webpack = require('webpack');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebPackPlugin = require('html-webpack-plugin');

const path = require('path');

require('dotenv').config();

module.exports = (env, argv) => ({
    entry: {
        'main': './src/index.tsx',
        'app': './src/200.tsx',
        'editor/editor': './src/editor/index.tsx',
        'privacy/privacy': './src/privacy/index.ts'
    },
    output: {
        path: path.join(__dirname, argv.mode === 'production' ? 'dist' : 'dist_dev'),
        publicPath: '/'
    },
    devServer: {
        contentBase: argv.mode === 'production' ? './dist' : './dist_dev',
        historyApiFallback: {
            index: '/200.html'
        }
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'ts-loader',
                    options: { appendTsSuffixTo: [/\.vue$/] }
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
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader, {
                        loader: 'css-loader'
                    }
                ]
            },
            {
                test: /\.elm$/,
                use: {
                    loader: 'elm-webpack-loader',
                    options: {
                        verbose: true,
                        optimize: argv.mode == 'production'
                    }
                }
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        publicPath: '/assets',
                        outputPath: 'assets/'
                    }
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
            SERIATIM_CLIENT_URL: JSON.stringify(argv.mode == 'production' ? process.env.PROD_CLIENT_URL : process.env.DEV_CLIENT_URL),
            SERIATIM_EDIT_URL: JSON.stringify(argv.mode == 'production' ? process.env.PROD_EDIT_URL : process.env.DEV_EDIT_URL),
            SERIATIM_TWITTER_KEY: process.env.SERIATIM_TWITTER_KEY,
            SERIATIM_TWITTER_SECRET: process.env.SERIATIM_TWITTER_SECRET,
        }),
        new HtmlWebPackPlugin({
            template: './src/index.html',
            filename: './index.html',
            favicon: './src/favicon.ico',
            inject: true,
            chunks: ['main']
        }),
        new HtmlWebPackPlugin({
            template: './src/200.html',
            filename: './200.html',
            favicon: './src/favicon.ico',
            inject: true,
            chunks: ['app']
        }),
        new HtmlWebPackPlugin({
            template: './src/privacy/index.html',
            filename: './privacy/index.html',
            favicon: './src/favicon.ico',
            inject: true,
            chunks: ['privacy/privacy']
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