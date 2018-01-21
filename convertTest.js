let fs = require('fs')
let MidiConvert = require('midiconvert');
/*
 var newFile = MidiConvert.create();
//   add a track
 newFile.track().patch(32);
 newFile.tracks[0].note(60, 0, 0.06);
 newFile.tracks[0].note(60, 0.06, 0.06);

// write the output
 fs.writeFileSync("output.mid", newFile.encode(), "binary")
 fs.writeFileSync("self.json", JSON.stringify(newFile,null,2));
*/
/*
 fs.readFile("music/bachOneChannel/output3.mid", "binary", function(err, midiBlob) {
     if (!err) {
         var midi = MidiConvert.parse(midiBlob);
         //console.log(midi);
         fs.writeFileSync("output2.mid", midi.encode(), "binary");
     }
     else{
         console.log(err);
     }
 });*/

console.log(tracks('./music/bachOneChannel',73));

function tracks(folder, channel){
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
    return getChannelNotes(TrackArray,channel);
}
function getChannelNotes(TrackArray, channel){
    let noteArray = [];
    TrackArray.forEach(track => {
        if(track.channel === channel){
            track.notes.forEach(note =>{
                console.log(note);
                noteArray.push(note);
            });
        }
    });
    return noteArray
}

