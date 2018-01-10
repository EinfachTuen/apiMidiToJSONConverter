var express = require('express');
var fs = require('fs');
var midiConverter = require('midi-converter');
var router = express.Router();
var fileUpload = require('express-fileupload');
router.use(fileUpload());
router.post('/toText', function(req, res) {
    if (!req.files)
        return res.status(400).send('No files were uploaded.');
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    console.log(req.files)
    let sampleFile = req.files.file;
    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv('new.mid', function(err) {
        if(err) return res.status(500).send(err);
        let midiSong = fs.readFileSync('music/midi.mid', 'binary');
        let jsonSong = midiConverter.midiToJson(midiSong);
        console.log(jsonSong.tracks[1]);
        res.send(jsonSong);
       /* console.log("jsonSong",jsonSong)
        let createdSong = midiConverter.jsonToMidi(jsonSong);
        fs.writeFileSync('example.mid', createdSong, 'binary');*/
    });
});
router.post('/loadToText', function(req, res) {
    let midiSong = fs.readFileSync('music/midi.mid', 'binary');
    let jsonSong = midiConverter.midiToJson(midiSong);
    //console.log(jsonSong.tracks[1]);
    let tracks = [];
    jsonSong.tracks[1].forEach(event => {
        if(event.subtype === "noteOn" || event.subtype === "noteOff"){
            tracks.push(event);
            console.log("event",event);
        }
    });
    res.send(tracks);
});
router.get('/loadToText', function(req, res) {
    let midiSong = fs.readFileSync('music/midi.mid', 'binary');
    let jsonSong = midiConverter.midiToJson(midiSong);
    console.log(jsonSong.tracks[1]);
    res.render('index', { jsonSong: tracks });
});
router.post('/toMid', function(req, res) {
    //console.log("data",req.data);
    //console.log("body 1234:",req.body);
    if (!req.body.midAsJson || !req.body.name )
        return res.status(400).send('No files were uploaded.');
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    console.log("req.body.midAsJson",req.body.midAsJson);
    var createdSong = midiConverter.jsonToMidi(JSON.parse(req.body.midAsJson));
    fs.writeFileSync('public/'+req.body.name+'.mid', createdSong, 'binary');
    res.send(req.body.name);
});

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log(req.query);
    console.log("got get request");

    /*var midiSong = fs.readFileSync('music/midi.mid', 'binary');
    var jsonSong = midiConverter.midiToJson(midiSong);
    console.log(jsonSong.tracks[1]);
    var createdSong = midiConverter.jsonToMidi(jsonSong);
    fs.writeFileSync('example.mid', createdSong, 'binary');
});
router.post('/', function(req, res, next) {
    console.log(req);
    /*var midiSong = fs.readFileSync('music/midi.mid', 'binary');
    var jsonSong = midiConverter.midiToJson(midiSong);
    console.log(jsonSong.tracks[1]);
    var createdSong = midiConverter.jsonToMidi(jsonSong);
    fs.writeFileSync('example.mid', createdSong, 'binary');*/
});

module.exports = router;
