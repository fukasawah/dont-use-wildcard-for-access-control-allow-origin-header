var express = require('express')
var app = express()

app.use(express.static('public'))

const ORIGIN_WHITE_LIST = [
    'http://myapp.example',
    'http://trust.example', // Trusted!
];


app.use(function(req, res, next){
    
    // BAD
    // res.header("Access-Control-Allow-Origin", "*");
    // res.header("Access-Control-Allow-Methods", 'POST, GET, OPTIONS');
    // res.header("Access-Control-Allow-Headers", "Origin,Hello");
    // next();
    // return;

    // GOOD
    const requestOrigin = req.header('Origin')
    if(!requestOrigin){
        next();
        return;
    }
    const allowOrigin = ORIGIN_WHITE_LIST.find((item) => item === requestOrigin)
    if(!allowOrigin){
        next();
        return;
    }

    if(req.path === '/hello'){
        res.header("Access-Control-Allow-Origin", allowOrigin);
        res.header("Vary", "Origin");
        if(req.method.toUpperCase() === 'OPTIONS'){ // 以下はPrefright時のときだけでよい
            res.header("Access-Control-Allow-Methods", 'POST, GET, OPTIONS');
            res.header("Access-Control-Allow-Headers", "Origin,Hello");
        }
    }
    next();
})

// Hello API
app.post('/hello', function (req, res) {
    if(req.header("Hello")){
        res.send('Hello World')
    }else{
        res.send()
    }
})

app.listen(80)