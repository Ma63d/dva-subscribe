import {EventEmitter} from 'events'

export class Location {
    constructor (pathname, query) {
        this.pathname = pathname
        this.query = query || {}
    }
}

export class History {
    constructor () {
        this._emitter = new EventEmitter()
    }
    listen (cb) {
        this._emitter.on('_', cb)
        return () => {
            this._emitter.removeListener('_', cb)
        }
    }
    update (location) {
        this._emitter.emit('_', location)
    }
}
