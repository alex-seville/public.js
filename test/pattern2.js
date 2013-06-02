var publicjs = require("../public"),
    assert = require("assert"),
    pattern1path = __dirname + "/fixtures/patterns/pattern2.js",
    fs = require("fs"),
    file = fs.readFileSync(pattern1path).toString();


describe('Pattern2', function(){
    it('should find the globals', function(){
      var output = publicjs.getPublic(file);
      
      assert.equal(typeof output["pattern2"] !== 'undefined',true);
      
      output = publicjs.getPublic(file,{ tree: true });

      assert.equal(output[0].name === "pattern2",true);
      assert.equal(output[0].prototype[0].name === "pattern2Fcn",true);
     
    });
});
