import xss from 'xss'
import koaQs from 'koa-qs'
import koaBody from 'koa-body'
import {join, dirname} from 'path'

export default function(app, options = {}){
    let body

    koaQs(app)
    body = koaBody({
        multipart: true,
        jsonLimit : options.jsonLimit,
        formLimit : options.formLimit,
        textLimit : options.textLimit,
        formidable : {
            maxFields : options.maxFields,
            maxFieldsSize : options.maxFieldsSize,
            onFileBegin (name, file){
                if(file.name){
                    file.path = join(dirname(file.path), file.name)
                }
            }
        }
    })

    app.context.getParameter = function(key, isXSS = true) {
        return handler.call(this, key, false, isXSS)
    }

    app.context.getParameters = function(key, isXSS = true) {
        return handler.call(this, key, true, isXSS)
    }

    return function *(next){
        yield body.call(this, next)
    }
}

function handler(key, multiple, isXSS, value){
    if(this.idempotent && this.query){
        value = this.query[key] || ''
    }else if(this.request.body){
        if(this.is('multipart')){
            Object.assign(this.request.body, this.request.body.fields, this.request.body.files)
        }

        value = this.request.body[key] || ''
    }

    return filter(multiple, isXSS, value)
}

function filter(multiple, isXSS, value){
    if(!value || !isXSS){
        return value
    }

    if(!isArray(value)){
        value = Array.of(value)
    }

    return filterXSS(multiple ? value : value[0])
}

function filterXSS(obj){
    if(isArray(obj)){
        for(let index = 0, len = obj.length; index < len; index++){
            obj[index] = filterXSS(obj[index])
        }
    }else if(isObject(obj)){
        for(let key in obj){
            obj[key] = filterXSS(obj[key])
        }
    }

    return isString(obj) ? xss(obj) : obj
}

function isArray(obj){
    return Array.isArray(obj)
}

function isObject(obj){
    return typeof obj === 'object' && !!obj
}

function isString(obj){
    return Object.prototype.toString.call(obj) === '[object String]'
}
