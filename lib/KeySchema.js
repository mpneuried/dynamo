var types = {S: String, N: Number, B: Boolean }
  , keys = ["HashKeyElement", "RangeKeyElement"]

function KeySchema(attrs) {
	this.AttributeDefinitions = [];
	this.KeySchema = [];
  attrs && Object.keys(attrs).forEach(function(name, pos) {
    if (pos > 1) throw new Error("More than two keys specified.")
	this.AttributeDefinitions.push( { AttributeName: name, AttributeType: attrs[ name ].name.charAt(0) } )
	 if( keys[pos] === "HashKeyElement" ){
		this.KeySchema.push( { AttributeName: name, KeyType: "HASH" } )
	 }else{
		this.KeySchema.push( { AttributeName: name, KeyType: "RANGE" } )
	 }	
    this[keys[pos]] = new SchemaKey(name, attrs[name])
		
  }, this)
}

KeySchema.prototype = {
  parse: function(data) {
	var _schema, _atd, i, len, typeIdx = {};
	this.AttributeDefinitions = [];
	this.KeySchema = [];
	for (i = 0, len = data.AttributeDefinitions.length; i < len; i++) {
		_atd = data.AttributeDefinitions[i];
		typeIdx[ _atd.AttributeName ] = data.AttributeType;
		this.AttributeDefinitions.push( _atd )
	}
	for (i = 0, len = data.KeySchema.length; i < len; i++) {
		 _schema = data.KeySchema[i];
		 if( _schema.keyType === "HASH" ){
			 this.HashKeyElement = (new SchemaKey).parse( { "AttributeName": _schema.AttributeName, "AttributeType": typeIdx[ _schema.AttributeName ] } )
		 } else if(_schema.keyType === "RANGE") {
			 this.RangeKeyElement = (new SchemaKey).parse( { "AttributeName": _schema.AttributeName, "AttributeType": typeIdx[ _schema.AttributeName ] } )
		 }
		 this.KeySchema.push( _schema )
	}
    return this
  }
}

function SchemaKey(name, type) {
  this.AttributeName = name
  this.AttributeType = type
}

SchemaKey.prototype = {
  toJSON: function() {
    return {
      AttributeName: this.AttributeName,
      AttributeType: this.AttributeType.name.charAt(0)
    }
  },

  parse: function(data) {
    this.AttributeName = data.AttributeName,
    this.AttributeType = types[data.AttributeType]

    return this
  }
}

module.exports = KeySchema
