//Main Node.js app for twitter pokemon filtering

var express=require("express");
var app=express();
var http=require("http").createServer(app);
var io=require("socket.io")(http);
var port=process.env.PORT||3000;
var fs=require("fs");

var poke=require("./pokemon.js");

var date=new Date();
date=date.getUTCDate()+"/"+(date.getUTCMonth()+1)+"/"+date.getUTCFullYear();

app.use(express.static(__dirname+"/public"));

app.get("/",function(req,res){
    res.sendFile(__dirname+"/index.html");
});

io.on("connection",function(socket){
    console.log("A user connected");
    io.sockets.emit("setdate",date);
});

http.listen(port,function(){
    console.log("Listening on: "+http.address().address+":"+http.address().port);
});

//Twitter stuff beyond this point.

var Twit=require("twit");
var toauth=require("./TCreds.js");

var T=new Twit(toauth);

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

var ranks=[];

var tps=0;

//Get poke names list, main stuff starts here

poke.names(function(pokes){

var pokefilters={
    track:pokes
};

var stream=T.stream("statuses/filter",pokefilters);

stream.on("tweet",function(tweet){
    for(var x=0;x<=pokes.length;x++){
        if(tweet.text.includes(pokes[x])){
            console.log("Pokeval: "+pokeval[pokes[x]]+" poke: "+pokes[x]);

            if(pokeval[pokes[x]]!=undefined){
                pokeval[pokes[x]]+=1;
                for(var z=0;z<ranks.length;z++){
                    if(ranks[z].name==pokes[x]){
                        break;
                    }
                }
                console.log("z val: "+z);
                if(ranks[z]!=undefined){
                console.log("Rank: "+ranks[z].name);
                }
                else{console.log(pokes[x]+" not ranked yet");}

                if(ranks[z]!=undefined){
                    ranks.splice(z,1);
                    for(var y=0;y<ranks.length;y++){
                        //console.log(y);
                        //console.log("Ranked value: "+ranks[y].count);
                        if(pokeval[pokes[x]]>ranks[y].count){
                            ranks.splice(y,0,{"name":pokes[x],"count":pokeval[pokes[x]]});
                            ranks[y].date=tweet.created_at;
                            console.log("Slotted "+pokes[x]+" at "+y);
                            break;
                        }
                    }
                }                
                else{
                    ranks.push({"name":pokes[x],"count":pokeval[pokes[x]],"date":tweet.created_at});
                    console.log("Slated: "+pokes[x]);
                }

            }
            else{
                pokeval[pokes[x]]=1;
                console.log("New one added: "+pokes[x]);
            }
            fs.writeFile("./pokefiles/pokereg.json",JSON.stringify(pokeval));
            fs.writeFile("./pokefiles/pokeranks.json",JSON.stringify(ranks));
        };
    };
    //io.sockets.emit("updte",ranks); //main info to html
    //console.log(body.results);
    tps++;
    //console.log(tweet.user.screen_name);
    //console.log("---");
    });
});

setInterval(send,2000);

function send(){
    io.sockets.emit("updte",ranks);
    tps=0;
    /*rerank(ranks,function(checkedranks){
        io.sockets.emit("updte",checkedranks);
        //console.log("\nSent update.\nTweets: "+tps+"\n");
        tps=0;
    });*/
};

function rerank(sets,callback){ //probably will be used for recovery after loading non-blank reg file.
    for(var u=1;u<sets.length;u++){
        if(sets[u].count<sets[u-1].count){
            for(var v=1;v<sets.length;v++){
                if(sets[v-1].count>=sets[u].count){
                    sets.splice(u,1);
                    sets.splice(v,0,sets[u]);
                    break;
                }
            }
        }
    }
    callback(sets);
    console.log("\nDid a rerank.");
};