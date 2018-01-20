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
    newFile.track().patch(62);
    let lastTime = 0.0;
    let deltaTime = 0.5;
    incoming.forEach(event=>{
        console.log("lastTime",lastTime);
        console.log("Subtype",event.subtype);
        if(event.subtype === "noteOn"){
            newFile.tracks[0].note(event.noteNumber,lastTime,deltaTime);
            //Take it out later if also 0 lines should be created
            lastTime = lastTime+deltaTime;
        }

    });
    fs.writeFileSync('incoming.json', JSON.stringify(incoming, null, 2));
    fs.writeFileSync('newFile.json', JSON.stringify(newFile, null, 2));
    fs.writeFileSync("public/"+req.body.name+".mid", newFile.encode(), "binary");
    res.send(req.body.name);
});

router.post('/withDurationToMidi', function(req, res, next) {
    let resolution = 0.01;
    let allTracks = [];
    fs.readFile("music/hitlights.mid", "binary", function (err, midiBlob) {
        if (!err) {
            let midi = MidiConvert.parse(midiBlob);
            //console.log(midi);
            let resultArray = [];
            let emptyNotes = new Array(127).fill(0);
            let trackNo = 0;
            midi.tracks.forEach(track => {
                let time = 0;
                let maxI = track.notes.length;
                let trackContent = [];
                let amount = 0;
                if (maxI > 0) {
                    let trackMaxTime = track.notes[maxI - 1].time + track.notes[maxI - 1].duration;
                    let stepsAmount = trackMaxTime / resolution;
                    for (let i = 0; i < stepsAmount; i++) {
                        trackContent.push(JSON.parse(JSON.stringify(emptyNotes)));
                    }
                   track.notes.forEach(note => {
                        let startPoint = note.time / 0.01;
                        let startNo = Math.floor(startPoint);
                        console.log("startNo",startNo);
                        let endNo = Math.floor(startPoint + note.duration / 0.01);
                        console.log("endNo",endNo);
                        for (let i = startNo; i < endNo; i++) {
                            trackContent[i][note.midi] = 1;
                            console.log(i);
                        }
                    });
                    allTracks.push(trackContent);
                    //console.log("stepsAmounts:",Math.ceil(stepsAmount));
                }
                //console.log("amount", amount)
                trackNo++;
            });
            res.send(JSON.stringify(allTracks));
        }
    });
});
router.post('/DurationHotEncoded', function(req, res, next) {
    let resolution = 0.01;
    let allTracks = [];
    let allDurations = [];
    fs.readFile("music/hitlights.mid", "binary", function (err, midiBlob) {
        if (!err) {

            let midi = MidiConvert.parse(midiBlob);
            fs.writeFileSync('midiNew.json', JSON.stringify(midi, null, 2));
            let emptyNotes = new Array(127).fill(0);
            let trackNo = 0;

            midi.tracks.forEach(track => {
                let trackNotes = [];
                let durationArray = [];
                track.notes.forEach(note =>{
                    let notesArray = JSON.parse(JSON.stringify(emptyNotes));
                    notesArray[note.midi] = 1;
                    let durationIndex = 0;
                    let newDuration = true;
                    let actualDuration = note.duration.toFixed(3);
                    for(let i = 0; i < durationArray.length; i++){
                        if(durationArray[i].time === actualDuration) {
                            durationArray[i].amount++;
                            newDuration = false;
                            durationIndex = i;
                        }
                    }
                    if(newDuration){
                        let newElement = {
                            time: actualDuration,
                            amount: 1
                        };
                        durationIndex = durationArray.length;
                        durationArray.push(newElement);
                    }
                    let newElement = {
                        notes: notesArray,
                        duration: durationIndex
                    };
                    trackNotes.push(newElement);
                });
                console.log(durationArray);
                allDurations.push(durationArray);
                allTracks.push(trackNotes);
            });

            fs.writeFileSync('printDurationArrays.json', JSON.stringify(allTracks, null, 2));
            res.send(JSON.stringify({track: allTracks[1], durations:allDurations[1]}));
        }
    })
});
router.post('/DurationAsFloat', function(req, res, next) {
    let allTracks = [];
    fs.readFile("music/midi.mid", "binary", function (err, midiBlob) {
        if (!err) {
            let midi = MidiConvert.parse(midiBlob);
            fs.writeFileSync('midiNew.json', JSON.stringify(midi, null, 2));
            let emptyNotes = new Array(128).fill(0);
            let trackNo = 0;
            midi.tracks.forEach(track => {
                let trackNotes = [];
                track.notes.forEach(note =>{
                    let notesArray = JSON.parse(JSON.stringify(emptyNotes));
                    notesArray[note.midi] = 1;
                    let actualDuration = note.duration.toFixed(3);
                    notesArray.push(actualDuration);
                    console.log(notesArray);
                    trackNotes.push(notesArray);
                });
                allTracks.push(trackNotes);
            });
            fs.writeFileSync('tracksResult.json', JSON.stringify(allTracks, null, 2));
            res.send(JSON.stringify(allTracks[1]));
        }
    })
});
module.exports = router;
