var o = require('atom').o(module)
var _o = require('bond')._o(module)
var __ = require('fiber').__.main(module)
var assert = require('assert')
var BSON = require('leafnode').BSON
var carbond = require('../')
var assertRequests = require('./test-helper').assertRequests

/*******************************************************************************
 * Start / stop tests
 */
__(function() {

  syncTest()
  asyncTest1(function(err1) {
    if (err1) { console.log(err1) }
    asyncTest2(function(err2) {
    if (err2) { console.log(err2) }
      asyncTest3(function(err3) {
        if (err3) { console.log(err3) }
      })
    })
  })
})

/*******************************************************************************
 * sync
 */
function syncTest() {
  var objectServer = o({
    _type: carbond.ObjectServer,
    
    doStart: function() {
      this._started = true
    },

    doStop: function() {
      this._started = false
    }

  })

  try {
    // Start the server
    objectServer.start()
    assert(objectServer._started)

    // Stop the server
    objectServer.stop()
    assert(!objectServer._started)
  } catch (e) {
    console.log(e.message)
    console.log(e.stack)
    objectServer.stop()
  }
  
}

/*******************************************************************************
 * asyncTest1
 */
function asyncTest1(cb) {
  var objectServer = o({
    _type: carbond.ObjectServer,
    
    doStart: function() {
      this._started = true
    },
    
    doStop: function() {
      this._started = false
    }
  })

  objectServer.start({}, function(err) {
    if (err) console.log(err)
    assert(objectServer._started)
    objectServer.stop()
    assert(!objectServer._started)
    cb(err)
  })
}

/*******************************************************************************
 * asyncTest2
 */
function asyncTest2(done) {
  var objectServer = o({
    _type: carbond.ObjectServer,
    
    doStart: function(options, cb) {
      this._started = true
      cb()
    },
    
    doStop: function(cb) {
      this._started = false
      cb()
    }
  })

  objectServer.start({}, function(err) {
    if (err) { console.log(err) }
    assert(objectServer._started)
    objectServer.stop(function(err) {
      if (err) { console.log(err) }
      assert(!objectServer._started)
      done(err)
    })
  })
}

/*******************************************************************************
 * asyncTest3
 */
function asyncTest3(cb) {
  var objectServer = o({
    _type: carbond.ObjectServer,
    
    doStart: function() {
      this._started = true
    },
    
    doStop: function() {
      this._started = false
    }
  })

  objectServer.start()
  assert(objectServer._started)
  objectServer.stop(function(err) {
    assert(!objectServer._started)
    cb(err)
  })
}
