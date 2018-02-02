# Midi Music Generation with Keras

[Python LSTM](https://github.com/haukedau/lstm "Python LSTM")

### Python

###### Requirements

    1. Python amd64
    2. Tensorflow
    3. Keras
    4. Matplotlib
    6. Numpy

### Node JS

###### Requirements

    1. NodeJS
    2. Express (npm install im aktuellen Projekt sollte reichen)

## How to Run:

NodeJS:

	0.	Installiere alle prerequirements
    1.  Fuege den Ordner mit Midi Files der Analysiert werden soll, im Webstormproject zu unter ./Music ein.
    2.	Aendere in Webstorm unter ./routes/index.js den Foldernamen so das er dem Folder entspricht
    	let folderName = "bachOneChannel";     
    3.  Starte den Server mithilfe von Webstorm oder direkt via NodeJS durch ausfuehren der ./bin/www.js

Python:

	1.  Stelle die Parameter (siehe untent) in der training.py so ein wie sie gefallen. Oder lasse Sie so wie sie sind. 
	2.  Starte training.py mit Python / Pycharm er zieht sich automatisch die Midi Files vom Webstorm.
	3.  Wenn das Training fertig ist sollte eine Plot angezeigt werden und das Model sollte unter ./ Models gespeichert werden.
	4.  Waehle das erstellte Model fuer den gewuenschten Channel in runPrediction aus und starte Training.

## Interressante NodeJS Funktionen:

#### in ./routes/index.js

##### router.post('/convertArrayToMidi', function(req, res) {[...]});
Diese Methode konvertiert ein ankommendes Array zurück zu Midi

##### let folderName = "bachOneChannel";
Kopiere den Music Ordner zu ./public music und stelle hier den Namen des Ordners vor dem Training ein.

##### router.post('/getJSOnOfMidiFolder', function(req, res) {[...]});
Diese Methode wandelt Midi zu JSON.

1. ##### function tracks(folder){}
 	Filtert alle Tracks aus allen Files in den Ordnern

2. ##### function makeLSTMInputVektorOutOfTracks(notes){}
   macht input Vektoren aus den TrackArray

3. ##### function getChannels(TrackArray){}
   Sortiert die Tracks des Midi Files nach Channels

4. ##### function getOnlyChannelsWithOverXAmount(channelArray,minAmount){
   Filtered alle Channels mit mehr als minAmount Notenevents

5. ##### function getChannelNotes(TrackArray, channel){}
   Sucht sich die Noten in den Channels



 

    