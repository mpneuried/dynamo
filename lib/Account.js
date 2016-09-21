var crypto = require("crypto")
  , Database = require("./Database")
  , Session = require("./Session")
  , aws4 = require("aws4")

  , regions = {
      "us-east-1": true,
      "us-west-1": true,
      "us-west-2": true,
      "ap-northeast-1": true,
      "ap-southeast-1": true,
      "eu-west-1": true,
      "eu-central-1": true
    }

function Account(credentials) {
  this.session = new Session(credentials)
}

Account.prototype.get = function(host) {
  var database = new Database(this)
    , badHost = !(host in regions)

  if (badHost) {
    console.error(
      "WARN: Assuming 'us-east-1' for backward compatibility.\n" +
      "Please use client.get(region).get(table) instead, as this will soon be deprecated."
    )

    database.host = "dynamodb.us-east-1.amazonaws.com"
    return database.get(host)
  }

  database.host = "dynamodb." + host + ".amazonaws.com"
  return database
}

Account.prototype.sign = function sign(request, cb) {
  this.session.fetch(function(err, session) {
    if (err) return cb(err)

    signed = aws4.sign({
      service: 'dynamodb',
      host: request.host,
      headers: request.headers,
      body: request.json
    }, session.tokenCredentials.creds( session.token ) )
    
    request.headers = signed.headers
    request.method = signed.method
    
    cb(null, request)
  })
}

module.exports = Account
