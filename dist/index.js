'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (app) {
    let options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    let body;

    (0, _koaQs2.default)(app);
    body = (0, _koaBody2.default)({
        multipart: true,
        jsonLimit: options.jsonLimit,
        formLimit: options.formLimit,
        textLimit: options.textLimit,
        formidable: {
            maxFields: options.maxFields,
            maxFieldsSize: options.maxFieldsSize,
            onFileBegin(name, file) {
                if (file.name) {
                    file.path = (0, _path.join)((0, _path.dirname)(file.path), file.name);
                }
            }
        }
    });

    app.context.getParameter = function (key) {
        let isXSS = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

        return handler.call(this, key, false, isXSS);
    };

    app.context.getParameters = function (key) {
        let isXSS = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

        return handler.call(this, key, true, isXSS);
    };

    return function* (next) {
        yield body.call(this, next);
    };
};

var _xss = require('xss');

var _xss2 = _interopRequireDefault(_xss);

var _koaQs = require('koa-qs');

var _koaQs2 = _interopRequireDefault(_koaQs);

var _koaBody = require('koa-body');

var _koaBody2 = _interopRequireDefault(_koaBody);

var _path = require('path');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function handler(key, multiple, isXSS, value) {
    if (this.idempotent && this.query) {
        value = this.query[key] || '';
    } else if (this.request.body) {
        if (this.is('multipart')) {
            Object.assign(this.request.body, this.request.body.fields, this.request.body.files);
        }

        value = this.request.body[key] || '';
    }

    return filter(multiple, isXSS, value);
}

function filter(multiple, isXSS, value) {
    if (!value || !isXSS) {
        return value;
    }

    if (!isArray(value)) {
        value = Array.of(value);
    }

    return filterXSS(multiple ? value : value[0]);
}

function filterXSS(obj) {
    if (isArray(obj)) {
        for (let index = 0, len = obj.length; index < len; index++) {
            obj[index] = filterXSS(obj[index]);
        }
    } else if (isObject(obj)) {
        for (let key in obj) {
            obj[key] = filterXSS(obj[key]);
        }
    }

    return isString(obj) ? (0, _xss2.default)(obj) : obj;
}

function isArray(obj) {
    return Array.isArray(obj);
}

function isObject(obj) {
    return typeof obj === 'object' && !!obj;
}

function isString(obj) {
    return Object.prototype.toString.call(obj) === '[object String]';
}