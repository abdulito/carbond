var _ = require('lodash')

var _o = require('@carbon-io/carbon-core').bond._o(module)
var oo = require('@carbon-io/carbon-core').atom.oo(module)

var RemoveObjectConfig = require('../collections/RemoveObjectConfig')

/***************************************************************************************************
 * @class MongoDBRemoveObjectConfig
 */
module.exports = oo(_.assignIn({
  /***************************************************************************
   * _type
   */
  _type: RemoveObjectConfig,

  /*****************************************************************************
   * @constructs MongoDBRemoveObjectConfig
   * @description The MongoDB remove object operation config
   * @memberof carbond.mongodb
   * @extends carbond.collections.RemoveObjectConfig
   * @mixes carbond.mongodb.MongoDBCollectionOperationConfig
   */
  _C: function() { }
}, _o('./MongoDBCollectionOperationConfig')))
