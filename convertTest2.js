let fs = require('fs')
let MidiConvert = require('midiconvert');


/*
function euclideanAlgorithm(a, b) {
    if(b === 0) {
        return a;
    }
    const remainder = a % b;
    return euclideanAlgorithm(b, remainder)
}
function gcdMultipleNumbers(...args) { //ES6 used here, change as appropriate
    const gcd = args.reduce((memo, next) => {
        return euclideanAlgorithm(memo, next)}
    );

    return gcd;
}*/

//gcdMultipleNumbers(100,10,4,2961002);//8
//TODO: Shit I forget to see the length of the note and calculation until time + duration
/*
fs.readFile("music/hitlights.mid", "binary", function(err, midiBlob) {
    if (!err) {
        var midi = MidiConvert.parse(midiBlob);
        //console.log(midi);
        let resultArray = [];
        let emptyNotes = new Array(127).fill(0);
        let trackNo = 0;
        midi.tracks.forEach(track =>{
            let time = 0;
            let maxI = track.notes.length;
            if(maxI> 0){
            let trackMaxTime = track.notes[maxI-1].time;
            while(trackMaxTime >= time){
                let newNotes = JSON.parse(JSON.stringify(emptyNotes));
                console.log("track.notes[0].time",track.notes[0].time)
                console.log("bef.time",time);
                console.log("trackMaxTime",trackMaxTime);
                while(time >= track.notes[0].time){
                    track.notes.shift();
                    newNotes[track.notes[0].midi] = 1;
                    resultArray.push(newNotes);
                    console.log("lastruntime",time);
                }
                time = time+0.01;
            }
        }
        track.notes.forEach(note =>{
                let newNotes = JSON.parse(JSON.stringify(emptyNotes));
                track.notes.shift();
                newNotes[track.notes[0].midi] = 1;
                resultArray.push(newNotes);
                console.log("added last notes");
        });
       // console.log("trackNo",trackNo)
        trackNo++;
        })
    }
});
*/
