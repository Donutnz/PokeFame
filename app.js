var app=require("express")();
var http=require("http").Server(app);
var io=require("socket.io")(http);

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

http.listen(3000,function(){
    console.log("Listening on *:3000");
});

//Twitter stuff beyond this point.

var Twit=require("twit");
var toauth=require("./TCreds.js");
var tpics=["#pokemon","#pokemongo","#Pokemon","#PokemonGo"];

var T=new Twit(toauth);

var filters={
    track:tpics,
    language:"en"
};

var stream=T.stream("statuses/filter",filters);

stream.on("tweet",function(tweet){
    //ltst=tweet;
    io.sockets.emit("updte",tweet)
    console.log(tweet.user.screen_name);
    console.log("---");
});