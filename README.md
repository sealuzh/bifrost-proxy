# BiFrost-Proxy

### Requirements
* [NodeJS](https://nodejs.org/en/) > 4.2.*
* [Gulp](http://gulpjs.com/)

### Usage
After cloning the project, make sure you have installed gulp in your global npm (`npm install -g gulp`).

1. `npm install` to setup dependencies
2. `npm start [HOSTNAME] [PORT]` to run the proxy, telling him which Port/Hostname he should proxy.

The proxy will listen on `localhost:[PORT]`, the REST-API on `localhost:9090/api/v1`.