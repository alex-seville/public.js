### Public.js


This library analyzes JavaScript code and returns all the public interfaces exposed at runtime.  Works on node and in the browser.

See live demo at: http://alex-seville.github.io/public.js/

See applications at: https://github.com/alex-seville/grunt-public-js


##Install

Node: `npm install public.js`

Browser: `bower install public.js`


##Example

```
/* this is the code we want to analyze

function pattern1(param){

    function pattern1Private(){
        return "should not be testable";
    }

    return param;
}
var pattern1Variable = "testable";

*/
var inputStr = <string representation of code to analyze>;


var output = publicjs.getPublic(backboneStr,{
        dependencies: [underscoreStr],
        tree: true
      });
console.log(output);
```

Result: 
```
[ 
  { name: 'pattern1', type: 'function', parameters: [{ name: 'param' }] },
  { name: 'pattern1Variable', type: 'string', value: 'testable' } 
]
```  



##Applications

See [grunt-public-js](https://github.com/alex-seville/grunt-public-js) for sample implementations of this applications.

1. Automated unit test scaffolding: The tree returned by publicjs could be parsed and used to automatically create unit test cases based on the publically exposed functions. 

2. Code security: Add publicjs to your build process to ensure that only the functionality that should be exposed publically by your code is, and that private functions are not accessible.

3. Code documentation: The interface tree could be parsed to automatically generate documentation for public methods.  
