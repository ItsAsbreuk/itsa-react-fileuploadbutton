"use strict";

require("itsa-jsext");

const Classes =require("itsa-classes"),
    mimeDb = require("mime-db");

const mimeSearch = fileExt => {
    let type;
    mimeDb.itsa_some((value, key) => {
        if (value.extensions && value.extensions.itsa_contains(fileExt)) {
            type = key;
        }
        return type;
    });
    return type || "like/"+fileExt;
};

// DO NOT use arrow-functions in combination with itsa-classes --> the context would be wrong!
const FileLikeObject = Classes.createClass(function(inputElement) {
    const instance = this,
          path = inputElement.value,
          fileExt = path.slice(path.lastIndexOf(".") + 1).toLowerCase();
    instance.lastModifiedDate = null;
    instance.size = null;
    instance.type = mimeSearch(fileExt);
    instance.name = path.slice(path.lastIndexOf("/") + path.lastIndexOf("\\") + 2);
});

module.exports = {
    createFile: inputElement => new FileLikeObject(inputElement)
};
