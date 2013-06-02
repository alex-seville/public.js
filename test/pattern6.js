var publicjs = require("../public"),
    assert = require("assert"),
    pattern1path = __dirname + "/fixtures/patterns/pattern6.js",
    fs = require("fs"),
    file = fs.readFileSync(pattern1path).toString();


describe('Pattern6', function(){
    it('should find the globals', function(){
      var output = publicjs.getPublic(file);
      
      assert.equal(typeof output["pattern6"] !== 'undefined',true);
      
      output = publicjs.getPublic(file,{ tree: true });

      assert.equal(output[0].name === "pattern6",true);
      assert.equal(output[0].params[0].name === "param",true);
     
    });
});
