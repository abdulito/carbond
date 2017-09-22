var assert = require('assert')
var url = require('url')

var _ = require('lodash')
var sinon = require('sinon')

var __ = require('@carbon-io/carbon-core').fibers.__(module)
var ejson = require('@carbon-io/carbon-core').ejson
var o = require('@carbon-io/carbon-core').atom.o(module)
var _o = require('@carbon-io/carbon-core').bond._o(module)
var testtube = require('@carbon-io/carbon-core').testtube

var carbond = require('../..')
var pong = require('../fixtures/pong')

/**************************************************************************
 * removeObject tests
 */
__(function() {
  module.exports = o.main({

    /**********************************************************************
     * _type
     */
    _type: testtube.Test,

    /**********************************************************************
     * name
     */
    name: 'RemoveObjectTests',

    /**********************************************************************
     * tests
     */
    tests: [
      o({
        _type: carbond.test.ServiceTest,
        name: 'DefaultConfigRemoveObjectTests',
        service: o({
          _type: pong.Service,
          endpoints: {
            removeObject: o({
              _type: pong.Collection,
              enabled: {removeObject: true}
            })
          }
        }),
        setup: function(context) {
          carbond.test.ServiceTest.prototype.setup.apply(this, arguments)
          context.global.idParameter = this.service.endpoints.removeObject.idParameter
        },
        teardown: function(context) {
          delete context.global.idParameter
          carbond.test.ServiceTest.prototype.teardown.apply(this, arguments)
        },
        tests: [
          {
            name: 'RemoveObjectTest',
            description: 'Test DELETE',
            reqSpec: {
              url: '/removeObject/0',
              method: 'DELETE',
              headers: {
                'x-pong': ejson.stringify({
                  removeObject: 1
                })
              }
            },
            resSpec: {
              statusCode: 200,
              body: {n: 1}
            }
          },
          {
            name: 'RemoveObjectHandlerReturnInvalidCountTest',
            description: 'Test removeObject handler returns invalid count',
            setup: function() {
              this.postRemoveObjectOperationSpy =
                sinon.spy(this.parent.service.endpoints.removeObject, 'postRemoveObjectOperation')
              this.removeObjectSpy = sinon.spy(this.parent.service.endpoints.removeObject, 'removeObject')
            },
            teardown: function() {
              try {
                assert(this.removeObjectSpy.called)
                assert(this.postRemoveObjectOperationSpy.threw())
              } finally {
                this.removeObjectSpy.restore()
                this.postRemoveObjectOperationSpy.restore()
              }
            },
            reqSpec: {
              url: '/removeObject/0',
              method: 'DELETE',
              headers: {
                'x-pong': ejson.stringify({
                  removeObject: 2
                })
              }
            },
            resSpec: {
              statusCode: 500
            }
          },
          {
            name: 'RemoveObjectHandlerReturnArrayTest',
            description: 'Test removeObject handler returns array',
            setup: function() {
              this.postRemoveObjectOperationSpy =
                sinon.spy(this.parent.service.endpoints.removeObject, 'postRemoveObjectOperation')
              this.removeObjectSpy = sinon.spy(this.parent.service.endpoints.removeObject, 'removeObject')
            },
            teardown: function() {
              try {
                assert(this.removeObjectSpy.called)
                assert(this.postRemoveObjectOperationSpy.threw())
              } finally {
                this.removeObjectSpy.restore()
                this.postRemoveObjectOperationSpy.restore()
              }
            },
            reqSpec: function(context) {
              return {
                url: '/removeObject/0',
                method: 'DELETE',
                headers: {
                  'x-pong': ejson.stringify({
                    removeObject: {[context.global.idParameter]: '0', foo: 'bar'}
                  })
                }
              }
            },
            resSpec: {
              statusCode: 500
            }
          },
        ]
      }),
      o({
        _type: carbond.test.ServiceTest,
        name: 'ReturnsRemovedObjectRemoveObjectTests',
        service: o({
          _type: pong.Service,
          endpoints: {
            removeObject: o({
              _type: pong.Collection,
              enabled: {removeObject: true},
              removeObjectConfig: {
                returnsRemovedObject: true
              }
            })
          }
        }),
        setup: function(context) {
          carbond.test.ServiceTest.prototype.setup.apply(this, arguments)
          context.global.idParameter = this.service.endpoints.removeObject.idParameter
        },
        teardown: function(context) {
          delete context.global.idParameter
          carbond.test.ServiceTest.prototype.teardown.apply(this, arguments)
        },
        tests: [
          {
            name: 'RemoveObjectTest',
            description: 'Test DELETE',
            reqSpec: function(context) {
              return {
                url: '/removeObject/0',
                method: 'DELETE',
                headers: {
                  'x-pong': ejson.stringify({
                    removeObject: {[context.global.idParameter]: '0', foo: 'bar'}
                  })
                }
              }
            },
            resSpec: {
              statusCode: 200,
              body: function(body, context) {
                assert.deepStrictEqual(body, {[context.global.idParameter]: '0', foo: 'bar'})
              }
            }
          },
          {
            name: 'RemoveObjectHandlerReturnObjectsTest',
            description: 'Test removeObject handler returns invalid count when objects expected',
            setup: function() {
              this.postRemoveObjectOperationSpy =
                sinon.spy(this.parent.service.endpoints.removeObject, 'postRemoveObjectOperation')
              this.removeObjectSpy = sinon.spy(this.parent.service.endpoints.removeObject, 'removeObject')
            },
            teardown: function() {
              try {
                assert(this.removeObjectSpy.called)
                assert(this.postRemoveObjectOperationSpy.threw())
              } finally {
                this.removeObjectSpy.restore()
                this.postRemoveObjectOperationSpy.restore()
              }
            },
            reqSpec: {
              url: '/removeObject/0',
              method: 'DELETE',
              headers: {
                'x-pong': ejson.stringify({
                  removeObject: 1
                })
              }
            },
            resSpec: {
              statusCode: 500
            }
          },
          {
            name: 'RemoveObjectHandlerReturnObjectTest',
            description: 'Test removeObject handler returns an array',
            setup: function() {
              this.postRemoveObjectOperationSpy =
                sinon.spy(this.parent.service.endpoints.removeObject, 'postRemoveObjectOperation')
              this.removeObjectSpy = sinon.spy(this.parent.service.endpoints.removeObject, 'removeObject')
            },
            teardown: function() {
              try {
                assert(this.removeObjectSpy.called)
                assert(this.postRemoveObjectOperationSpy.threw())
              } finally {
                this.removeObjectSpy.restore()
                this.postRemoveObjectOperationSpy.restore()
              }
            },
            reqSpec: function(context) {
              return {
                url: '/removeObject/0',
                method: 'DELETE',
                headers: {
                  'x-pong': ejson.stringify({
                    removeObject: [{[context.global.idParameter]: '0', foo: 'bar'}]
                  })
                }
              }
            },
            resSpec: {
              statusCode: 500
            }
          },
        ]
      })
    ]
  })
})

