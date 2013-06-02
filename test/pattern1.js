var publicjs = require("../public"),
    assert = require("assert"),
    pattern1path = __dirname + "/fixtures/patterns/pattern1.js",
    fs = require("fs"),
    file = fs.readFileSync(pattern1path).toString();


describe('Pattern1', function(){
    it('should find the globals', function(){
      var output = publicjs.getPublic(file);
      
      assert.equal(typeof output["pattern1"] !== 'undefined',true);
      assert.equal(typeof output["pattern1Variable"] !== 'undefined',true);

      output = publicjs.getPublic(file,{ tree: true });

      assert.equal(output[0].name === "pattern1",true);
      assert.equal(output[1].name === "pattern1Variable",true);
     
    });
});
