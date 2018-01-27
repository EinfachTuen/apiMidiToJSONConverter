var express = require('express');
var fs = require('fs');
var midiConverter = require('midi-converter');
var router = express.Router();
var fileUpload = require('express-fileupload');
let MidiConvert = require('midiconvert');

router.use(fileUpload());
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
});;
router.post('/convertArrayToJSON', function(req, res) {
    //console.log("data",req.data);
    //console.log("body 1234:",req.body);
   // console.log("req.body",req.body);

    if (!req.body.midAsJson || !req.body.name )
        return res.status(400).send('No files were uploaded.');
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    console.log("req.body.midAsJson",req.body.midAsJson);
    let incEventArray = JSON.parse(req.body.midAsJson);
    let actualTime = 0;
    // add a track
    var newFile = MidiConvert.create();
    newFile.track().patch(34);
    incEventArray.forEach(resultVekor =>{
        let newEvent = {
            "name": "oem",
            "midi": 0,
            "time": 0,
            "velocity": 0,
            "duration": 0
        };
        for(let i = 0; i <resultVekor.length-1; i++){
            if(resultVekor[i] > 0.5){
                newEvent.midi = i;
                newEvent.duration = parseFloat(resultVekor[128].toFixed(2));
                newEvent.time = parseFloat(actualTime.toFixed(2));
                newFile.tracks[0].note(newEvent.midi, newEvent.time, newEvent.duration);
                actualTime += newEvent.duration;
            }
        }
        if(newEvent.midi === 0){
            actualTime += parseFloat(resultVekor[128].toFixed(2));
        }
    });
    fs.writeFileSync("./log/self.json", JSON.stringify(newFile,null,2));
    fs.writeFileSync("public/"+req.body.name+".mid", newFile.encode(), "binary");
    res.send(req.body.name);
});
router.post('/CombinedDurationAsFloat', function(req, res, next) {
    let folderName = "bachOneChannel";
    try{
        let TrackArray = tracks('./music/'+folderName);
        let channelArray = getChannels(TrackArray);
        channelArray = getOnlyChannelsWithOverXAmount(channelArray,10);
        console.log("channelArray",channelArray);
        let noteResult =[];
       // console.log(TrackArray);
        channelArray.forEach(channel =>{
            let JSONNotes = getChannelNotes(TrackArray,channel.name);
            let noteElement = {
                notes: makeLSTMInputVektorOutOfTracks(JSONNotes),
                channel: channel.name
            };
            noteResult.push(noteElement);
        });


        //console.log(trackNotes);
        //fs.writeFileSync('trackNotes.json', JSON.stringify(noteResult, null, 2));
        res.send(JSON.stringify({folder:folderName, notes:noteResult}));
   }catch(error){
        console.log(error);
   }
});
function getOnlyChannelsWithOverXAmount(channelArray,minAmount){
    let outputChannelArray = []
    channelArray.forEach(channel =>{
        if(channel.name > -1 && channel.amount > 1){
            outputChannelArray.push(channel);
        }
    });
    return outputChannelArray;
}
function getChannels(TrackArray){
    let channelArray = [];
    TrackArray.forEach(track => {
        let channelFound= false;
        channelArray.forEach(channel =>{
            if(track.channel === channel.name){
                channel.amount++;
                channelFound = true;
            }
        });
        if(!channelFound){
            channelArray.push({
                name: track.channel,
                amount: 1,
            })
        }
    });
    return channelArray;
}
function makeLSTMInputVektorOutOfTracks(notes){
    let trackNotes = [];
    let time = 0;
    let emptyNotes = new Array(128).fill(0);
    notes.forEach(note =>{
        let notesArray = JSON.parse(JSON.stringify(emptyNotes));
        notesArray[note.midi] = 1;
        let actualDuration = note.duration.toFixed(3);
        if(time < (note.time+0.004)){
            let zeroNotesArray = JSON.parse(JSON.stringify(emptyNotes));
            let zeroDuration = note.time - time;
            zeroNotesArray.push(zeroDuration);
            console.log("pushed Zero", zeroDuration);
            trackNotes.push(notesArray);
        }
        time += actualDuration;
        notesArray.push(actualDuration);
        // console.log(notesArray);
        trackNotes.push(notesArray);
    });
    return trackNotes;
}
function tracks(folder){
    const testFolder = folder;
    let result = fs.readdirSync(testFolder);
    let TrackArray = [];
    result.forEach(fileName => {
        let midiSong = fs.readFileSync(testFolder+'/'+fileName, 'binary');
        let jsonSong = MidiConvert.parse(midiSong);
        jsonSong.tracks.forEach(track => {
            if(track.notes.length > 0){
                let track_Element = {
                    channel: track.instrumentNumber,
                    notes: track.notes
                };
                TrackArray.push(track_Element);
            }
        });
    });
    return TrackArray;
}
function getChannelNotes(TrackArray, channel){
    let noteArray = [];
    TrackArray.forEach(track => {
        if(track.channel === channel){
            track.notes.forEach(note =>{
               // console.log(note);
                noteArray.push(note);
            });
        }
    });
    return noteArray
}

module.exports = router;
