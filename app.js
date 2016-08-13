//var app=require("express")();
var express=require("express");
var app=express();
var http=require("http").createServer(app);
var io=require("socket.io")(http);
var port=process.env.PORT||3000;
var fs=require("fs");

var poke=require("./pokemon.js");
//var pokeval=require("./pokefiles/pokereg.json");

app.use(express.static(__dirname+"/public"));

app.get("/",function(req,res){
    res.sendFile(__dirname+"/index.html");
});

io.on("connection",function(socket){
    console.log("A user connected");
    //socket.emit("updte",ltst);
    socket.on("test",function(msg){
        console.log(msg);
    });
});

http.listen(port,function(){
    //console.log("Listening on *:3000");
    console.log("Listening on: "+http.address().address+":"+http.address().port);
});

//Twitter stuff beyond this point.

var Twit=require("twit");
var toauth=require("./TCreds.js");
//var tpics=["#pokemon","#pokemongo","#Pokemon","#PokemonGo","#pokemonGo"];
var tpics=require("./searchterms.js");

var T=new Twit(toauth);

var filters={
    track:tpics,
    language:"en"
};

//Pokereg file loading
try{
    var pokeval=JSON.parse(fs.readFileSync("./pokefiles/pokereg.json"));
    console.log("Found reg file");
}
catch(err){
    var pokevaltemp=fs.readFileSync("./pokefiles/pokeregTEMPLATE.json");
    fs.writeFileSync("./pokefiles/pokereg.json",pokevaltemp);
    var pokeval=JSON.parse(fs.readFileSync("./pokefiles/pokereg.json"));
    console.log("Made new reg file");
}
finally{
    console.log("Loaded...");
}

var teams=require("./teamssearchterms.js");

/*
var teamM=T.stream("statuses/filter",{track:"#mystic,#teammystic,#teamMystic,#TeamMystic,#Mystic,#Teammystic",language:"en"});
var teamV=T.stream("statuses/filter",{track:"#valor,#teamvalor",language:"en"});
var teamI=T.stream("statuses/filter",{track:"#instinct,#teaminstinct",language:"en"});
*/

//Get poke names list, main stuff starts here

poke.names(function(pokes,octopokes){
var pokemon=pokes.concat(octopokes);

var pokefilters={
    track:pokemon
}
/*
var jsonString=function(callback){fs.readFileSync("./pokefiles/pokereg.json",function(err,data){
    callback=JSON.parse(data);
});}*/
//    var ipt=JSON.parse(fs.readFileSync("./pokefiles/pokereg.json"));



//var jsonObj=JSON.parse(jsonString);

var stream=T.stream("statuses/filter",pokefilters);

stream.on("tweet",function(tweet){
    for(var x=0;x<=pokemon.length;x++){
        if(tweet.text.includes(pokemon[x])){
            if(pokeval[pokes[x]]!=undefined){
                pokeval[pokes[x]]+=1;
                if(pokeval[poke[x]]==undefined){
                    console.log(tweet.user.screen_name+" <-------cheeky bugger");
                }
                //console.log(pokeval[pokemon[x]]);
                /*
                var pos=pokeval.key.indexOf(pokemon[x]);
                pokeval.key[pos].value+=1;
                console.log(pokeval.key[pos].name);*/
            }
            else{
                //fs.appendFile("./pokefiles/pokereg.json","\n{\n\t\""+pokemon[x]+"\":1\n}");
                pokeval[pokes[x]]=1;
                console.log("New one added: "+pokes[x]);
            }
            fs.writeFile("./pokefiles/pokereg.json",JSON.stringify(pokeval));
            //fs.appendFile("./pokefiles/pokereg.json",JSON.stringify({"key":"value"}));
            //console.log(jsonString);
            //jsonObj.key=5;
        };
    };
    //ltst=tweet;
    io.sockets.emit("updte",tweet); //main info to html
    //console.log(body.results);

    /*if(tweet.text=="mystic"){
        io.sockets.emit("mystic",tweet);
        console.log("M");
    };
    if(tweet.txt=="valor"){
        io.sockets.emit("valor");
        console.log("V");
    };
    if(tweet.txt=="instinct"){
        io.sockets.emit("instinct");
        console.log("I");
    };*/
    
    console.log(tweet.user.screen_name);
    console.log("---");
});
});

/*
teamM.on("tweet",function(tweet){
    io.sockets.emit("mystic",tweet)
    console.log("M");
});

teamV.on("tweet",function(tweet){
    io.sockets.emit("valor",tweet)
    console.log("V");
});

teamI.on("tweet",function(tweet){
    io.sockets.emit("instinct",tweet)
    console.log("I");
});*/