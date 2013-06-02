var publicjs = require("../public"),
    assert = require("assert"),
    underscore = __dirname + "/fixtures/underscore.js",
    backbone = __dirname + "/fixtures/backbone.js",
    bootstrap_alert = __dirname + "/fixtures/bootstrap-alert.js",
    jquery = __dirname + "/fixtures/jquery.js",
    fs = require("fs"),
    underscoreFile = fs.readFileSync(underscore).toString(),
    backboneFile = fs.readFileSync(backbone).toString(),
    bootstrapAlertFile = fs.readFileSync(bootstrap_alert).toString(),
    jqueryFile = fs.readFileSync(jquery).toString();


describe('non dep', function(){
    it('should find the globals', function(){
      var output = publicjs.getPublic(underscoreFile);
      
      assert.equal(typeof output["_"] !== 'undefined',true);
      assert.equal(typeof output["_"].forEach !== 'undefined',true);

      output = publicjs.getPublic(underscoreFile,{ tree: true });

      assert.equal(output[0].name === "_",true);
      assert.equal(output[0].children[0].name === "VERSION",true);
     
    });
});

describe('with dep', function(){
    it('should find the globals', function(){
      var output = publicjs.getPublic(backboneFile,{
        dependencies: [underscoreFile]
      });
      
      assert.equal(typeof output["Backbone"] !== 'undefined',true);
      assert.equal(typeof output["Backbone"].History !== 'undefined',true);
      
      output = publicjs.getPublic(backboneFile,{
        dependencies: [underscoreFile],
        tree: true
      });

      assert.equal(output[0].name === "Backbone",true);
      assert.equal(output[0].children[0].name === "VERSION",true);
     
    });
    it('should find the globals', function(){
      var output = publicjs.getPublic(bootstrapAlertFile,{
        dependencies: [jqueryFile]
      });
      
      assert.equal(typeof output["jQuery"] === 'undefined',true);
      
      output = publicjs.getPublic(bootstrapAlertFile,{
        dependencies: [jqueryFile],
        tree: true
      });

      assert.equal(output.length === 0,true);
     
    });
});

describe('with dep and include', function(){
    it('should find the globals', function(){
      var output = publicjs.getPublic(bootstrapAlertFile,{
        dependencies: [jqueryFile],
        includeList: ['jQuery.fn.alert']
      });
      
      assert.equal(typeof output["jQuery"] !== 'undefined',true);
      assert.equal(typeof output["jQuery"].fn.alert !== 'undefined',true);
      
      output = publicjs.getPublic(bootstrapAlertFile,{
        dependencies: [jqueryFile],
        includeList: ['jQuery.fn.alert'],
        tree: true
      });

      assert.equal(output.length > 0,true);
      assert.equal(output[0].name === 'jQuery',true);
      assert.equal(output[0].children[0].name === 'fn',true);
      assert.equal(output[0].children[0].children[0].name === 'alert',true);
     
    });
});
