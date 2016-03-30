"use strict";

require("ypromise");

const React = require("react"),
    ReactDOM = require("react-dom"),
    FileUploadButton = require("./lib/component-styled.jsx");

const props = {
    url: "http://imageuploader.itsa.io/procesimage",
    buttonText: "Upload File",
    errorMsg: "you can only select a png-file",
    helpText: "png-files only",
    maxFileSize: 15*1024*1024, // 5mb

    formSubmitMode: true,

    autoFocus: true,
    onFileChange: function(e) {
if (e!==1) {return;}
        props.validated = (e.target.getFiles()[0].type==="image/png");
        render();
        // reset the error-message next to the fileupload-button:
        propsMsg.msg = "";
        renderMsg();
    },
    onError: function(err) {
        propsMsg.msg = "Error: "+err.message;
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

var render = function() {
    ReactDOM.render(
        <FileUploadButton {...props} />,
        document.getElementById("component-container1")
    );
};

var renderMsg = function() {
    ReactDOM.render(
        <Msg {...propsMsg} />,
        document.getElementById("message-container")
    );
};

render();
renderMsg();
