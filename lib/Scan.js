var Predicates = require("./Predicates")
  , Attributes = require("./Attributes")

function Scan(table, database) {
  this.TableName = table

  Object.defineProperty(
    this, "database",
    {value: database, enumerable: false}
  )
}

Scan.prototype = {
  filter: function(predicates) {
    this.ScanFilter = new Predicates(predicates)

    return this
  },

  get: function() {
    this.AttributesToGet = Array.prototype.concat.apply([], arguments)

    return this
  },

  count: function() {
    this.Count = true

    return this
  },

  limit: function( count ){
    var i = parseInt( count, 10 )
    if( !isNaN( i ) ){
      this.Limit = i
    }
    return this
  },

  startAt: function(predicates) {
    var predicates = new Attributes(predicates)
      , keys = Object.keys(predicates)
      , hashKey = keys[0]
      , rangeKey = keys[1]

      if (keys.length != 2) {
        throw new Error("Both hash and range keys are required for a `cursor` definition.")
      }

      this.ExclusiveStartKey = predicates
      
      return this
  },

  fetch: function(cb) {
    var self = this
      , response = []

    !function loop(ExclusiveStartKey) {
      // redefine the ExclusiveStartKey with the last LastEvaluatedKey
      if (typeof ExclusiveStartKey !== "undefined" && ExclusiveStartKey !== null) {
        self.ExclusiveStartKey = ExclusiveStartKey;
      }else{
        self.ExclusiveStartKey = undefined;
      }
      self.database.request(
        "Scan",
        self,
        function fetch(err, data) {
          if (err) return cb(err)

          if (self.Count) return cb(null, data.Count)

          data.Items.forEach(function(item) {
            response.push(Attributes.prototype.parse(item))
          })

          if (data.LastEvaluatedKey && self.Limit == undefined )
         	loop(data.LastEvaluatedKey)
          else 
          	cb(null, response)
        }
      )
    }(this.ExclusiveStartKey)

  }
}

module.exports = Scan
