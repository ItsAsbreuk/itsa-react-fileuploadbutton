"use strict";

const React = require("react"),
    ReactDOM = require("react-dom"),
    FileUploadButton = require("./lib/component-styled.jsx");

const props1 = {
    url: "http://imageuploader.itsa.io/procesimage",
    buttonText: "Select File",
    multipleFiles: true,
    errorMsg: "you can only select a png-file",
    helpText: "png-files only",
    markRequired: true,
    maxFileSize: 5*1024*1024, // 5mb
    // onClick: function(e) {
    //     console.info("component onClick", e);
    // },
    // onSend: function(e) {
    //     console.info("component onSend", e);
    // },
    onFileChange: function(e) {
        props1.validated = (e.target.getFiles()[0].type==="image/png");
        render1();
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

// const props2 = {
//     url: "http://imageuploader.itsa.io/procesimage",
//     buttonText: "Select File - form upload",
//     multipleFiles: true,
//     iframeMode: true,
//     autoSend: true,
//     onClick: function(e) {
//         console.info("component onClick", e);
//         e.target.send();
//         // e.preventDefault();
//     },
//     onFileChange: function(e) {
//         console.info("component onFileChange", e);
//     },
//     onSend: function(e) {
//         console.info("component onSend", e);
//     },
//     onProgress: function(data) {
//         console.info("component onProgress", Math.round(100*data.loaded/data.total));
//     },
//     onSuccess: function(data) {
//         console.info("component onSuccess", data);
//     },
//     onError: function(data) {
//         console.info("component onError", data);
//     }
// };

var render1 = function() {
    ReactDOM.render(
        <FileUploadButton {...props1} />,
        document.getElementById("component-container1")
    );
};

var renderMsg = function() {
    ReactDOM.render(
        <Msg {...propsMsg} />,
        document.getElementById("message-container")
    );
};

render1();
renderMsg();

// ReactDOM.render(
//     <FileUploadButton {...props2} />,
//     document.getElementById("component-container2")
// );
