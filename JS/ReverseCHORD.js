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

	//4.For each rotation: get the formulas (INTEGER and Degrees) for each permutation, triad and iSeven
	let ChordNames = []; 
	let sName = ""; 
	let sTriad  = ""; 
	let iSeven = 0;  
	//for (let i=0; i < 1; i++){ // por ahora solo la primera rotacion 
	console.log ("Notes in fretboard: "+ arrNotes.join() + "   Notes: " + arrNotesClean.join());
	for (let i=0; i < rotations.length; i++){ 		
		let arrFormulaINT = GetChordFormulaINT(rotations[i]);
		let arrFormulaSTR = GetChordFormulaSTR (arrFormulaINT); 
		sTriad = GetTriad (arrFormulaSTR); 
		iSeven = GetSeven (arrFormulaSTR); 
		sName = BuildChordName (arrFormulaSTR);
		console.log ("Rotation: " + rotations[i].join()+"   FormulaINT: "+arrFormulaINT +"   FormulaSTR: "+ arrFormulaSTR+"   Triad: "+ sTriad +"  iSeven: "+iSeven); 		
		console.log ("Rotation: " + rotations[i].join()+"   FormulaINT: "+arrFormulaINT +"   FormulaSTR: "+ arrFormulaSTR+"   Name: "+ sName ); 		
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
	
	//remember that 9, 11 and 13 can also be thought of as 2, 4 and 6. 
	if ((arrIN.indexOf(3) > -1) || (arrIN.indexOf(4)) > -1) {		//si hay "3" o "b3" no puede haber "2", "b2", "4", son 9 u 11 (OJO que los index son los Integers)
		if (arrIN.indexOf(1) > -1)  {arrIN[arrIN.indexOf(1)]+=12; }	//"b2"
		if (arrIN.indexOf(2) > -1)  {arrIN[arrIN.indexOf(2)]+=12; }  //"2"
		if (arrIN.indexOf(5) > -1)  {arrIN[arrIN.indexOf(5)]+=12; }  //"4"
	}
	arrIN.sort( function( a , b){
		if(a > b) return 1;
		if(a < b) return -1;
		return 0;
	});		
	
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
	//INPUT: arrIN with degrees (NOT integers). Example: ["1","b3","5","b7"]; 
	//OUTPUT: string with triad name; returns "" if not valid triad 
	if (arguments.length !==1) {console.log ("ERROR: Invalid number of arguments"); return;}
	if (Array.isArray(arrIN)) {}else{console.log ("ERROR: Invalid type");return; }   	

	let sTriad = "";
	if (arrIN[0]==="1"){
		switch (arrIN[1]){
			case "2": 
				switch (arrIN[2]){
					case "5": sTriad="sus2"; break;
					default: break; 				
				}		
				break; 
			case "b2":
				switch (arrIN[2]){
					case ("5") : sTriad="susb2"; break;
					case ("b5"): sTriad="susb2b5"; break;					
					default: break;			
				}
				break; 
			case "3": 
				switch (arrIN[2]){
					case "5": sTriad="Maj"; break;
					case "b5": sTriad="Maj b5"; break;
					case "#5": sTriad="Aug"; break; 
					default: break; 
				}
				break; 
			case "b3": 
				switch (arrIN[2]){
					case ("5") : sTriad="min"; break;
					case ("b5"): sTriad="dim"; break;			
					default: break; 
				}
				break; 
			case "4": {
				switch (arrIN[2]){
					case ("5") : sTriad="sus4"; break;
					case ("b5"): sTriad="sus4b5"; break;			
					default: break; 
				}
				break; 
			} 
			default: break; 
		}
	}
	return sTriad; 
}

function GetSeven(arrIN){
	//INPUT: arrIN with degrees (NOT integers). Example: ["1","b3","5","b7"]; 
	//OUPUT: integer: 0 || 7 || 9 || 11 || 13 
	
	if (arguments.length !==1) {console.log ("ERROR: Invalid number of arguments"); return;}
	if (Array.isArray(arrIN)) {}else{console.log ("ERROR: Invalid type");return; }   		
	
	let iSeven = 0; 
	let s3 = ""; 
	let s5 = ""; 
	let s7 = ""; 
	let s9 = ""; 
	let s11 = ""; 
	let s13 = ""; 	

	if (arrIN.indexOf("b3") > -1){s3 = "b3"; }
	if (arrIN.indexOf("b5") > -1){s5 = "b5"; }
	if (arrIN.indexOf("b7") > -1){s7 = "b7"; }
	if (arrIN.indexOf("7")  > -1) {s7 = "7"; }
	if (arrIN.indexOf("bb7")> -1){s7 = "bb7";}
	if (arrIN.indexOf("9")  > -1){s9 = "9";  }
	if (arrIN.indexOf("11") > -1){s11 = "11";}
	if (arrIN.indexOf("13") > -1){s13 = "13";}
	
	if (s7 === "b7" || s7 === "7" || s7 === "bb7") { 
		iSeven = 7; 
		if (s9 === "9" && s11 === "11" && s13 === "13") {iSeven = 13;}
		if (s9 === "9" && s11 === "11" && s13 !== "13") {iSeven = 11;}
		if (s9 === "9" && s11 !== "11")   {iSeven = 9;}	
	}
	
	//bb7 only valid for Dim 
	if (s7 === "bb7") {
		//if (s3 === "b3"  && s5 === "b5" ) {//do nothing } else {//do something }
	}

	return iSeven; 
}

function BuildChordName (arrIN) {  //consolida GetTriad y GetSeven
	//INPUT: arrIN with degrees (NOT integers). Example: ["1","b3","5","b7"]; 
	//OUTPUT: string with chord name; returns "" if not valid triad or < not diad 
	//https://music.stackexchange.com/questions/11659/what-determines-a-chords-name	
	//https://music.stackexchange.com/questions/42999/how-do-you-figure-out-a-chords-name
	//http://www.smithfowler.org/music/Chord_Formulas.htm
	//https://music.stackexchange.com/questions/91623/whats-an-add-chord 
	
	if (arguments.length !==1) {console.log ("ERROR: Invalid number of arguments"); return;}
	if (Array.isArray(arrIN)) {}else{console.log ("ERROR: Invalid type");return; }   	
	
	let s1 = ""; 	
	let s2 = ""; 	
	let s3 = ""; 
	let s4 = ""; 
	let s5 = ""; 
	let s6 = "";
	let s7 = ""; 
	let s9 = ""; 
	let s11 = ""; 
	let s13 = ""; 	
	
	if (arrIN.indexOf("1")  > -1){s1 = "1"; }
	if (arrIN.indexOf("b2") > -1){s2 = "b2"; }
	if (arrIN.indexOf("2")  > -1){s2 = "2"; }
	if (arrIN.indexOf("b3") > -1){s3 = "b3"; }
	if (arrIN.indexOf("3")  > -1){s3 = "3"; }
	if (arrIN.indexOf("4")  > -1){s4 = "4"; }
	if (arrIN.indexOf("#5") > -1){s5 = "#5"; }
	if (arrIN.indexOf("5") > -1) {s5 = "5"; }
	if (arrIN.indexOf("b5") > -1){s5 = "b5"; }
	if (arrIN.indexOf("6")  > -1){s6 = "6"; }
	if (arrIN.indexOf("bb7")> -1){s7 = "bb7";}
	if (arrIN.indexOf("b7") > -1){s7 = "b7"; }
	if (arrIN.indexOf("7")  > -1){s7 = "7"; }
	if (arrIN.indexOf("#7") > -1){s7 = "#7"; }
	if (arrIN.indexOf("b9") > -1){s9 = "b9";  }
	if (arrIN.indexOf("9")  > -1){s9 = "9";  }
	if (arrIN.indexOf("#9") > -1){s9 = "#9";  }
	if (arrIN.indexOf("b11")> -1){s11 = "b11";  }
	if (arrIN.indexOf("11") > -1){s11 = "11";}
	if (arrIN.indexOf("#11")> -1){s11 = "#11";  }
	if (arrIN.indexOf("b13")> -1){s13 = "b13";}
	if (arrIN.indexOf("13") > -1){s13 = "13";}
	if (arrIN.indexOf("#13")> -1){s13 = "#13";}
	
	let sName = "";
	//------------ Check if single note or diad 
	if (arrIN.length === 1) { return (sName.trim())}; 
	if (arrIN.length === 2) { 
		sName = arrIN[1]+" "+ "Interval"; 
		sName = sName.trim(); 
		return (sName);
	}; 
	
	
	//------------- Get iSeven
	let iSeven = 0;
	if (s7 === "b7" || s7 === "7" || s7 === "bb7") { 
		iSeven = 7; 
		if (s9 === "9" && s11 === "11" && s13 === "13") {iSeven = 13;}
		if (s9 === "9" && s11 === "11" && s13 !== "13") {iSeven = 11;}
		if (s9 === "9" && s11 !== "11")   {iSeven = 9;}	
	}	
	//bb7 only valid for Dim 
	if (s7 === "bb7") {
		if (s3 === "b3"  && s5 === "b5" ) {iSeven=7; }
	}	

	//------------ Get the triad 
	let arrTriad = []; 
	let sTriad = ""; 
	if (s1 !== "") {arrTriad.push(s1);}
	if (s2 !== "") {arrTriad.push(s2);}
	if (s3 !== "") {arrTriad.push(s3);}
	if (s4 !== "") {arrTriad.push(s4);}
	if (s5 !== "") {arrTriad.push(s5);}
	if (s7 !== "") {arrTriad.push(s7);}

	//let sTemp = arrTriad.join(); 
	let sTemp = arrTriad[0]+","+arrTriad[1]+","+arrTriad[2]; 

	console.log (sTemp); 
	switch (sTemp) {
		case ("1,3,5") 	: 
			sTriad="Major"; 
			if (iSeven > 0){if (s7 === "b7") {sTriad = "Dominant";}}
		break;
		
		case ("1,3,b5") : 
			sTriad="Major b5"; 
			if (iSeven > 0){if (s7 === "b7") {sTriad = "Dominant b5";}}
			break;
		case ("1,3,#5") : 
			sTriad="Augmented"; 
			if (iSeven > 0){
				if (s7 === "b7") {sTriad = "Augmented minor";}
				if (s7 === "7")  {sTriad = "Augmented Major";}
			}			
			break;			
		case ("1,b3,5") :
			sTriad="minor"; 
			if (iSeven > 0){
				if (s7 === "7")  {sTriad = "min/Maj";}
			}			
			break;
		case ("1,b3,b5"): 
			sTriad="Diminished"; 
			if (iSeven > 0){
				if (s7 === "bb7") {sTriad = "Diminished";}
				if (s7 === "b7")  {sTriad = "Half Diminished (m7b5)";}
				if (s7 === "7")  {sTriad = "dim Maj";}
			}
			break;
		case ("1,2,5")  : 
			sTriad="sus2"; 
			if (iSeven > 0){
				if (s7 === "b7") {sTriad = "sus2";}
				if (s7 === "7")  {sTriad = "Maj sus2";}
			}					
			break;
		case ("1,b2,5") : 
			sTriad="susb2"; 
			if (iSeven > 0){
				if (s7 === "b7") {sTriad = "susb2";}
				if (s7 === "7")  {sTriad = "Maj susb2";}
			}				
			break;
		case ("1,b2,b5"): 
			sTriad="sus b2b5"; 
			if (iSeven > 0){
				if (s7 === "b7") {sTriad = "sus b2b5";}
				if (s7 === "7")  {sTriad = "Maj sus b2b5";}
			}			
			break;
		case ("1,4,5")  : 
			sTriad="sus4"; 
			if (iSeven > 0){
				if (s7 === "b7") {sTriad = "sus4";}
				if (s7 === "7")  {sTriad = "Maj sus4";}
			}			
			break;
		case ("1,4,b5") : 
			sTriad="sus4b5"; 
			if (iSeven > 0){
				if (s7 === "b7") {sTriad = "sus4b5";}
				if (s7 === "7")  {sTriad = "Maj sus4b5";}
			}				
			break;

		default: sTriad="";  break; 
	}	

	//--------Finally build the chord name 
	let sExtensions = [];

	switch (iSeven){
		case 0: 
			if (s6 !== "") {sExtensions.push (s6); }
			if (s7 !== "") {sExtensions.push (s7); }
			if (s9 !== "") {sExtensions.push (s9); }		
			if (s11 !== "") {sExtensions.push (s11); }
			if (s13 !== "") {sExtensions.push (s13); }
			sName = sTriad + " " + sExtensions.join("/");
			//---- ver si esta excepción es válida, como son los 7 para los sus?
			if (sExtensions[0]==="7" || sExtensions[0]==="b7" || sExtensions[0]==="9" || sExtensions[0]==="11" || sExtensions[0]==="13") {
				sName = sTriad + " add " + sExtensions.join("/");
			}	
			break; 
		case 7:
			if (s6 !== "") {sExtensions.push (s6); }
			if (s9 !== "") {sExtensions.push (s9); }		
			if (s11 !== "") {sExtensions.push (s11); }
			if (s13 !== "") {sExtensions.push (s13); }	
			sName = sTriad + " " + iSeven.toString() + " " + sExtensions.join("/");		
			if (sExtensions[0]==="9" || sExtensions[0]==="11" || sExtensions[0]==="13") {
				sName = sTriad + " " + iSeven.toString() + " add " + sExtensions.join("/");
			}						
			break; 
		case 9:
			if (s6 !== "") {sExtensions.push (s6); }
			if (s11 !== "") {sExtensions.push (s11); }
			if (s13 !== "") {sExtensions.push (s13); }
			sName = sTriad + " " + iSeven.toString() + " " + sExtensions.join("/");
			if (sExtensions[0]==="13") {
				sName = sTriad + " " + iSeven.toString() + " add " + sExtensions.join("/");
			}				
			break; 
		case 11: 
			if (s6 !== "") {sExtensions.push (s6); }
			if (s13 !== "") {sExtensions.push (s13); }
			sName = sTriad + " " + iSeven.toString() + " " + sExtensions.join("/");
			break; 
		case 13: 
			sName = sTriad + " " + iSeven.toString() + " " + sExtensions.join("/");
			break; 
		default:
			break; 
	}


	sName = sName.trim(); 
	return (sName); 
	
}