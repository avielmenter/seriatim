# Seriatim
A web application for creating outlines.

# About
Seriatim is a web application for writing outlines. Seriatim was originally designed for taking law school notes, although nothing about the application requires that the outlines be used for this purpose.

This repository contains only the code for the Seriatim front-end website and editor application. The code for the server can be found in the [seriatim-server](https://github.com/avielmenter/seriatim-server) repository.

Seriatim is currently in early development. It is not a complete application.

## Try It!
You can try the most recent working version of Seriatim at [seriatim.io](https://seriatim.io). Note that Seriatim is still in early development. As such, many basic features are still unimplemented, and your saved data may be lost as development continues.

# Setup
If you want to download and run Seriatim yourself, you can do so by following these steps:

## Prerequisites
To run this project, you must already have installed the most recent version of [npm](https://www.npmjs.com/get-npm).

## Environment Variables
Before you compile Seriatim, you must configure the following environment variables:

 - `PROD_CLIENT_URL`: The URL (including a trailing `'/'`) at which Seriatim will be accessed.
 - `PROD_SERVER_URL`: The URL (including a trialing `'/'`) at which the [Seriatim server](https://github.com/avielmenter/seriatim-server) can be accessed.

 You can configure these environment variables by placing a `.env` file in Seriatim's root directory before compilation.
 
 A `template.env` file has been provided which contains the necessary environment variables. This file also contains the `DEV_CLIENT_URL` and `DEV_SERVER_URL` variables, which you can configure if you wish to compile and run Seriatim in development mode.

## Compilation
To compile the Seriatim front-end, perform the following steps:

1. Clone this repository using the command `git clone https://github.com/avielmenter/seriatim.git`
2. Navigate to the `seriatim` folder.
3. Run the command `npm install`.

## Run
To run the application, navigate to the `seriatim` folder and run the command `npm start`.

## Development Mode
The above instructions will compile and run Seriatim in production mode. If you instead wish to use Seriatim in development mode, you can compile and run Seriatim using the command `npm run start:dev`.

# License
This project is licensed under the [MIT License](https://github.com/avielmenter/seriatim/blob/master/LICENSE).