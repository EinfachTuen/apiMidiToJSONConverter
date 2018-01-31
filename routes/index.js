var express = require('express');
var fs = require('fs');
var midiConverter = require('midi-converter');
var router = express.Router();
var fileUpload = require('express-fileupload');
let MidiConvert = require('midiconvert');


router.use(fileUpload());
/**
 * @http_request_param_(req.body.midAsJson): This is a 2D notes to timestep Array which will be converted to midi
 * @http_request_param_(req.body.name): This is the name of the midi file that get generated
 * @http_request_channel_(req.body.channel): TheNumber of the models channel
 * convert incoming array
 */
router.post('/convertArrayToJSON', function(req, res) {
    if (!req.body.midAsJson || !req.body.name || !req.body.channel)
        return res.status(400).send('No files were uploaded.');
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    console.log("req.body.midAsJson",req.body.midAsJson);
    let incEventArray = JSON.parse(req.body.midAsJson);
    let lastTime = 0;
    // add a track
    channel = req.body.channel;
    var newFile = MidiConvert.create();
    newFile.track().patch(channel);
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
                newEvent.duration = parseFloat(resultVekor[128].toFixed(3));
                console.log(resultVekor[129].toFixed(3));
                console.log(resultVekor[128].toFixed(3));
                let deltaTime = parseFloat(resultVekor[129].toFixed(3));
                newEvent.time = deltaTime+lastTime;
                lastTime = newEvent.time;
                newEvent.time = Math.round(newEvent.time*1000)/1000;
                newFile.tracks[0].note(newEvent.midi, newEvent.time, newEvent.duration);
            }
        }
    });
    fs.writeFileSync("self.json", JSON.stringify(newFile,null,2));
    fs.writeFileSync("public/"+req.body.name+".mid", newFile.encode(), "binary");
    res.send(req.body.name);
});
router.post('/CombinedDurationAsFloat', function(req, res, next) {
    let folderName = "bachOneChannel";
    try{
        let TrackArray = tracks('./music/'+folderName);
        let channelArray = getChannels(TrackArray);
        channelArray = getOnlyChannelsWithOverXAmount(channelArray,0);
        //console.log("TrackArray",TrackArray);
        let noteResult =[];
        channelArray.forEach(channel =>{
            let JSONNotes = getChannelNotes(TrackArray,channel.name);
            let noteElement = {
                notes: makeLSTMInputVektorOutOfTracks(JSONNotes),
                channel: channel.name
            };
            noteResult.push(noteElement);
        });
        console.log(noteResult);

        //console.log(trackNotes);
        //fs.writeFileSync('trackNotes.json', JSON.stringify(noteResult, null, 2));
        res.send(JSON.stringify({folder:folderName, notes:noteResult}));
   }catch(error){
        console.log(error);
   }
});

function getOnlyChannelsWithOverXAmount(channelArray,minAmount){
    let outputChannelArray = [];
    channelArray.forEach(channel =>{
        if(channel.name > -1 && channel.amount > 0){
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
    let lastTime = 0;
    let emptyNotes = new Array(128).fill(0);
    notes.forEach(note =>{
        let notesArray = JSON.parse(JSON.stringify(emptyNotes));
        notesArray[note.midi] = 1;
        let actualDuration = note.duration.toFixed(3);
        notesArray.push(actualDuration);
        let actualTime = note.time.toFixed(3);
        let deltaTime = actualTime-lastTime;
        lastTime = actualTime;
        if(deltaTime < 10 && deltaTime > -10){
        notesArray.push(deltaTime);
        // console.log(notesArray);
        trackNotes.push(notesArray)
        }
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



function LSTMInputVektor(tracksWithNotes){
    let allNotes = [];
    let time = 0;
    let lastTime = 0;
    let emptyNotes = new Array(128).fill(0);
    tracksWithNotes.forEach(track =>{
        time = time + lastTime;
        track.notes.forEach(note =>{
            let notesArray = JSON.parse(JSON.stringify(emptyNotes));
            notesArray[note.midi] = 1;
            let roundDuration = note.duration.toFixed(3);
            let roundPlayTime = Math.round(note.time * 100) / 100;
            notesArray.push(roundDuration);
            let noteTime = time+roundPlayTime;
            notesArray.push(noteTime);
            notesArray.push(note.instrument);
            lastTime = note.time;
            allNotes.push(notesArray);
        });
    });
    return allNotes;
}
function allTracksWithEvents(folder){
    const testFolder = folder;
    let result = fs.readdirSync(testFolder);
    let TrackArray = [];
    result.forEach(fileName => {
        let midiSong = fs.readFileSync(testFolder+'/'+fileName, 'binary');
        let jsonSong = MidiConvert.parse(midiSong);
        jsonSong.tracks.forEach(track => {
            let track_Element = {
                notes: []
            };
            let instrument = track.instrumentNumber;
            if(track.notes.length > 0){
                track.notes.forEach(noteEvent =>{
                    noteEvent.instrument = instrument;
                    track_Element.notes.push(noteEvent)
                });
            }
            TrackArray.push(track_Element);
        });
    });
    return TrackArray;
}
router.post('/withAnyThingToInputArray', function(req, res, next) {
    let folderName = "bachOneChannel";
    try{
        let TrackArray = allTracksWithEvents('./music/'+folderName);
        fs.writeFileSync("TrackArray.json", JSON.stringify(TrackArray,null,2));
        // console.log(LSTMInputVektor(TrackArray)[150000].length);
        // console.log(LSTMInputVektor(TrackArray)[150000][128]);
        // console.log(LSTMInputVektor(TrackArray)[150000][129]);
        // console.log(LSTMInputVektor(TrackArray)[150000][130]);
        let noteResult =LSTMInputVektor(TrackArray);
        fs.writeFileSync("noteResult.json", JSON.stringify(noteResult,null,2));
        res.send(JSON.stringify({folder:folderName, notes:noteResult}));
    }catch(error){
        console.log(error);
    }
});


module.exports = router;
