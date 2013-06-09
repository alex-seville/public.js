### Public.js


This library analyzes JavaScript code and returns all the public interfaces exposed at runtime.  Works on node and in the browser.

See live demo at: http://alex-seville.github.io/public.js/

See applications at: https://github.com/alex-seville/grunt-public-js


##Install

Node: `npm install public.js`

Browser: `bower install public.js`


##Example

Let's say there's a library in use on a site, but there are no tests written against, no documentation, and limited time/budget to fully analyze the code.  However, some refactoring is required and you want to ensure that the changes cause as few regressions as possible.

With the library file, a list of the dependencies, and public.js you can develop scaffold for unit tests, barebones documentation, and even quickly analyze the code for errors accessing object properties.

It's as easy as:

```
var output = publicjs.getPublic(<source code of library>,{
        dependencies: [<array of dependency source code>],
        tree: true
      });
```
The value of output will be a parse tree, similar to the sample below.  This tree can be applied against a template to generate tests or documentation.

Sample parse tree: 
```
[ 
  { name: 'pattern1', type: 'function', parameters: [{ name: 'param' }] },
  { name: 'pattern1Variable', type: 'string', value: 'testable' } 
]
```  



##Applications

See [grunt-public-js](https://github.com/alex-seville/grunt-public-js) for sample implementations of the following applications:

1. Automated unit test scaffolding - The tree returned by public.js could be parsed and used to automatically create unit test cases based on the publicly exposed functions. 

2. Code security - Add public.js to your build process to ensure that only the functionality that should be exposed publicly by your code is, and that private functions are not accessible.

3. Code documentation - The interface tree could be parsed to automatically generate documentation for public methods.  
