"use strict";
console.log ("Reverse Chord Finder"); 
DrawGuitar(); 
AddListenersToGuitar(); 

function ReverseChordMain(){
	//1. Read ALL the notes the fretboard 
	let arrNotes = ReadAllNotesPressed();

	//2. Clean the read notes from fretboard (remove "x" and remove duplicates, just get me the notes); 
	let arrNotesClean = []; 
	for (let i=0; i < arrNotes.length; i++){
		if (arrNotes[i].toLowerCase() !== "x"){ 
			if (arrNotesClean.indexOf(arrNotes[i]) === -1){
				arrNotesClean.push (arrNotes[i]);
			}
		}
	}	
	
	//3. Get all rotations of the notes 
	let rotations = GetArrayRotations(arrNotesClean); 

	//4. Get the formula (INTEGER) for each permutation 
	let ChordNames = []; 
	let sTriad  = ""; 
	let iSeven = 0;  
	//for (let i=0; i < 1; i++){ // por ahora solo la primera rotacion 
	console.log ("Notes in fretboard: "+ arrNotes.join() + "   Notes: " + arrNotesClean.join());
	for (let i=0; i < rotations.length; i++){ 		
		let arrFormulaINT = GetChordFormulaINT(rotations[i]);
		let arrFormulaSTR = GetChordFormulaSTR (arrFormulaINT); 
		sTriad = GetTriad (arrFormulaSTR); 
		console.log ("Rotation: " + rotations[i].join()+"   FormulaINT: "+arrFormulaINT +"   FormulaSTR: "+ arrFormulaSTR+"   Triad: "+ sTriad); 		
	}
	let element = document.getElementById("paraOutput");
	element.innerHTML =""; 	
	element.innerHTML = arrNotes.join() + "&nbsp &nbsp &nbsp &nbsp" + arrNotesClean.join() ;

}


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
		ReverseChordMain(); 
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
		ReverseChordMain(); 
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
		//console.log (iString +"  "+ iFret +"  "+ strNote); 		
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

	//rotation of arrString
	let index = arrString.indexOf(strFirstNote.toUpperCase()); 
	if (index === -1) {return "ERROR"}; 	
	let i=0; 
	for (i=0; i < index; i++){
		arrString.push (arrString.shift());
	}

	return arrString[iFret];
}

function GetChordFormulaINT(arrIN){
	//INPUT: Array <string>. Notes, with no duplicates nor ("x")
	//OUTPUT: Array of <integer> 
	if (arguments.length !==1) {console.log ("ERROR: Invalid number of arguments"); return;}
	if (Array.isArray(arrIN)) {}else{console.log ("ERROR: Invalid type");return; }
	
	let arrOUT =[]; 
	let scale= GetChromaticScale(arrIN[0]);
	
	for (let i = 0; i < arrIN.length; i++) {
		arrOUT.push (scale.indexOf(arrIN[i])); 
	}

	arrOUT.sort( function( a , b){
		if(a > b) return 1;
		if(a < b) return -1;
		return 0;
	});	
	return arrOUT; 	
}

function GetChordFormulaSTR(arrIN){
	//INPUT: Array of <integer>. 
	//OUTPUT: Array of <string> 
	if (arguments.length !==1) {console.log ("ERROR: Invalid number of arguments"); return;}
	if (Array.isArray(arrIN)) {}else{console.log ("ERROR: Invalid type");return; }
	
	let arrOUT =[]; 
	
	for (let i = 0; i < arrIN.length; i++) {
		switch (arrIN[i]){
			case 0: arrOUT.push("1"); break;  
			case 1: arrOUT.push("b2"); break;  
			case 2: arrOUT.push("2"); break;  
			case 3: arrOUT.push("b3"); break;  
			case 4: arrOUT.push("3"); break;  
			case 5: arrOUT.push("4"); break;  
			case 6: arrOUT.push("b5"); break;  
			case 7: arrOUT.push("5"); break;  
			case 8: arrOUT.push("#5"); break;  
			case 9: arrOUT.push("6"); break;  
			//case 9: arrOUT.push("bb7"); break;  
			case 10: arrOUT.push("b7"); break;  
			case 11: arrOUT.push("7"); break;  
			case 12: arrOUT.push("#7"); break;  
			case 13: arrOUT.push("b9"); break;  
			case 14: arrOUT.push("9"); break;  
			case 15: arrOUT.push("#9"); break;  
			case 16: arrOUT.push("b11"); break;  
			case 17: arrOUT.push("11"); break;  
			case 18: arrOUT.push("#11"); break; 
			case 20: arrOUT.push("b13"); break;  
			case 21: arrOUT.push("13"); break; 
			case 22: arrOUT.push("#13"); break; 
			case 23: arrOUT.push("7"); break;  
		}
	}
	return arrOUT; 	
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

function GetArrayPermutations(arrIN) {
   //returns all permutations of an array 
   //INPUT: array 
   //OUTPUT: array of arrays 
  let arrOUT = [];

  function permute(arr, memo) {
    var cur, memo = memo || [];

    for (var i = 0; i < arr.length; i++) {
      cur = arr.splice(i, 1);
      if (arr.length === 0) {
        arrOUT.push(memo.concat(cur));
      }
      permute(arr.slice(), memo.concat(cur));
      arr.splice(i, 0, cur[0]);
    }

    return arrOUT;
  }

  return permute(arrIN);
}

function GetArrayRotations (arrIN) {
   //returns all rotations of an array 
   //INPUT: array 
   //OUTPUT: array of arrays 	
	if (arguments.length !==1) {console.log ("ERROR: Invalid number of arguments"); return;}
	if (Array.isArray(arrIN)) {}else{console.log ("ERROR: Invalid type");return; }   
   
	let arrOUT=[]; 
	let arrTEMP=[]; 
	arrTEMP = arrIN.slice(); 
	arrOUT.push (arrTEMP); 
	
	for (let i= 1; i < arrIN.length; i++){
		arrTEMP = arrTEMP.slice(); //new array
		arrTEMP.push (arrTEMP.shift());	//real rotation 
		arrOUT.push (arrTEMP); 
	}
	
	return (arrOUT); 		
}

function GetTriad(arrIN){
	//INPUT: arrIN with degrees (NOT integers) 
	//OUTPUT: string with triad name; returns "" if not valid triad 
	let sTriad = "esta es el triad";

	return sTriad; 
}

function GetSeven(arrIN){
	//INPUT: arrIN with degrees (NOT integers) 
	//OUPUT: integer: 0, 7, 9, 11, 13 
	let iiSeven = 0; 
	let i=0; 

	let s1 = arrIN[0];
	let s2 = arrIN[1]; 
	let s3 = arrIN[2]; 
	let s4 = arrIN[3]; 
	let s5 = arrIN[4]; 
	let s6 = arrIN[5]; 
	let s7 = arrIN[6]; 
	let s9 = arrIN[7]; 
	let s11 = arrIN[8]; 
	let s13 = arrIN[9]; 	

	//bb7 only valid for Dim 
	if (s7 === "bb7") {
		if (s3 === "b3"  && s5 === "b5" ) {
			//do nothing 
		}
		else {
			isOk = false;
			return isOk; 	
		}
	}

	if (s7 === "b7" || s7 === "7" || s7 === "bb7") { 
		iiSeven = 7; 
		if (s9 === "9" && s11 === "11" && s13 === "13") {iiSeven = 13;}
		if (s9 === "9" && s11 === "11" && s13 !== "13") {iiSeven = 11;}
		if (s9 === "9" && s11 !== "11")   {iiSeven = 9;}	
	}
	return iiSeven; 
}