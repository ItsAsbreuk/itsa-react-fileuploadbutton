"use strict";

/**
 * Description here
 *
 *
 *
 * <i>Copyright (c) 2016 ItsAsbreuk - http://itsasbreuk.nl</i><br>
 * New BSD License - http://choosealicense.com/licenses/bsd-3-clause/
 *
 *
 * @module component.jsx
 * @class Component
 * @since 2.0.0
*/

import React, {PropTypes} from "react";
import ReactDOM from "react-dom";
import Button from "itsa-react-button";
import {io} from "itsa-fetch";
import {idGenerator, async} from "itsa-utils";

const isNode = (typeof global!=="undefined") && ({}.toString.call(global)==="[object global]") && (!global.document || ({}.toString.call(global.document)!=="[object HTMLDocument]")),
      MAIN_CLASS = "itsa-fileuploadbutton",
      MAIN_CLASS_PREFIX = MAIN_CLASS+"-",
      SPACED_MAIN_CLASS_PREFIX = " "+MAIN_CLASS_PREFIX,
      NOOP = function() {},
      DEF_MAX_SIZE = 100*1024*1024, // 100 Mb
      CLICK = "click",
      ABORTED = "Request aborted",
      XHR2support = ("withCredentials" in new XMLHttpRequest());

const Component = React.createClass({

    propTypes: {
        /**
         * The Component its children
         *
         * @property children
         * @type Object
         * @since 2.0.0
        */
        onSuccess: PropTypes.func,
        onError: PropTypes.func,
        onFileChange: PropTypes.func,
        autoSend: PropTypes.bool,
        iframeMode: PropTypes.bool,
        emptyAfterSent: PropTypes.bool,
        maxFileSize: PropTypes.number,
        multipleFiles: PropTypes.bool,
        onClick: PropTypes.func,
        onSend: PropTypes.func,
        onProgress: PropTypes.func,
        options: PropTypes.object,
        params: PropTypes.object,
        requestOptions: PropTypes.object,
        totalFileSize: PropTypes.number,
        /**
         * Whether to autofocus the Component.
         *
         * @property autoFocus
         * @type Boolean
         * @since 0.0.1
        */
        autoFocus: PropTypes.bool,

        /**
         * The error-message that appears when the element is wrong validated.
         *
         * @property errorMsg
         * @type String
         * @since 0.0.1
        */
        errorMsg: PropTypes.string,

        /**
         * The text that should appear when the element is wrong validated.
         *
         * @property helpText
         * @type String
         * @since 0.0.1
        */
        helpText: PropTypes.string,

        /**
         * Whether to mark the Component when successfully validated.
         *
         * @property markValidated
         * @type Boolean
         * @since 0.0.1
        */
        markValidated: PropTypes.bool,

        /**
         * Whether the Component should show an validate-reclamation (star)
         *
         * @property markValidated
         * @type Boolean
         * @since 0.0.1
        */
        markRequired: PropTypes.bool,

        /**
         * The `name` for the element.
         *
         * @property name
         * @type String
         * @since 0.0.1
        */
        name: PropTypes.string,

        /**
         * The `onBlur` function, when happening on the DOM-Element.
         *
         * @property onChange
         * @type Function
         * @since 0.1.0
        */
        onBlur: PropTypes.func,
        /**
         * The `onFocus` function, when happening on the DOM-Element.
         *
         * @property onChange
         * @type Function
         * @since 0.1.0
        */
        onFocus: PropTypes.func,
        /**
         * The tabindex of the Component.
         *
         * @property type
         * @type Number
         * @since 0.0.1
        */
        tabIndex: PropTypes.number,
        url: PropTypes.string.isRequired,
        /**
         * Whether the property is validated right.
         *
         * @property validated
         * @type Boolean
         * @since 0.0.1
        */
        validated: PropTypes.bool
    },

    getDefaultProps() {
        return {
            autoSend: true,
            iframeMode: false,
            emptyAfterSent: true,
            maxFileSize: DEF_MAX_SIZE,
            multipleFiles: false,
            options: {},
            params: {},
            requestOptions: {},
            totalFileSize: DEF_MAX_SIZE
        };
    },

    /**
     * Returns the number of files that are currently selected.
     *
     * @method count
     * @return {number} Number of files currently selected
     * @since 0.0.1
    */
    count() {
        // need to inspect `this._inputNode` --> at first rendering it will be undefined
        return this._inputNode ? this._inputNode.files.length : 0;
    },

    componentWillMount() {
        this._iframeName = idGenerator("itsa-iframe");
    },

    componentDidMount() {
        const instance = this;
        instance._inputNode = ReactDOM.findDOMNode(instance.refs.fileinput);
        instance._buttonNode = ReactDOM.findDOMNode(instance.refs.uploadbutton);
        instance.IE8_Events = !instance._buttonNode.addEventListener;
        if (instance.IE8_Events) {
            instance._buttonNode.attachEvent('on'+CLICK, instance._handleClick);
        }
        else {
            instance._buttonNode.addEventListener(CLICK, instance._handleClick, true);
        }
    },

    componentWillUnmount() {
        const instance = this;
        if (instance.IE8_Events) {
            instance._buttonNode.detachEvent("on"+CLICK, instance._handleClick);
        }
        else {
            instance._buttonNode.removeEventListener(CLICK, instance._handleClick, true);
        }
        instance._io && instance._io.abort();
    },

    /**
     * Returns the currently selected files. This is an `Array-like` object, not a true Array.
     *
     * @method getFiles
     * @return {Array-like} protected `input`-domNode
     * @since 0.0.1
    */
    getFiles() {
        return this._inputNode.files;
    },

    /**
     * Returns the last send-files.
     * This is handy to know, because after transmission, getFiles() will return empty.
     * This is an true Array with objects of this structure: {name: xxx, size: xxx}
     *
     * @method getLastSent
     * @return {Array} The last sent files
     * @since 0.0.1
    */
    getLastSent() {
        return this._lastfiles;
    },

    /**
     * Returns the total size of all files that are currently selected.
     *
     * @method getTotalFileSize
     * @return {Number} The size of all files in bytes
     * @since 0.0.1
    */
    getTotalFileSize() {
        var instance = this,
            files = instance._inputNode.files,
            len = files.length,
            total = 0,
            i, file;
        for (i=0; i<len; i++) {
            file = files[i];
            total += file.size;
        }
        return total;
    },

    /**
     * Whether there are currently files selected.
     *
     * @method hasFiles
     * @return {number} Number of selected files
     * @since 0.0.1
    */
    hasFiles() {
        return (this.count()>0);
    },

    abort(reset) {
        // because, inside `onSend`, this._io might not be set yet, we need to go async:
        async(() => {
            this._io && this._io.abort();
            reset && this.reset();
        });
    },

    reset() {
        var inputNode = this._inputNode;
        // force the fileselector-popup up to disappear and become empty
        // direct dom-manipulation: it will be reset at once
        inputNode.setAttribute("type", "text");
        inputNode.value = "";
        inputNode.setAttribute("type", "file");
    },

    _getSizeValidationMsg() {
        let msg, fileMsg, filesizeMsg;
        const instance = this,
              props = instance.props,
              maxFileSize = props.maxFileSize,
              totalFileSize = props.totalFileSize;
        if (instance.hasFiles()) {
            if (maxFileSize && (instance._getLargestFileSize()>maxFileSize)) {
                fileMsg = props.multipleFiles ? "one of the files" : "selected file";
                filesizeMsg = Math.round(maxFileSize/1024);
                msg = fileMsg + " exceeds the maximum filesize of "+filesizeMsg+" KB";
            }
            else if (totalFileSize && (instance.getTotalFileSize()>totalFileSize)) {
                fileMsg = props.multipleFiles ? "the size of all files exceed" : "selected file exceeds";
                filesizeMsg = Math.round(totalFileSize/1024);
                msg = fileMsg + " the maximum of "+filesizeMsg+" KB";
            }
        }
        return msg;
    },
    /**
     * Send the selected files, by emitting the "uploader:send"-event.
     * If `payload.url`, `payload.url` or `payload.url` is set, then these will overrule the default
     * values (the way they were set at initiation, or by using `setDefaults`).
     * You also can set other properties at the payload --> these will be available at the listeners.
     *
     * @method send
     * @params [payload] {Object}
     *     @params [payload.url] {String}
     *     @params [payload.params] {Object}
     *     @params [payload.options] {Object}
     * @chainable
     * @since 0.0.1
    */
    send() {
        let hash = [],
            promisesById = {},
            prevented = false,
            promise, ioPromise, file, i, totalsize, originalProgressFn, options, params, url, errorMsg;
        const instance = this,
              props = instance.props,
              files = instance._inputNode.files,
              len = files.length,
              onSend = props.onSend;

        instance._io && instance._io.abort();
        delete instance._io;

        if (props.validated===false) {
            errorMsg = "selected files are wrong validated";
        }
        else {
            errorMsg = instance._getSizeValidationMsg();
            if (!errorMsg && !instance.hasFiles()) {
                errorMsg = "no files selected";
            }
        }
        if (errorMsg) {
            delete instance._formsubmit;
            return errorMsg;
        }

        // continue sending
        onSend && onSend({
                            preventDefault: () => {prevented = true;},
                            target: instance
                         });
        if (prevented) {
            delete instance._formsubmit;
            return "default-prevented";
        }

        if (!XHR2support || props.iframeMode) {
            instance._io = Promise.itsa_manage();
            instance._io.abort = () => {
                // first abort the request:
                if (window.stop) {
                    window.stop();
                }
                else {
                    window.document.execCommand("Stop");
                }
                // now reject the request
                instance._io.reject(ABORTED);
            };
            instance._formsubmit = true;
            instance.refs.fileform.submit();
        }
        else {
            options = props.options.itsa_deepClone();
            options.progressfn = instance.progressfn; // is set during `render`
            options.chunks = !props.iframeMode;
            params = props.params.itsa_deepClone();
            url = props.url;

            if (len===1) {
                file = files[0];
                promise = io.sendBlob(url, file, params, options);
            }
            else if (len>1) {
                if (options.progressfn) {
                    totalsize = 0;
                    originalProgressFn = options.progressfn;
                    options.progressfn = function(data) {
                        var promiseInstance = data.target,
                            totalLoaded = 0;
                        promisesById[promiseInstance._id] = data.loaded;
                        promisesById.each(function(value) {
                            totalLoaded += value;
                        });
                        originalProgressFn({
                            total: totalsize,
                            loaded: totalLoaded,
                            target: promise
                        });
                    };
                }
                // files is array-like, no true array
                for (i=0; i<len; i++) {
                    file = files[i];
                    ioPromise = io.sendBlob(url, file, params, options);
                    // we are interested in the total size of ALL files
                    if (options.progressfn) {
                        totalsize += file.size;
                        ioPromise._id = i;
                    }
                    hash.push(ioPromise);
                }
                promise = window.Promise.finishAll(hash).then(function(response) {
                    var rejected = response.rejected;
                    rejected.forEach(function(ioError) {
                        if (ioError) {
                            throw new Error(ioError);
                        }
                    });
                });
                promise.abort = function() {
                    if (!promise._aborted) {
                        hash.forEach(function(ioPromise) {
                            ioPromise.abort();
                        });
                        instance._io && instance._io.reject(ABORTED);
                        promise._aborted = true;
                    }
                };
            }
            else {
                promise = Promise.reject("No files selected");
                promise.abort = NOOP;
            }
            instance._io = promise;
        }
        if (props.emptyAfterSent && (len>0)) {
            // empty ON THE NEXT stack (not microstack), to ensure all previous methods are processing
            async(() => instance.reset());
        }
        instance._io.then(
            instance._handleSuccess,
            instance._handleError
        ).itsa_finally(() => delete instance._formsubmit);

        return instance._io;
    },

    /**
     * React render-method --> renderes the Component.
     *
     * @method render
     * @return ReactComponent
     * @since 2.0.0
     */
    render() {
        let errorMsg, help, iframe, element, sizeValidationMsg;
        const instance = this,
              props = instance.props.itsa_deepClone();

        delete props.onClick; // we needed to create a native click-event and don't want to invoke onClick twice

        props.className || (props.className="");
        props.className += (props.className ? " " : "") + "itsa-fileuploadbutton";

        if (!instance.hasFiles()) {
            props.markRequired && (props.className+=" itsa-fileuploadbutton-required");
        }
        else if (props.markValidated && props.validated) {
            props.className += " itsa-fileuploadbutton-feedback-success";
        }

        if (props.markRequired || props.markValidated) {
            props.className += " itsa-fileuploadbutton-wide";
        }

        sizeValidationMsg = instance._getSizeValidationMsg();
        if ((props.validated===false) || sizeValidationMsg) {
            errorMsg = (<div className={MAIN_CLASS_PREFIX+"error-text"}>{(props.validated===false) ? props.errorMsg : sizeValidationMsg}</div>);
            props.className += SPACED_MAIN_CLASS_PREFIX+"error";
        }

        if (props.helpText && !errorMsg) {
            help = (<div className={MAIN_CLASS_PREFIX+"help-text"}>{props.helpText}</div>);
        }

        if (XHR2support && !props.iframeMode) {
            if (props.onProgress) {
                instance.progressfn = function(data) {
                    const payload = {
                        ioPromise: data.target,
                        target: instance,
                        total: data.total,
                        loaded: data.loaded
                    };
                    props.onProgress(payload);
                };
            }
            else {
                instance.progressfn = null;
            }
            element = instance._renderInputElement();
        }
        else {
            iframe = instance._renderIframe();
            element = instance._renderFormElement();
        }

        return (
            <div className={MAIN_CLASS} >
                {iframe}
                {element}
                <Button ref="uploadbutton" {...props} />
                {errorMsg}
                {help}
            </div>
        );
    },

    //==============================================================================
    //== private methods ===========================================================
    //==============================================================================

    /**
     * Returns the size of the largest file that is currently selected.
     *
     * @method _getLargestFileSize
     * @return {Number} The size of the largest file in bytes
     * @since 0.0.1
    */
    _getLargestFileSize() {
        var instance = this,
            files = instance._inputNode.files,
            len = files.length,
            largest = 0,
            i, file;
        for (i=0; i<len; i++) {
            file = files[i];
            (file.size>largest) && (largest=file.size);
        }
        return largest;
    },

    /**
     * Default function for the `uploader:_handleClick`-event
     *
     * @method _defFnSelectFiles
     * @param e {Object} eventobject
     *     @param [e.multiple] {Boolean} whether to support multiple selected files
     * @private
     * @since 0.0.1
    */
    _handleClick() {
// http://stackoverflow.com/questions/32746279/not-triggering-event-when-clicking-an-input-type-file-element-in-firefox
        let prevented = false;
        const instance = this,
              onClick = instance.props.onClick;
        if (!isNode) {
            onClick && onClick({
                                    preventDefault: () => {prevented = true},
                                    target: instance
                               });
            prevented || instance._inputNode.click();
        }
    },

    _handleError(data) {
        const props = this.props,
              onError = props.onError;
        if (onError) {
            onError({
                status: (Object.itsa_isObject(data) && data.status) ? data.status : ((typeof data==="string") ? data : "Error"),
                target: this
            });
        }
    },

    _handleFileChange() {
        let prevented = false;
        const instance = this,
              props = instance.props,
              onFileChange = props.onFileChange;
        onFileChange && onFileChange({
            preventDefault: () => {prevented = true},
            target: instance
        });
        if (props.autoSend && !prevented) {
            // going async --> props.validated might have changed --> it should be implemented first
            async(() => instance.send());
        }
    },

    _handleSuccess(data) {
        const props = this.props,
              onSuccess = props.onSuccess;
        if (onSuccess) {
            onSuccess({
                status: (Object.itsa_isObject(data) && data.status) ? data.status : ((typeof data==="string") ? data : "ok"),
                target: this
            });
        }
    },

    _iframeError() {
        instance._io.abort();
    },

    _iframeLoad() {
        let content;
        const instance = this,
            okStatus= {status: "ok"};
        if (instance._formsubmit) {
            try {
                content = myIFrame.contentWindow.document.body.innerHTML;
                if (content==="OK") {
                    instance._io.fulfill(okStatus);
                }
                else {
                    instance._io.reject();
                }
            }
            catch(err) {
                // CORS is active --> we are unable to determine the response, so we need to fulfill the request:
                instance._io.fulfill(okStatus);
            }
        }
    },

    _renderInputElement() {
        const inputStyles = {display: "none !important"};
        return (
            <input
                multiple={this.props.multipleFiles}
                onChange={this._handleFileChange}
                ref="fileinput"
                style={inputStyles}
                type="file" />
        );
    },

    _renderFormElement() {
        const instance = this,
              props = instance.props,
              formStyles = {display: "none !important"},
              inputStyles = {};
        return (
            <form
                action={props.url}
                encType="multipart/form-data"
                method="post"
                noValidate={true}
                ref="fileform"
                style={formStyles}
                target={instance._iframeName}>
                <input
                    multiple={props.multipleFiles}
                    name="uploadfiles"
                    onChange={instance._handleFileChange}
                    ref="fileinput"
                    style={inputStyles}
                    type="file" />
            </form>
        );
    },

    _renderIframe() {
        const instance = this,
              iframeStyles = {display: "none !important"};
        return (
            <iframe
                id="marco"
                ref="iframenode"
                name={instance._iframeName}
                onLoad={instance._iframeLoad}
                onError={instance._iframeError}
                style={iframeStyles} />
        );
    },

    /**
     * Stores the files that are sent into an internal hash, which can be read by `getLastSent()`.
     *
     * @method _storeLastSent
     * @private
     * @chainable
     * @since 0.0.1
    */
    _storeLastSent() {
        var instance = this,
            lastFiles = instance._lastfiles,
            files = instance._inputNode.files,
            len = files.length,
            i, file;
        lastFiles.length = 0;
        for (i=0; i<len; i++) {
            file = files[i];
            lastFiles.push({
                name: file.name,
                size: file.size
            });
        }
        return instance;
    }

});

module.exports = Component;
