var jsdom, esprimaLib, exportVar, seen;

if (typeof window === 'undefined'){
    jsdom = require("jsdom").jsdom;
    esprimaLib = require("esprima");
    exportVar = exports;
}else{
    if (typeof esprima === 'undefined'){
        throw new Error("Missing Esprima dependency. esprima.org.");
    }
    esprimaLib = esprima;
    exportVar = window.publicjs = {};
}
 var attachDependencies = function(deps,win){
    deps.forEach(function(s){
        attachScript(s,win);
    });
 };

 var attachScript = function(script,win){
    var scriptEl = win.document.createElement("script");
    scriptEl.text = script;
    win.document.body.appendChild(scriptEl);
 }




var parseFunction = function(fcn){
    try{
        var parsed = esprimaLib.parse("("+fcn+")", { tolerant: true });
        return parsed.body[0].expression.params;
    }catch(e){
        if (fcn.indexOf("[native code]") === -1 && fcn.indexOf(" native function ") === -1){
            throw new Error(" ERROR parsing: "+fcn);
        }
    }
};

exportVar.getPublic = function(script,options){
    var options = options || {},
        keys,newKeys,win,outputObj,included=[],
        offset,newVarSplit,createVar,currentObj,currentWindow,seen;

        var makeTree = function(obj){
            var tree=[],val;
            
            if (!obj){
                return;
            }
            //slow search to see if we've already seen this object
            //to avoid infinite recursion
            for(var i=0;i<seen.length;i++){
                if (seen[i] == obj){
                    tree.push({circular: true});
                    return;
                }
            }
            
            if (obj != {}){
                seen.push(obj);
            }

            var keys = Object.keys(obj);
            
            keys.forEach(function(key){
                try{
                    val = obj[key];
                    var newobj = {
                        name: key,
                        type: typeof val
                    };
                    if (typeof val === 'object'){
                        newobj.children = makeTree(val);
                    }else if (typeof val === 'function'){
                        newobj.params = parseFunction(val.toString());
                        if (Object.keys(val).length > 0){
                            newobj.children = makeTree(val);
                        }
                        if (val.prototype && 
                            typeof val.prototype === 'object' &&
                            val.prototype.constructor.toString().indexOf("[native code]") === -1){
                            if (Object.keys(val.prototype).length > 0){
                                newobj.prototype = makeTree(val.prototype);
                            }
                        }
                    }else{
                        newobj.value = val;
                    }
                    tree.push(newobj);
                }catch(e){
                    if (options.accessorErrors){
                        throw new Error("Accessor error on "+key+" of "+obj);
                    }
                }   
            });
            return tree;
        };

    //create the window
    win = typeof window !== 'undefined' ? window : jsdom().createWindow();

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
                outputObj[k] = win[k];
            }catch(e){
                if (options.accessorErrors){
                    throw new Error("Accessor error on "+k+" of "+win);
                }
            }  
        }else if (included.indexOf(k) > -1){
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
                    if (options.accessorErrors){
                        throw new Error("Accessor error on "+s+" of "+currentWindow);
                    }
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
