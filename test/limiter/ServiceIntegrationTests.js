var assert = require('assert')

var _ = require('lodash')
var sinon = require('sinon')

var o  = require('atom').o(module)
var oo  = require('atom').oo(module)

var limiters = require('../../lib/security/Limiter')
var ApiKeyAuthenticator = require('../../lib/security/ApiKeyAuthenticator')
var Service = require('../../lib/Service')
var Endpoint = require('../../lib/Endpoint')
var Operation = require('../../lib/Operation')
var ServiceTest = require('../../lib/test/ServiceTest')

var CountDownLimiter = oo({
  _type: limiters.FunctionLimiter,

  _C: function() {
    this.name = 'changeme'
    this.maxVisits = 2
  },

  _init: function() {
    limiters.FunctionLimiter.prototype._init.call(this)
    this.state.visits = this.maxVisits
  },

  fn: function(req, res, next) {
    if (this.state.visits <= 0) {
      return this.sendUnavailable(res, this.name)
    }
    this.state.visits--
    next()
  }
})

var SimpleOperation = oo({
  _type: Operation,
  service: function() {
    return this.endpoint.path + '::' + this.name
  }
})

var TestService = {
  _type: Service,

  description: 'Service/Limiter integration testing',

  hostname: '127.0.0.1',
  port: 8888,

  verbosity: 'warn',

  enableBusyLimiter: false,

  authenticator: o({
    _type: ApiKeyAuthenticator,
    apiKeyParameterName: 'Api-Key',
    apiKeyLocation: 'header'
  }),

  limiter: o({
    _type: CountDownLimiter,
    name: 'serviceLimiter'
  }),

  endpoints: {
    foo: o({
      _type: Endpoint,
      limiter: o({
        _type: CountDownLimiter,
        preAuth: true,
        maxVisits: 4,
        name: '/foo::EndpointLimiter'
      }),
      get: o({
        _type: SimpleOperation,
        limiter: o({
          _type: CountDownLimiter,
          preAuth: true,
          maxVisits: 2,
          name: '/foo::get::OperationLimiter'
        })
      }),
      post: o({
        _type: SimpleOperation,
        limiter: o({
          _type: CountDownLimiter,
          preAuth: false,
          maxVisits: 2,
          name: '/foo::post::OperationLimiter'
        })
      }),
      endpoints: {
        bar: o({
          _type: Endpoint,
          limiter: o({
            _type: CountDownLimiter,
            maxVisits: 1,
            name: '/foo/bar::EndpointLimiter'
          }),
          get: o({
            _type: SimpleOperation,
          }),
        }),
      }
    }),
    bar: o({
      _type: Endpoint,
      limiter: o({
        _type: CountDownLimiter,
        preAuth: false,
        maxVisits: 4,
        name: '/bar::EndpointLimiter'
      }),
      get: o({
        _type: SimpleOperation,
        limiter: o({
          _type: CountDownLimiter,
          preAuth: true,
          maxVisits: 2,
          name: '/foo::get::OperationLimiter'
        })
      }),
      post: o({
        _type: SimpleOperation,
        limiter: o({
          _type: CountDownLimiter,
          preAuth: false,
          maxVisits: 2,
          name: '/foo::post::OperationLimiter'
        })
      }),
      endpoints: {
        foo: o({
          _type: Endpoint,
          limiter: o({
            _type: CountDownLimiter,
            maxVisits: 1,
            name: '/bar/foo::EndpointLimiter'
          }),
          get: o({
            _type: SimpleOperation,
          }),
        })
      }
    })
  }
}

module.exports = o({
  _type: ServiceTest,
  name: 'ServiceIntegrationTests',
  description: 'Service integration tests',
  service: o(TestService),
  _init: function() {
    ServiceTest.prototype._init.call(this)
  },
  setup: function () {
    ServiceTest.prototype.setup.call(this)
    sinon.stub(ApiKeyAuthenticator.prototype, 'findUser', function() {
      return {
        username: 'foo'
      }
    })

    // /foo
    sinon.spy(this.service.endpoints.foo.limiter, 'process')

    // /foo#get
    sinon.spy(this.service.endpoints.foo.get.limiter, 'process')

    // /foo#post
    sinon.spy(this.service.endpoints.foo.post.limiter, 'process')

    // /foo/bar
    sinon.spy(this.service.endpoints.foo.endpoints.bar.limiter, 'process')

    // /bar
    sinon.spy(this.service.endpoints.bar.limiter, 'process')

    // /bar#get
    sinon.spy(this.service.endpoints.bar.get.limiter, 'process')

    // /bar#post
    sinon.spy(this.service.endpoints.bar.post.limiter, 'process')

    // /bar/foo
    sinon.spy(this.service.endpoints.bar.endpoints.foo.limiter, 'process')
  },
  teardown: function () {
    ServiceTest.prototype.teardown.call(this)
    ApiKeyAuthenticator.prototype.findUser.restore()

    // /foo
    this.service.endpoints.foo.limiter.process.restore()

    // /foo#get
    this.service.endpoints.foo.get.limiter.process.restore()

    // /foo#post
    this.service.endpoints.foo.post.limiter.process.restore()

    // /foo/bar
    this.service.endpoints.foo.endpoints.bar.limiter.process.restore()

    // /bar
    this.service.endpoints.bar.limiter.process.restore()

    // /bar#get
    this.service.endpoints.bar.get.limiter.process.restore()

    // /bar#post
    this.service.endpoints.bar.post.limiter.process.restore()

    // /bar/foo
    this.service.endpoints.bar.endpoints.foo.limiter.process.restore()
  },
  tests: [
    {
      reqSpec: {
        url: 'http://127.0.0.1:8888/foo',
        method: 'get',
        headers: {
          'Api-Key': 'foo'
        }
      },
      resSpec: {
        statusCode: 200,
        body: '/foo::get'
      }
    },
    {
      reqSpec: {
        url: 'http://127.0.0.1:8888/foo',
        method: 'get',
        headers: {
          'Api-Key': 'foo'
        }
      },
      resSpec: {
        statusCode: 200,
        body: '/foo::get'
      }
    },
    {
      reqSpec: {
        url: 'http://127.0.0.1:8888/foo',
        method: 'get',
        headers: {
          'Api-Key': 'foo'
        }
      },
      resSpec: {
        statusCode: 503,
        body: {
          code: 503,
          description: 'Service Unavailable',
          message: '/foo::get::OperationLimiter'
        }
      }
    }
  ]
})
