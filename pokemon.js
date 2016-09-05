//Module to get Pokemon data, either from file or api. Warning: API blocked when last check due to cloudflare/ddos.
var exports=module.exports={};

var request=require("request");
var fs=require("fs");

exports.names=function(callback){
    try{
        var data=JSON.parse(fs.readFileSync("./pokefiles/pokecache.json"));
        arrayatise(data,function(result){

            console.log("Loaded local cache...");
            try{
                getdetails(data,function(detresult){
                callback(result,detresult);
                });
            }
            catch(error){
                console.log("Detail retrievial screwed up with error: "+error);
                callback(result);
            }
        });
    }
    catch(err){
        console.log("Cache not found with error: "+err);
        request.get('http://pokeapi.co/api/v2/pokemon/?limit=151',function(err,res,body){
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
};

function arrayatise(raw,callback){
        var outp=[];
        var cnt=raw.results.length;

        for(var x=0;x<cnt;x++){
            outp[x]=capitalise(raw.results[x].name) //trying to set first letter to uppercase
        };

        console.log("Primed...");
        callback(outp);
};

function getdetails(raw,callback){
    console.log("Getting details... "+raw.results.length);
    var retdetails=[];
    var retrieved;
    throttle=0;
    for(var z=0;z<raw.results.length;z++){
        try{
            retdetails[z]=JSON.parse(fs.readFileSync("./pokefiles/pokemondetails/"+raw.results[z].name+".json"));
            //console.log("Loaded local details...");
            callback(retdetails);
        }
        catch(error){
            if(throttle>=5){
                break
            };
            throttle+=1;
            console.log("Retrieving pokedetes with error: "+error);
            request.get('http://pokeapi.co/api/v2/pokemon/'+raw.results[z].name,function(err,res,body){
                retdetails[z]=JSON.parse(body);
                console.log("Had to request details for: "+retdetails[z].forms[0].name);
                fs.writeFile("./pokefiles/pokemondetails/"+retdetails[z].name+".json",body);
                callback(retdetails);
            });
        };
    };
    console.log("Details loaded...");
};