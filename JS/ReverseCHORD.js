"use strict";
console.log ("Reverse Chord Finder"); 
DrawGuitar(); 
AddListenersToGuitar(); 

function DrawGuitar() {
    //read screen size
    let w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    let h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    let unitW = 0.014 * w;
    let unitH = unitW * 1.618;
    if (unitW < 19.124 || unitH < 30.942632) { //keep a bigger size for smaller screens
        unitW = 19.124;
        unitH = 30.942632;
    }

    //create SVG
    let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", unitW * 8);
    svg.setAttribute("height", unitH * 26);
    svg.setAttribute("version", "1.1");
    let SVGId = "SVG" + "ReverseChordFinderGeneric";
    svg.setAttribute("id", SVGId);
    svg.setAttribute("class", "SVGGuitar");
	
    //draw grid
    for (let i = 0; i < 8; i++) { //strings
        let aString = document.createElementNS("http://www.w3.org/2000/svg", "line");
        aString.setAttribute("x1", unitW * i);
        aString.setAttribute("y1", 0);
        aString.setAttribute("x2", unitW * i);
        aString.setAttribute("y2", unitH * 26);
        aString.setAttribute("class", "gridline");
        svg.appendChild(aString);
    }
    for (let i = 0; i < 26; i++) { //frets 
        let aFret = document.createElementNS("http://www.w3.org/2000/svg", "line");
        aFret.setAttribute("x1", 0);
        aFret.setAttribute("y1", unitH * i);
        aFret.setAttribute("x2", unitW * 26);
        aFret.setAttribute("y2", unitH * i);
        aFret.setAttribute("class", "gridline");
        svg.appendChild(aFret);
    }
    //draw strings and frets
    for (let i = 0; i < 6; i++) { //strings
        let aString = document.createElementNS("http://www.w3.org/2000/svg", "line");
        aString.setAttribute("x1", unitW * 2 + unitW * i);
        aString.setAttribute("y1", unitH);
        aString.setAttribute("x2", unitW * 2 + unitW * i);
        aString.setAttribute("y2", unitH * 26);
        aString.setAttribute("class", "stringAndFret");
        svg.appendChild(aString);
    }
    for (let i = 0; i < 26; i++) { //frets 
        let aFret = document.createElementNS("http://www.w3.org/2000/svg", "line");
        aFret.setAttribute("x1", unitW * 2 + 0);
        aFret.setAttribute("y1", unitH * i + unitH);
        aFret.setAttribute("x2", unitW * 2 + unitW * 5);
        aFret.setAttribute("y2", unitH * i + unitH);
        aFret.setAttribute("class", "stringAndFret");
        svg.appendChild(aFret);
    }	

    //write the fret number 
    let xDot = unitW / 3;
    for (let i = 0; i < 26; i++) {
        let yDot = unitH * i + unitH / 4 * 3;
		let aText = document.createElementNS("http://www.w3.org/2000/svg", "text");
		aText.setAttribute("x", xDot);
		aText.setAttribute("y", yDot);
		aText.setAttribute("font-size", unitH / 3);
		aText.setAttribute("class", "fretNumberText");
		aText.textContent = i;
		svg.appendChild(aText);

    }
	
	 //draw the dots 
    for (let i = 0; i < 26; i++) { //fret
        for (let j = 1; j < 7; j++) { //string
            let aCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            let xDot = unitW * 2 + unitW * (j - 1);
            let yDot = unitH * 0.5 + unitH * i;
            aCircle.setAttribute("class", "dotUnpressed");
            aCircle.setAttribute("cx", xDot);
            aCircle.setAttribute("cy", yDot);
            aCircle.setAttribute("r", unitH / 4);
            aCircle.setAttribute("Fret", i);
            let iString;
            switch (j) {
				
                case 1: iString = 6; break;
                case 2: iString = 5; break;
                case 3: iString = 4; break;
                case 4: iString = 3; break;
                case 5: iString = 2; break;
                case 6: iString = 1; break;
            }
            aCircle.setAttribute("String", iString);
            aCircle.setAttribute("Pressed", "No");			
            svg.appendChild(aCircle);
        }
    }
	
    //add the SVG to the tab container 
	if (document.getElementById("sectionGuitarTab")){
		document.getElementById("sectionGuitarTab").appendChild(svg);
	}
}

//add event handlers to click on notes 
function AddListenersToGuitar(){
	let dots = document.getElementsByClassName("dotUnpressed" || "dotPressed");
	for (let i = 0; i < dots.length; i++) {
		dots[i].addEventListener("click", funcClickNote, false);
		dots[i].addEventListener("dblclick", funcDblClickNote, false);
		dots[i].addEventListener("contextmenu", funcRightClickNote, false);
	}
}

function funcClickNote(eventObj){
	if (eventObj.target.getAttribute("Pressed")==="Yes"){
		//console.log ("SAQUE el dedo"); 
		eventObj.target.setAttribute("Pressed", "No");
		eventObj.target.setAttribute("class", "dotUnpressed");

		let arrNotes = ReadAllNotesPressed();
		GetTheChord(arrNotes);
		return; 
	}
	if (eventObj.target.getAttribute("Pressed")==="No"){
		//console.log ("PUSE el dedo"); 
		eventObj.target.setAttribute("Pressed", "Yes");
		eventObj.target.setAttribute("class", "dotPressed");
		
		//unpress all the dots in the same string 
        let dots = document.getElementsByClassName("dotPressed");
        let iString = eventObj.target.getAttribute("String");
        let iFret = eventObj.target.getAttribute("Fret");
		
        for (let i = 0; i < dots.length; i++) {
            if (dots[i].getAttribute("String") === iString) {
                if (dots[i].getAttribute("Fret") !== iFret) {
                    dots[i].setAttribute("class", "dotUnpressed");
                }
            }
        }		
				
		let arrNotes = ReadAllNotesPressed();
		GetTheChord(arrNotes);
		return; 
	}
	//console.log ("Click! " +" String: " + eventObj.target.getAttribute("String") + " Fret: " +eventObj.target.getAttribute("Fret") + " Pressed: " + eventObj.target.getAttribute("Pressed"));		
}

function funcDblClickNote(eventObj){
	console.log ("DOUBLE Click! " +" String: " +eventObj.target.getAttribute("String") + " Fret: " +eventObj.target.getAttribute("Fret"));	
	if (eventObj.target.getAttribute("Pressed")==="Yes"){
		console.log ("DOBLECLICK el dedo"); 
		eventObj.target.setAttribute("Pressed", "No");
		eventObj.target.setAttribute("class", "dotUnpressed");
		return; 
	}	
	if (eventObj.target.getAttribute("Pressed")==="No"){
		eventObj.target.setAttribute("class", "dotUnpressed");
		return; 
	}
}

function funcRightClickNote(eventObj){
	eventObj.preventDefault();
	console.log ("RIGHT Click! " +" String: " +eventObj.target.getAttribute("String") + " Fret: " +eventObj.target.getAttribute("Fret"));		
}

function ReadAllNotesPressed(){
	//find all notes that are pressed
	//INPUT: None 
	//OUTPUT: Array of 6 <string> elements. Notes being pressed in the fretboard for each string. Example: ["x","C","E","G","C","x"]

	let dots = document.getElementsByClassName("dotPressed");
	let strTuning = document.getElementById("selTuning").value; 
	
	let iString = 0; 
	let iFret = 0; 
	let strNote = ""; 
	let arrNotes = ["x","x","x","x","x","x"]; 
		
	for (let i = 0; i < dots.length; i++) {
		iString = parseInt(dots[i].getAttribute("String")); 
		iFret = parseInt(dots[i].getAttribute("Fret")); 
		strNote = GetNoteForFret (iString, iFret, strTuning); 
		if (strNote === "ERROR") {	return; }
		console.log (iString +"  "+ iFret +"  "+ strNote); 		
		switch (iString){
			case 6: arrNotes[0] = strNote; break; 
			case 5: arrNotes[1] = strNote; break; 
			case 4: arrNotes[2] = strNote; break; 
			case 3: arrNotes[3] = strNote; break; 
			case 2: arrNotes[4] = strNote; break; 
			case 1: arrNotes[5] = strNote; break; 
		}
	}	
	return (arrNotes); 
}

function GetNoteForFret(iString, iFret, strTuning) {
    //INPUT:  a guitar string number (1 to 6), fret number and tuning
	//OUTPUT: (string) note in that string/fret
	//strTuning format: "E-A-D-g-b-e" 

	//argument validation
	if (arguments.length < 3) {return "ERROR"}; 
	if (typeof(iString) !== "number") {return "ERROR"}; 
	if (typeof(iFret) !== "number") {return "ERROR"}; 
	if (iString < 0 || iString > 6) {return "ERROR"};
	if (iFret < 0) {return "ERROR"};
	const arrTuning = strTuning.split ("-"); 
	if (arrTuning.length < 6) {return "ERROR"}
	
	//reference, we build the string from here 
    let arrString = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];
	
	//build the string 
    let strFirstNote = ""; 
	switch (iString) {
        case 1:	strFirstNote = arrTuning[5]; break;
        case 2: strFirstNote = arrTuning[4]; break;
        case 3: strFirstNote = arrTuning[3]; break;
        case 4: strFirstNote = arrTuning[2]; break;
        case 5: strFirstNote = arrTuning[1]; break;
        case 6: strFirstNote = arrTuning[0]; break;
    }	
	let index = arrString.indexOf(strFirstNote.toUpperCase()); 
	if (index === -1) {return "ERROR"}; 	
	let i=0; 
	for (i=0; i < index; i++){
		arrString.push (arrString.shift());
	}

	return arrString[iFret];
}

function GetTheChord (arrIN){
	
	if (arguments.length !==1) {console.log ("ERROR: Invalid number of arguments"); return;}
	if (Array.isArray(arrIN)) {}else{console.log ("ERROR: Invalid type");return; }
	if (arrIN.length !== 6) {console.log ("ERROR: Need 6 elements, one for each string"); return; }
	
	let element = document.getElementById("paraOutput");
	element.innerHTML =""; 	
	element.innerHTML = arrIN.join();	
}

function GetChromaticScale(strNote) {
	//INPUT: <string>. A note. 
	//OUTPUT: <Array> of <string> 
	
	if (arguments.length !==1) {console.log ("ERROR: Invalid number of arguments"); return;}
	if (typeof(strNote)=== "string") {} else{console.log ("ERROR: Invalid type");return; }

	//reference, we build the string from here 
    let arrScale = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];
	let i=0; 	

	let index = arrScale.indexOf(strNote.toUpperCase());
	if (index === -1) {
		let arrScale = []; 
		return arrScale; 
	}
	for (i=0; i < index; i++){
		arrScale.push (arrScale.shift());
	}
	return arrScale;		
}