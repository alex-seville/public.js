var publicjs = require("../public"),
    assert = require("assert"),
    pattern5path = __dirname + "/fixtures/patterns/pattern5.js",
    pattern5apath = __dirname + "/fixtures/patterns/pattern5a.js",
    fs = require("fs"),
    file = fs.readFileSync(pattern5path).toString(),
    file2 = fs.readFileSync(pattern5apath).toString();


describe('Pattern5', function(){
    it('should find the globals', function(){
      var output = publicjs.getPublic(file);
      
      assert.equal(typeof output["pattern5"] !== 'undefined',true);
      
      output = publicjs.getPublic(file,{ tree: true });

      assert.equal(output[0].name === "pattern5",true);
      assert.equal(output[0].params[0].name === "param",true);
     
    });
    it('should find the globals for 5a', function(){
      var output = publicjs.getPublic(file2);
      
      assert.equal(typeof output["pattern5a"] !== 'undefined',true);
      
      output = publicjs.getPublic(file2,{ tree: true });

      assert.equal(output[0].name === "pattern5a",true);
      assert.equal(output[0].children[0].name === "pattern5",true);
      assert.equal(output[0].children[0].params[0].name === "param",true);
     
    });
});
