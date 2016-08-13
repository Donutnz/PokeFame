//deprecated, not in use
var exports=module.exports={};

var request=require("request");
var fs=require("fs");

exports.names=function(callback){
    try{
        var data=JSON.parse(fs.readFileSync("./pokefiles/pokecache.json"));
        var result=arrayatise(data);
        callback(result);
        console.log("Loaded local cache...");
    }
    catch(err){
        console.log(err);
        request.get('http://pokeapi.co/api/v2/pokemon/?limit=152',function(err,res,body){
            console.log(err);
            fs.writeFile("./pokefiles/pokecache.json",body);
            var data=JSON.parse(body);
            callback(arrayatise(data));
            console.log("Local cache not found, had to request...")
        });
    }
};

function capitalise(name){
    return name.charAt(0).toUpperCase() + name.slice(1);
}

function arrayatise(raw){
        var outp=[];
        var cnt=raw.results.length;

        for(var x=0;x<cnt;x++){
            outp[x]=capitalise(raw.results[x].name) //trying to set first letter to uppercase
        }

        console.log("Primed...");
        return outp;
};