var publicjs = require("../public"),
    assert = require("assert"),
    pattern4path = __dirname + "/fixtures/patterns/pattern4.js",
    pattern4apath = __dirname + "/fixtures/patterns/pattern4a.js",
    fs = require("fs"),
    file = fs.readFileSync(pattern4path).toString(),
    file2 = fs.readFileSync(pattern4apath).toString();


describe('Pattern4', function(){
    it('should find the globals', function(){
      var output = publicjs.getPublic(file);
      
      assert.equal(typeof output["pattern4"] !== 'undefined',true);
      
      output = publicjs.getPublic(file,{ tree: true });

      assert.equal(output[0].name === "pattern4",true);
      assert.equal(output[0].children[0].name === "pattern4Fcn",true);
     
    });
    it('should find the globals for 4a',function(){
      var output = publicjs.getPublic(file2);
      
      assert.equal(typeof output["pattern4"] !== 'undefined',true);
      
      output = publicjs.getPublic(file2,{ tree: true });

      assert.equal(output[0].name === "pattern4",true);
      assert.equal(output[0].children[0].name === "pattern4public",true);
    });
});
