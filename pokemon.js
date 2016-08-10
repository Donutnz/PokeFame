//deprecated, not in use
var exports=module.exports={};

var request=require("request");

exports.names=function(callback){
    request.get('http://pokeapi.co/api/v2/pokemon/?limit=151',function(err,res,body){
        var data=JSON.parse(body);
        //console.log(data.count+"\n\n\n\n\n\n\n\n\n\n\n\n");
        console.log("Primed...");

        var outp=[];
        var octooutp=[];
        var cnt=data.results.length;

        for(var x=0;x<cnt;x++){
            outp[x]=data.results[x].name;
            octooutp[x]="#"+data.results[x].name;
        }
        callback(outp.concat(octooutp));
    });
};