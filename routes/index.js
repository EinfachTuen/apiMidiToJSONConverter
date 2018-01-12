var express = require('express');
var fs = require('fs');
var midiConverter = require('midi-converter');
var router = express.Router();
var fileUpload = require('express-fileupload');
let MidiConvert = require('midiconvert');

router.use(fileUpload());
router.post('/toText', function(req, res) {
    if (!req.files)
        return res.status(400).send('No files were uploaded.');
    console.log(req.files)
    let sampleFile = req.files.file;
    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv('new.mid', function(err) {
        if(err) return res.status(500).send(err);
        let midiSong = fs.readFileSync('new.mid', 'binary');
        let jsonSong = midiConverter.midiToJson(midiSong);
        console.log(jsonSong.tracks[1]);
        res.send(jsonSong);
    });
});
router.post('/loadToText', function(req, res) {
    let midiSong = fs.readFileSync('music/midi.mid', 'binary');
    let jsonSong = midiConverter.midiToJson(midiSong);
    fs.writeFileSync('jsonSong.json', JSON.stringify(jsonSong, null, 2));
    //console.log(jsonSong.tracks[1]);
    let tracks = [];
    let eventsWithPositionsThatAreNoNotes = [];
    let index = 0;
    jsonSong.tracks[1].forEach(event => {
        if(event.subtype === "noteOn" || event.subtype === "noteOff"){
            tracks.push(event);
           // console.log("event",event);
        }
        index++;
    });
    res.send(tracks);
});
router.get('/loadToText', function(req, res) {
    let midiSong = fs.readFileSync('music/midi.mid', 'binary');
    let jsonSong = midiConverter.midiToJson(midiSong);
   // console.log(jsonSong.tracks[1]);
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
router.post('/toMidSpecial', function(req, res) {
    //console.log("data",req.data);
    //console.log("body 1234:",req.body);
        if (!req.body.midAsJson || !req.body.name )
        return res.status(400).send('No files were uploaded.');
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    console.log(__dirname);
    let before = JSON.parse(fs.readFileSync("before.json", 'utf8'));
    let after = JSON.parse(fs.readFileSync("after.json", 'utf8'));
    let header = {
        "formatType": 1,
            "trackCount": 17,
            "ticksPerBeat": 480
        };
    let result  = {
        header: header,
        tracks: before.tracks,
    };
    console.log(JSON.parse(req.body.midAsJson)[0]);
    JSON.parse(req.body.midAsJson).forEach(event =>{
        result.tracks[1].push(event);
    });

    result.tracks[1].push(after.tracks[0]);
    for(let i = 1; i < after.tracks.length; i++){
       result.tracks.push(after.tracks[i]);
    }
    fs.writeFileSync('jsonSong2.json', JSON.stringify(result, null, 2));
    //console.log("result",result);
    var createdSong = midiConverter.jsonToMidi(result);

    fs.writeFileSync('public/'+req.body.name+'.mid', createdSong, 'binary');
    res.send(req.body.name);
});

/* GET home page. */
router.post('/toMidNewConvert', function(req, res, next) {
    //console.log("data",req.data);
    console.log("body 1234:",req.body);
    if (!req.body.midAsJson || !req.body.name )
        return res.status(400).send('No files were uploaded.');
    let incoming =JSON.parse(req.body.midAsJson);
    let newFile = MidiConvert.create();
    newFile.track().patch(32);
    let lastTime = 0;
    incoming.forEach(event=>{
        let duration = 0.06000000000000005;
        lastTime = lastTime+duration;
        if(event.subtype === "noteOn"){
            newFile.tracks[0].note(event.noteNumber, lastTime,duration);
        }
    });
    fs.writeFileSync('incoming.json', JSON.stringify(incoming, null, 2));
    fs.writeFileSync('newFile.json', JSON.stringify(newFile, null, 2));
    fs.writeFileSync("public/"+req.body.name+".mid", newFile.encode(), "binary");
    res.send(req.body.name);
});

module.exports = router;
