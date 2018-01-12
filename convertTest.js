let fs = require('fs')
let MidiConvert = require('midiconvert');

fs.readFile("music/midi.mid", "binary", function(err, midiBlob) {
    if (!err) {
        var midi = MidiConvert.parse(midiBlob);
        console.log(midi);
        fs.writeFileSync("output.mid", midi.encode(), "binary");
        fs.writeFileSync("output.json", JSON.stringify(midi,null,2));
        var newFile = MidiConvert.create();
    // add a track
        newFile.track().patch(32);
        newFile.tracks[0].note(60, 0, 0.06000000000000005);
        newFile.tracks[0].note(60, 2, 0.06000000000000005);

// write the output
       // fs.writeFileSync("output.mid", midi.encode(), "binary")
        fs.writeFileSync("self.json", JSON.stringify(newFile,null,2));


        fs.readFile("output.mid", "binary", function(err, midiBlob) {
            if (!err) {
                var midi = MidiConvert.parse(midiBlob);
                console.log(midi);
                fs.writeFileSync("output2.mid", midi.encode(), "binary");
            }
            else{output
                console.log(err);
            }
        });


    }
    else{
        console.log(err);
    }
});



