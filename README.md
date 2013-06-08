### Public.js


This library analyzes JavaScript code and returns all the public interfaces exposed at runtime.

See live demo at: http://alex-seville.github.io/public.js/


##Install

`npm install public.js`

Browser-based version may be available in the future.


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

1. Automated unit test scaffolding: The tree returned by publicjs could be parsed and used to automatically create unit test cases based on the publically exposed functions.  See example at [Scaffold.js](https://github.com/alex-seville/scaffold.js).

2. Code security: Add publicjs to your build process to ensure that only the functionality that should be exposed publically by your code is, and that private functions are not accessible.

3. Code documentation: The interface tree could be parsed to automatically generate documentation for public methods.  See example at [Scaffold.js](https://github.com/alex-seville/scaffold.js).
