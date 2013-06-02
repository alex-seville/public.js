(function(){
    var root=this;
    root.pattern7 = function(param){
        function pattern7Private2(){
            return "should not be testable";
        }
        return param;
    };
    function pattern7Private(){
        return "should not be testable";
    }
})(this);