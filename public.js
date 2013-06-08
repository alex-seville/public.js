var jsdom, esprimaLib, exportVar,
 UNDEFINED='undefined',
 OBJECT='object',
 NATIVE_CODE='[native code]';

//Determine if we're running this in the browser or not.
if (typeof window === UNDEFINED){
    jsdom = require("jsdom").jsdom;
    esprimaLib = require("esprima");
    exportVar = exports;
}else{
    if (typeof esprima === UNDEFINED){
        throw new Error("Missing Esprima dependency. esprima.org.");
    }
    esprimaLib = esprima;
    exportVar = window.publicjs = {};
}

//Utility functions
var attachDependencies = function(deps,win){
    deps.forEach(function(s){
        attachScript(s,win);
    });
};

var attachScript = function(script,win){
    var scriptEl = win.document.createElement("script");
    scriptEl.text = script;
    win.document.body.appendChild(scriptEl);
};

var isNativeCode = function(code){
    //this should be a regex
    return (
        code.indexOf(NATIVE_CODE) === -1 &&
        code.indexOf(" native function ") === -1
    );
};

var parseFunction = function(fcn){
    try{
        var parsed = esprimaLib.parse("(" + fcn + ")", { tolerant: true });
        return parsed.body[0].expression.params;
    }catch(e){
        if (isNativeCode(fcn)){
            throw new Error(" ERROR parsing: "+fcn);
        }
    }
};

exportVar.getPublic = function(script,options){
    var options = options || {},
        keys,newKeys,win,outputObj,included=[],
        offset,newVarSplit,createVar,currentObj,currentWindow,seen;

        //if we want accessor errors to fail, we can do that here
        //otherwise they get added to the tree
        var accessorError = function(name,details){
            if (options.throwErrors){
                throw new Error("Accessor error on "+name+" of "+details);
            }
        };

        //recursive method for generating parse tree
        var makeTree = function(obj){
            var tree=[],val;
            
            if (!obj){
                return;
            }
            //slow search to see if we've already seen this object
            //to avoid infinite recursion
            for(var i=0;i<seen.length;i++){
                if (seen[i] == obj){
                    tree.push({ circular: true });
                    return;
                }
            }
            //save the fact that we've seen it now
            if (obj != {}){
                seen.push(obj);
            }

            var keys = Object.keys(obj);
            //go through each of the enumerable keys
            keys.forEach(function(key){
                try{
                    //let's see if we can access the property
                    val = obj[key];
                }catch(e){
                    //we had a problem accessing the property,
                    //let's handle it
                    accessorError(key,obj);
                    tree.push({
                        name: key,
                        type: 'accessor function'
                    });
                    return;
                } 
                //create a new leaf
                var newobj = {
                    name: key,
                    type: typeof val
                };
                if (typeof val === OBJECT){
                    newobj.children = makeTree(val);
                }else if (typeof val === 'function'){
                    //if it's a function we capture the parameters
                    newobj.params = parseFunction(val.toString());
                    if (Object.keys(val).length > 0){
                        newobj.children = makeTree(val);
                    }
                    //and we capture anything that's living on the prototype
                    if (val.prototype && 
                          typeof val.prototype === OBJECT &&
                          isNativeCode(
                            val.prototype.constructor.toString()
                          )
                    ){
                        if (Object.keys(val.prototype).length > 0){
                            newobj.prototype = makeTree(val.prototype);
                        }
                    }
                }else{
                    newobj.value = val;
                }
                //and the leaf to the tree
                tree.push(newobj);
            });
            return tree;
        };

    //create the window
    win = typeof window !== UNDEFINED ? window : jsdom().createWindow();

    //load dependencies
    if (options.dependencies && options.dependencies.length > 0){
        attachDependencies(options.dependencies,win);
    }
    //save starting state of global keys
    keys = Object.keys(win);
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
    attachScript(script,win);

    //get the changed state of global variables
    newKeys = Object.keys(win);

    //construct the output object
    outputObj = {};

    newKeys.forEach(function(k){
        if (keys.indexOf(k) === -1){
            try{
                //try accessing the property directly
                outputObj[k] = win[k];
            }catch(e){
                //there was an error accessing the property
                accessorError(k,win);
            }  
        }else if (included.indexOf(k) > -1){
            //we need to copy included variables, if present,
            //and parse down
            offset = included.indexOf(k);
            //now we need to include the variable listed in
            //the include option
            newVarSplit = options.includeList[offset].split('.');
            createVar = newVarSplit.pop();
            currentObj=outputObj;
            currentWindow=win;
            newVarSplit.forEach(function(s){
                if (!currentObj[s]){
                    currentObj[s]={};
                }
                currentObj = currentObj[s];
                try{
                    currentWindow = currentWindow[s];
                }catch(e){
                    accessorError(s,currentWindow);
                }
            });
            currentObj[createVar]=currentWindow[createVar];
        }
    });
    if (options.tree){
        //create and return a tree
        seen=[];
        return makeTree(outputObj);
    }
    //otherwise return the new object
    return outputObj;
};
