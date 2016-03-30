"use strict";

import Classes from "itsa-classes";

var FileLikeObject = Classes.createClass(function(inputElement) {
    var instance = this,
        path = inputElement.value;
    instance.lastModifiedDate = null;
    instance.size = null;
    instance.type = "like/" + path.slice(path.lastIndexOf(".") + 1).toLowerCase();
    instance.name = path.slice(path.lastIndexOf("/") + path.lastIndexOf("\\") + 2);
});

module.exports = {
    createFile: function(inputElement) {
        return new FileLikeObject(inputElement);
    }
};