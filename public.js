var jsdom = require("jsdom").jsdom,
    esprima = require("esprima");

 var attachDependencies = function(deps,window){
    deps.forEach(function(s){
        attachScript(s,window);
    });
 };

 var attachScript = function(script,window){
    var scriptEl = window.document.createElement("script");
    scriptEl.text = script;
    window.document.body.appendChild(scriptEl);
 }


var makeTree = function(obj){
    var tree=[];
    
    if (!obj){
        return;
    }
    
    var keys = Object.keys(obj);

    keys.forEach(function(key){
        var newobj = {
            name: key,
            type: typeof obj[key]
        };
        if (typeof obj[key] === 'object'){
            newobj.children = makeTree(obj[key]);
        }else if (typeof obj[key] === 'function'){
            newobj.params = parseFunction(obj[key].toString());
            if (Object.keys(obj[key]).length > 0){
                newobj.children = makeTree(obj[key]);
            }
            if (obj[key].prototype && typeof obj[key].prototype === 'object'){
                if (Object.keys(obj[key].prototype).length > 0){
                    newobj.prototype = makeTree(obj[key].prototype);
                }
            }
        }else{
            newobj.value = obj[key];
        }
        tree.push(newobj);
    });

    return tree;
};

var parseFunction = function(fcn){
    try{
        var parsed = esprima.parse("("+fcn+")", { tolerant: true });
        return parsed.body[0].expression.params;
    }catch(e){
        if (fcn.indexOf("[native code]") === -1){
            throw new Error(" ERROR parsing: "+fcn);
        }
    }
};

exports.getPublic = function(script,options){
    var options = options || {},
        keys,newKeys,window,outputObj,included=[],
        offset,newVarSplit,createVar,currentObj,currentWindow;

    //create the window
    window = jsdom().createWindow();

    //load dependencies
    if (options.dependencies && options.dependencies.length > 0){
        attachDependencies(options.dependencies,window);
    }
    //save starting state of global keys
    keys = Object.keys(window);
    if (options.ignoreList && options.ignoreList.length > 0){
        options.ignoreList.forEach(function(variable){
            keys.push(variable);
        });
    }
    if (options.includeList && options.includeList.length > 0){
        options.includeList.forEach(function(variable){
            included.push(variable.split('.')[0]);
        });
    }

    //now add our script
    attachScript(script,window);

    //get the changed state of global variables
    newKeys = Object.keys(window);

    //construct the output object
    outputObj = {};

    newKeys.forEach(function(k){
        if (keys.indexOf(k) === -1){
            outputObj[k] = window[k];
        }else if (included.indexOf(k) > -1){
            offset = included.indexOf(k);
            //now we need to include the variable listed in
            //the include option
            newVarSplit = options.includeList[offset].split('.');
            createVar = newVarSplit.pop();
            currentObj=outputObj;
            currentWindow=window;
            newVarSplit.forEach(function(s){
                if (!currentObj[s]){
                    currentObj[s]={};
                }
                currentObj = currentObj[s];
                currentWindow = currentWindow[s];
            });
            currentObj[createVar]=currentWindow[createVar];
        }
    });
    if (options.tree){
        //create and return a tree
        return makeTree(outputObj);
    }
    //otherwise return the new object
    return outputObj;
};
