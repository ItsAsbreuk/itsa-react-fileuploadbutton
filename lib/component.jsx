"use strict";

/**
 * React-component: File upload-button.
 *
 *
 *
 * <i>Copyright (c) 2016 ItsAsbreuk - http://itsasbreuk.nl</i><br>
 * New BSD License - http://choosealicense.com/licenses/bsd-3-clause/
 *
 *
 * @module itsa-react-fileuploadbutton
 * @class FileUploadButton
 * @since 0.0.1
*/

import "itsa-jsext";
import React, {PropTypes} from "react";
import ReactDOM from "react-dom";
import Button from "itsa-react-button";
import {io} from "itsa-fetch";
import {idGenerator, async, later} from "itsa-utils";

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
         * Whether to autofocus the Component.
         *
         * @property autoFocus
         * @type Boolean
         * @since 0.0.1
        */
        autoFocus: PropTypes.bool,

        /**
         * Whether to automaticly send the file(s) after being selected. When set `false`, you need to manually send the files
         * with the `send`-method.
         *
         * @property autoSend
         * @type Boolean
         * @since 0.0.1
        */
        autoSend: PropTypes.bool,

        /**
         * The aria-label. When not set, it will equal the buttonText
         *
         * @property aria-label
         * @type String
         * @since 0.0.1
        */
        "aria-label": PropTypes.string,

        /**
         * The Button-text. Will be escaped. If you need HTML, then use `buttonHTML` instead.
         *
         * @property buttonText
         * @type String
         * @since 0.0.1
        */
        buttonText: PropTypes.string,

        /**
         * The Button-text, retaining html-code. If you don't need HTML,
         * then `buttonText` is preferred.
         *
         * @property buttonHTML
         * @type String
         * @since 0.0.1
        */
        buttonHTML: PropTypes.string,

        /**
         * Whether the button is disabled
         *
         * @property disabled
         * @type Boolean
         * @since 0.0.1
        */
        disabled: PropTypes.bool,

        /**
         * Whether to empty the file(s) after sent to the server.
         * Default: true
         *
         * @property emptyAfterSent
         * @type Boolean
         * @since 0.0.1
        */
        emptyAfterSent: PropTypes.bool,

        /**
         * The error-message that appears when the element is wrong validated.
         *
         * @property errorMsg
         * @type String
         * @since 0.0.1
        */
        errorMsg: PropTypes.string,

        /**
         * To force the component to use form-submit instead of XHR2. This is NOT recomended.
         * In case the browser does not support XHR2, it will automaticly fall back to form-submit.
         * Default: false
         *
         * @property formSubmitMode
         * @type Boolean
         * @since 0.0.1
        */
        formSubmitMode: PropTypes.bool,

        /**
         * Help text to assist. Appears just below the button.
         *
         * @property helpText
         * @type String
         * @since 0.0.1
        */
        helpText: PropTypes.string,

        /**
         * Whether to mark the Component when the file(s) are successfully sent.
         *
         * @property markSuccess
         * @type Boolean
         * @since 0.0.1
        */
        markSuccess: PropTypes.bool,

        /**
         * Whether the Component should show an validate-reclamation (star)
         *
         * @property markRequired
         * @type Boolean
         * @since 0.0.1
        */
        markRequired: PropTypes.bool,

        /**
         * The maximum allowed file-size of each separate file.
         *
         * @property maxFileSize
         * @type Number
         * @since 0.0.1
        */
        maxFileSize: PropTypes.number,

        /**
         * Whether to support the selection of multiple files.
         *
         * @property multipleFiles
         * @type Boolean
         * @since 0.0.1
        */
        multipleFiles: PropTypes.bool,

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
         * @property onBlur
         * @type Function
         * @since 0.1.0
        */
        onBlur: PropTypes.func,

        /**
         * The `onClick` function, when happening on the DOM-Element.
         *
         * @property onClick
         * @type Function
         * @since 0.0.1
        */
        onClick: PropTypes.func,

        /**
         * The `onError` function, when filetransfer errors.
         *
         * @property onError
         * @type Function
         * @since 0.0.1
        */
        onError: PropTypes.func,

        /**
         * The `onFileChange` function, when the users has selected files.
         *
         * @property onFileChange
         * @type Function
         * @since 0.0.1
        */
        onFileChange: PropTypes.func,

        /**
         * The `onFocus` function, when the Component gets focussed.
         *
         * @property onFocus
         * @type Function
         * @since 0.1.0
        */
        onFocus: PropTypes.func,

        /**
         * The `onProgress` function: callback during tranfer.
         *
         * @property onProgress
         * @type Function
         * @since 0.0.1
        */
        onProgress: PropTypes.func,

        /**
         * The `onSend` function, when the transfer starts.
         *
         * @property onSend
         * @type Function
         * @since 0.0.1
        */
        onSend: PropTypes.func,

        /**
         * The `onSuccess` function, transfer succeeded.
         *
         * @property onSuccess
         * @type Function
         * @since 0.0.1
        */
        onSuccess: PropTypes.func,

        /**
         * Additional params that can be send with the request.
         *
         * @property params
         * @type Object
         * @since 0.0.1
        */
        params: PropTypes.object,

        /**
         * Options to be passed through to the request.
         *
         * @property requestOptions
         * @type Object
         * @since 0.0.1
        */
        requestOptions: PropTypes.object,

        /**
         * Whether to show the progress inside the button.
         * Default: true
         *
         * @property showProgress
         * @type Boolean
         * @since 0.0.1
        */
        showProgress: PropTypes.bool,

        /**
         * The tabindex of the Component.
         *
         * @property tabIndex
         * @type Number
         * @since 0.0.1
        */
        tabIndex: PropTypes.number,

        /**
         * The total maximum allowed file-size of all files altogether.
         *
         * @property totalFileSize
         * @type Number
         * @since 0.0.1
        */
        totalFileSize: PropTypes.number,

        /**
         * The url to send to files to.
         *
         * @required
         * @property url
         * @type Boolean
         * @since 0.0.1
        */
        url: PropTypes.string.isRequired,

        /**
         * Whether the selected files are is validated right. This value can be set inside the `onFileChange` callback.
         *
         * @property validated
         * @type Boolean
         * @since 0.0.1
        */
        validated: PropTypes.bool
    },

    /**
     * Returns the default properties of the Component
     *
     * @method getDefaultProps
     * @return {Object} the default properties
     * @since 0.0.1
    */
    getDefaultProps() {
        return {
            autoFocus: false,
            autoSend: true,
            formSubmitMode: false,
            emptyAfterSent: true,
            markSuccess: true,
            markRequired: false,
            maxFileSize: DEF_MAX_SIZE,
            multipleFiles: false,
            showProgress: true,
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

    /**
     * componentWillMount does some initialization.
     *
     * @method componentWillMount
     * @since 0.0.1
     */
    componentWillMount() {
        this._iframeName = idGenerator("itsa-iframe");
    },

    /**
     * componentDidMount does some initialization.
     *
     * @method componentDidMount
     * @since 0.0.1
     */
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
        instance.props.autoFocus && instance.focus();
    },

    /**
     * componentWilUnmount does some cleanup.
     *
     * @method componentWillUnmount
     * @since 0.0.1
     */
    componentWillUnmount() {
        const instance = this;
        instance._clearRemoveTimer();
        if (instance.IE8_Events) {
            instance._buttonNode.detachEvent("on"+CLICK, instance._handleClick);
        }
        else {
            instance._buttonNode.removeEventListener(CLICK, instance._handleClick, true);
        }
        instance._io && instance._io.abort();
    },

    /**
     * Sets the focus on the Component.
     *
     * @method focus
     * @chainable
     * @since 0.0.1
     */
    focus() {
        this._buttonNode.focus();
        return this;
    },

    /**
     * Returns the currently selected files. This is an `Array-like` object, not a true Array.
     *
     * @method getFiles
     * @return {Array-like} protected list of files (of the `input`-domNode)
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
     * Returns the initial state.
     *
     * @method getInitialState
     * @return object
     * @since 0.0.1
     */
    getInitialState() {
        return {
            serverError: "",
            serverSuccess: false,
            percent: null
        };
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

    /**
     * Aborts the transfer (if files are being sent).
     *
     * @method abort
     * @params reset {Boolean} Whether to clean the file-list
     * @since 0.0.1
    */
    abort(reset) {
        // because, inside `onSend`, this._io might not be set yet, we need to go async:
        async(() => {
            this._io && this._io.abort();
            reset && this.reset();
        });
    },

    /**
     * React render-method --> renderes the Component.
     *
     * @method render
     * @return ReactComponent
     * @since 0.0.1
     */
    render() {
        let errorMsg, help, iframe, element, sizeValidationMsg, shiftLeft,
            progressBar, classNameProgressBar, classNameProgressBarInner, progressBarInnerStyles;
        const instance = this,
              state = instance.state,
              serverError = state.serverError,
              props = instance.props.itsa_deepClone(),
              serverSuccess = state.serverSuccess,
              markServerSuccess = props.markSuccess && serverSuccess,
              XHR2 = (XHR2support && !props.formSubmitMode),
              showProgress = props.showProgress,
              onProgress = props.onProgress;

        delete props.onClick; // we needed to create a native click-event and don't want to invoke onClick twice

        props.className || (props.className="");
        props.className += (props.className ? " " : "") + MAIN_CLASS;

        if (markServerSuccess) {
            props.className += " "+MAIN_CLASS_PREFIX+"feedback-success";
        }
        else if (!instance.hasFiles() && !serverSuccess) {
            props.markRequired && (props.className+=" "+MAIN_CLASS_PREFIX+"required");
        }
        if (props.markRequired || props.markSuccess) {
            props.className += " "+MAIN_CLASS_PREFIX+"wide";
        }

        if (typeof state.percent==="number") {
            classNameProgressBar = MAIN_CLASS_PREFIX+"progress";
            classNameProgressBarInner = classNameProgressBar + "-inner";
            serverSuccess && (classNameProgressBar+=" "+classNameProgressBar+"-completed");
            shiftLeft = state.percent-100;
            progressBarInnerStyles = {
                marginLeft: shiftLeft+"%"
            };
            progressBar = (
                <div className={classNameProgressBar}>
                    <div className={classNameProgressBarInner} style={progressBarInnerStyles} />
                </div>
            );
        }

        sizeValidationMsg = instance._getSizeValidationMsg();
        if (serverError || (props.validated===false) || sizeValidationMsg) {
            errorMsg = (<div className={MAIN_CLASS_PREFIX+"error-text"}>{serverError || ((props.validated===false) ? props.errorMsg : sizeValidationMsg)}</div>);
            props.className += SPACED_MAIN_CLASS_PREFIX+"error";
        }

        if (props.helpText && !errorMsg) {
            help = (<div className={MAIN_CLASS_PREFIX+"help-text"}>{props.helpText}</div>);
        }

        if (XHR2) {
            if (onProgress || showProgress) {
                instance.progressfn = function(data) {
                    let payload, percent;
                    const total = data.total,
                          loaded = data.loaded;
                    if (showProgress) {
                        percent = Math.round(100*(loaded/total));
                        instance.setState({
                            percent: percent
                        });
                    }
                    if (onProgress) {
                        payload = {
                            ioPromise: data.target,
                            target: instance,
                            total,
                            loaded
                        };
                        onProgress(payload);
                    }
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
                <Button {...props} ref="uploadbutton" showActivated={false} type="button" />
                {progressBar}
                {errorMsg}
                {help}
            </div>
        );
    },

    reset() {
        var inputNode = this._inputNode;
        // force the fileselector-popup up to disappear and become empty
        // direct dom-manipulation: it will be reset at once
        inputNode.setAttribute("type", "text");
        inputNode.value = "";
        inputNode.setAttribute("type", "file");
    },

    /**
     * Send the selected files. Will also invoke the onSend callback, from within `e.preventDefault()` can be used.
     *
     * @method send
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

        if (!XHR2support || props.formSubmitMode) {
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
            options = props.requestOptions.itsa_deepClone();
            options.progressfn = instance.progressfn; // is set during `render`
            options.chunks = !props.formSubmitMode;
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
                        promisesById.itsa_each(function(value) {
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
                promise = window.Promise.itsa_finishAll(hash).then(function(response) {
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
            props.showProgress && this.setState({percent: 0});
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

    //==============================================================================
    //== private methods ===========================================================
    //==============================================================================

    /**
     * Clears the internal timer set by `_setRemoveTimer`
     *
     * @method _clearRemoveTimer
     * @private
     * @since 0.0.1
    */
    _clearRemoveTimer() {
        this._removeTimer && this._removeTimer.cancel();
    },

    /**
     * Returns the size of the largest file that is currently selected.
     *
     * @method _getLargestFileSize
     * @private
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
     * Returns the validation-message when file-size is exceeded.
     *
     * @method _getSizeValidationMsg
     * @private
     * @return {String} Message in case limits are exceeded
     * @since 0.0.1
    */
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
     * Callback whenever the button gets clicked.
     *
     * @method _handleClick
     * @private
     * @since 0.0.1
    */
    _handleClick() {
        let prevented = false;
        const instance = this,
              onClick = instance.props.onClick;
        if (!isNode) {
            onClick && onClick({
                                    preventDefault: () => {prevented = true},
                                    target: instance
                               });
            instance._clearRemoveTimer();
            instance.setState({
                serverError: "",
                serverSuccess: false,
                percent: null
            });
            prevented || instance._inputNode.click();
        }
    },

    /**
     * Error-Callback for the promised-request
     *
     * @method _handleError
     * @private
     * @params err {Object}
     * @since 0.0.1
    */
    _handleError(err) {
        const props = this.props,
              onError = props.onError,
              statusMsg = (Object.itsa_isObject(err) && err.status) ? err.status : ((typeof err==="string") ? err : "Error");
        statusMsg;
        if (onError) {
            onError({
                message: statusMsg,
                target: this
            });
        }
        this.setState({
            serverError: "server-error: " + statusMsg.toLowerCase(),
            serverSuccess: false,
            percent: null
        });
        // remove progressBar after 1 second: when laid above the button hte button can't be pressed
        this._setRemoveTimer();
    },

    /**
     * Callback whenever the `input`-element's files are changed. Will invoke `onFileChange` when present.
     * If the property `autoSend` is true (and `onFileChange` did no `preventDefault()`), then the `send()`-method gets invoked.
     *
     * @method _handleFileChange
     * @private
     * @return {Number} The size of the largest file in bytes
     * @since 0.0.1
    */
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

    /**
     * Error-Callback for the promised-request
     *
     * @method _handleSuccess
     * @private
     * @params err {data}
     * @since 0.0.1
    */
    _handleSuccess(data) {
        const props = this.props,
              onSuccess = props.onSuccess;
        if (onSuccess) {
            onSuccess({
                status: (Object.itsa_isObject(data) && data.status) ? data.status : ((typeof data==="string") ? data : "ok"),
                target: this
            });
        }
        this.setState({
            serverError: "",
            serverSuccess: true,
            percent: 100
        });
        // remove progressBar after 1 second: when laid above the button hte button can't be pressed
        this._setRemoveTimer();
    },

    /**
     * Callback whenever the iframe recieves an error (most likely by an invalid server-response).
     * Will abort the request-promise.
     *
     * @method _iframeError
     * @private
     * @since 0.0.1
    */
    _iframeError() {
        instance._io.abort();
    },

    /**
     * Callback whenever the iframe recieves a response from the server. Depending on the response, it will
     * either fulfill or reject the request-promise.
     *
     * @method _iframeLoad
     * @private
     * @return {Number} The size of the largest file in bytes
     * @since 0.0.1
    */
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
                    instance._io.reject("server did not accept the files");
                }
            }
            catch(err) {
                // CORS is active --> we are unable to determine the response, so we need to fulfill the request:
                instance._io.fulfill(okStatus);
            }
        }
    },

    /**
     * Renderes the HTMLInputElement
     *
     * @method _renderInputElement
     * @private
     * @return {Component} The Input-element (jsx)
     * @since 0.0.1
    */
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

    /**
     * Renderes a HTMLFormElement (in case no XHR2 is used)
     *
     * @method _renderFormElement
     * @private
     * @return {Component} The Form-element (jsx)
     * @since 0.0.1
    */
    _renderFormElement() {
        const instance = this,
              props = instance.props,
              formStyles = {display: "none !important"},
              hiddenFields = [];

        props.params.itsa_each((value, key) => {
            let keyValue;
            try {
                keyValue = (typeof value==="object") ? JSON.stringify(value) : String(value);
            }
            catch(err) {
                keyValue = null;
            }
            hiddenFields.push(<input key={key} type="hidden" name={key} value={keyValue} />);
        })

        return (
            <form
                action={props.url}
                encType="multipart/form-data"
                method="post"
                noValidate={true}
                ref="fileform"
                style={formStyles}
                target={instance._iframeName} >
                {hiddenFields}
                <input
                    multiple={props.multipleFiles}
                    name="uploadfiles"
                    onChange={instance._handleFileChange}
                    ref="fileinput"
                    type="file" />
            </form>
        );
    },

    /**
     * Renderes an iFrame-element (in case no XHR2 is used), which is needed for the response-target of the form-submission.
     *
     * @method _renderIframe
     * @private
     * @return {Component} The iframe-element (jsx)
     * @since 0.0.1
    */
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
     * Sets a timer that will remove the progress-bar.
     *
     * @method _setRemoveTimer
     * @private
     * @since 0.0.1
    */
    _setRemoveTimer() {
        this._removeTimer = later(() => this.setState({percent: null}), 1050);
    },

    /**
     * Stores the files that are sent into an internal hash, which can be read by `getLastSent()`.
     *
     * @method _storeLastSent
     * @private
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
