[![Build Status](https://travis-ci.org/ItsAsbreuk/COMPONENT_NAME.svg?branch=master)](https://travis-ci.org/ItsAsbreuk/COMPONENT_NAME)

File upload-button for react, without input-element.

With progress-status, abortable and CORS enabled.
Support for IE8+

## How to use:

```js
"use strict";

const React = require("react"),
    ReactDOM = require("react-dom"),
    FileUploadButton = require("./lib/component-styled.jsx");

const props = {
    url: "http://somedomain.com/procesimage",
    buttonText: "Select File",
    multipleFiles: false,
    errorMsg: "you can only select a png-file",
    helpText: "png-files only",
    markRequired: true,
    maxFileSize: 5*1024*1024, // 5mb
    onFileChange: function(e) {
        props1.validated = (e.target.getFiles()[0].type==="image/png");
        renderUploadBtn();
        propsMsg.msg = "";
        renderMsg();
    },
    onProgress: function(data) {
        propsMsg.msg = Math.round(100*data.loaded/data.total)+"%";
        renderMsg();
    },
    onSuccess: function() {
        propsMsg.msg = "ready!";
        renderMsg();
    },
    onError: function(msg) {
        propsMsg.msg = "Error "+msg;
        renderMsg();
    }
};

const propsMsg = {
    msg: ""
};

const Msg = React.createClass({
    render() {
        return (
            <div>{this.props.msg}</div>
        );
    }
});

var renderUploadBtn = function() {
    ReactDOM.render(
        <FileUploadButton {...props1} />,
        document.getElementById("component-container")
    );
};

var renderMsg = function() {
    ReactDOM.render(
        <Msg {...propsMsg} />,
        document.getElementById("message-container")
    );
};

renderUploadBtn();
renderMsg();
```

## About the css

You need the right css in order to make use of `itsa-react-fileuploadbutton`. There are 2 options:

1. You can use the css-files inside the `css`-folder, AND use the css-files of `itsa-react-button`/css
2. You can use: `Component = require("itsa-react-fileuploadbutton/lib/component-styled.jsx");` and build your project with `webpack`. This is needed, because you need the right plugin to handle a requirement of the `scss`-file.


[View live example](http://projects.itsasbreuk.nl/react-components/itsa-fileuploadbutton/component.html)

[API](http://projects.itsasbreuk.nl/react-components/itsa-fileuploadbutton/api/)

## Setting up the server

You need to set up the server right by using these modules. Therefor, you can use the module: `itsa-fileuploadhandler`

####Example server:
```js
'use strict';

// make sure the process its current directory equals the executable directory
// so we can start it up from any other directory:
process.chdir(__dirname);

var Hapi = require('hapi'),
    fileUploadHandler = require("itsa-fileuploadhandler"),
    maxFileSize = 5*1024*1024, // 5mb
    accessControlAllowOrigin = true,
    fileUploadHandlerFns = fileUploadHandler.getHapiFns("/var/www/vhosts/server.itsa.io/server/imageuploader/uploadDir", maxFileSize, accessControlAllowOrigin);

// setting up the server:
var server = new Hapi.Server();

var ROUTES = [
    {
        method: 'GET',
        path: '/procesimage',
        handler: fileUploadHandlerFns.generateClientId
    },

    {
        method: 'PUT',
        path: '/procesimage',
        handler: function (request, reply) {
            fileUploadHandlerFns.recieveFile(request, reply, null, function(fullFilename, originalFilename) {
                // console.log('fullFilename',fullFilename);
                // console.log('originalFilename',originalFilename);
                // return new Promise(function(resolve) {
                //     ...
                //     resolve();
                // });
            });
        }
    },

    {
        method: 'POST',
        path: '/procesimage',
        config: {
              payload:{
                    maxBytes:209715200,
                    output:'stream',
                    parse: false
              },
              handler: function (request, reply) {
                fileUploadHandlerFns.recieveFormFiles(request, reply, null, function(files) {
                    // console.log('files',files);
                    // return new Promise(function(resolve) {
                    //     ...
                    //     resolve();
                    // });
                });
            }
        }
    },

    {
        method: 'OPTIONS',
        path: '/procesimage',
        handler: fileUploadHandlerFns.responseOptions
    }
];

server.connection({
    host: 'localhost',
    port: 8002
});

// adding routes:
server.route(ROUTES);

// starting the server:
server.start(function(err) {
    if (err) {
        console.log(err);
        return;
    }
    var args = process.argv,
          environment = args[2] || 'production',
          message = 'Server running '+environment+' at port: '+ server.info.port;

    console.log(message);
});
```