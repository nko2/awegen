var events = require('events');

module.exports = Error;

function Error() {
    events.EventEmitter.call(this);
}

Error.super_ = events.EventEmitter;
Error.prototype = Object.create(events.EventEmitter.prototype, {
    constructor: {
        value: Error,
        enumerable: false
    }
});

Error.prototype.send = function(message) {
    this.emit('error', {'message':message});
    return this;
}

