"use strict";
DrawGuitar(); 
AddListenersToGuitar(); 

function ReverseChordMain(){
	//1. Read ALL the notes pressed in the fretboard 
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
	
	let strRoot =""; 
	if (arrNotesClean.length === 0) {
		console.log ("No notes pressed, exiting!"); 
		return; 
	}else{
		strRoot = arrNotesClean[0]; 
	}
		
	//3. Get all rotations of the notes 
	let rotations = GetArrayRotations(arrNotesClean); 

	//4.For each rotation: get the formulas (INTEGER and Degrees) for each permutation, triad and iSeven
	let arrNames = []; 
	let sName = ""; 
	console.log ("--------------------------------------------------------------------------------------------------------------------------------------"); 
	console.log ("Notes in fretboard: "+ arrNotes.join() + "   Notes: " + arrNotesClean.join() + "   Root:  "+strRoot);  
	for (let i=0; i < rotations.length; i++){ 		
		let arrFormulaINT = GetChordFormulaINT(rotations[i]);
		let arrFormulaSTR = GetChordFormulaSTR (arrFormulaINT); 
		sName = BuildChordName (arrFormulaSTR);
		if (sName !== ""){
			if (rotations[i][0] === strRoot){
				sName = rotations[i][0] +" " +sName; 
			}else{
				sName = rotations[i][0] +" " +sName + " /" + strRoot; 
			}
			arrNames.push(sName); 
		}
		console.log ("Rotation: " + rotations[i].join()+"   FormulaINT: "+arrFormulaINT +"   FormulaSTR: "+ arrFormulaSTR+"   Name: "+ sName ); 		
	}
	let element = document.getElementById("paraOutput");
	element.innerHTML = arrNames.join(); 
	element.innerHTML =arrNames.join("<br>");

}

//--------Event handlers-------------------------------------------------- 
function AddListenersToGuitar(){
	let dots = document.getElementsByClassName("dotUnpressed" || "dotPressed");
	for (let i = 0; i < dots.length; i++) {
		dots[i].addEventListener("click", funcClickNote, false);
		dots[i].addEventListener("dblclick", funcDblClickNote, false);
		dots[i].addEventListener("contextmenu", funcRightClickNote, false);
	}
	
	if (document.getElementById("selTuning")){
		document.getElementById("selTuning").addEventListener("change", ReverseChordMain, false);
	}
	
	
	//--------- barre-------------------------------------------------------------------------------------------------
	if (document.getElementById("sectionGuitarTab")){
		let iStringA = 0; let iFretA = 0; //mousedown
		let iStringB = 0; let iFretB = 0; //mouseup	
		let iString = 0; let iFret = 0; 
		
		document.getElementById("sectionGuitarTab").addEventListener("mousedown", function (event) {
			if (event.target.localName ===  "circle"){
				iStringA = parseInt(event.target.getAttribute("String"));
				iFretA = parseInt(event.target.getAttribute("Fret"));			
			}
		});

		document.getElementById("sectionGuitarTab").addEventListener('mouseup', function (event) {
			if (event.target.localName ===  "circle"){
				iStringB = parseInt(event.target.getAttribute("String")); 
				iFretB = parseInt(event.target.getAttribute("Fret"));	
				if (iFretA === iFretB && iStringA != iStringB){
					if (iStringA >= 1 && iStringA <= 6 && iStringB >= 1 && iStringB <= 6){
						iString = Math.max (iStringA, iStringB); 
					}else{
						console.log ("ERROR: String number must be >=1 and <=6");
						return; 
					}
					iFret = iFretA //could be also iFretB, for cleanliness 
					DeleteBarres(); 
					DrawBarre (iFret, iString); 
					AddListenersToBarre(); 
					FixDotsWhenBarre(); 
				}
			}
		});
	}
	//--------- barre-------------------------------------------------------------------------------------------------	

}

function funcClickNote(eventObj){
	if (eventObj.target.getAttribute("Pressed")==="Yes"){
		//console.log ("SAQUE el dedo"); 
		eventObj.target.setAttribute("Pressed", "No");
		eventObj.target.setAttribute("class", "dotUnpressed");
		
		FixDotsWhenBarre(); //need to check if there is a barre 
		ReverseChordMain(); 
		
		return; 
	}
	if (eventObj.target.getAttribute("Pressed")==="No"){
		//console.log ("PUSE el dedo"); 
		eventObj.target.setAttribute("Pressed", "Yes");
		eventObj.target.setAttribute("class", "dotPressed");
		
		//unpress all the arrDots in the same string 
        let arrDots = document.getElementsByClassName("dotPressed");
        let iString = eventObj.target.getAttribute("String");
        let iFret = eventObj.target.getAttribute("Fret");
		
        for (let i = 0; i < arrDots.length; i++) {
            if (arrDots[i].getAttribute("String") === iString) {
                if (arrDots[i].getAttribute("Fret") !== iFret) {
                    arrDots[i].setAttribute("class", "dotUnpressed");
                }
            }
        }

		//if fret number of the dot < barre (if any), need to delete the barre
		let colBarres = document.getElementsByClassName("barre"); 
		if (colBarres.length > 0){
			let iTempFret = parseInt(eventObj.target.getAttribute("Fret"));	
			let iTempString = parseInt(eventObj.target.getAttribute("String"));	
			
			if (iTempFret <= parseInt(colBarres[0].getAttribute("Fret"))){
				if (iTempString <= parseInt(colBarres[0].getAttribute("String"))){
					DeleteBarres(); 
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

//--------The DOM---------------------------------------------------------
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
			aCircle.setAttribute ("id", "String" + iString + "Fret" + i); 	
            svg.appendChild(aCircle);
        }
    }
	
    //add the SVG to the tab container 
	if (document.getElementById("sectionGuitarTab")){
		document.getElementById("sectionGuitarTab").appendChild(svg);
	}
}

function ReadAllNotesPressed(){
	//find all notes that are pressed
	//INPUT: None 
	//OUTPUT: Array of 6 <string> elements. Notes being pressed in the fretboard for each string. Example: ["x","C","E","G","C","x"]
	//returns empty array if note is not found for any of the frets pressed

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
		if (strNote === "ERROR") {return[];}
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

//-------Music Theory-----------------------------------------------------
function GetNoteForFret(iString, iFret, strTuning) {
    //INPUT:  a guitar string number (1 to 6), fret number and tuning
	//OUTPUT: (string) note in that string/fret
	//strTuning format: "E-A-D-g-b-e" 

	if (arguments.length < 3) {return "ERROR: Invalid number of arguments"}; 
	if (typeof(iString) !== "number") {return "ERROR: Invalid type"}; 
	if (typeof(iFret) !== "number") {return "ERROR: Invalid type"}; 
	if (iString < 0 || iString > 6) {return "ERROR: Invalid arguments"};
	if (iFret < 0) {return "ERROR: Invalid arguments"};
		
	//reference, we build the string from here 
    let arrString = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];
	
	//----------------sanitize strTuning---------- 
	if (strTuning.indexOf("'") > -1 ){
		strTuning = strTuning.replace (/'/g,''); 
	}
	if (strTuning.indexOf("b") > -1 ){
		strTuning = strTuning.replace (/Ab/g,'G#'); 
		strTuning = strTuning.replace (/Bb/g,'A#'); 
		strTuning = strTuning.replace (/Cb/g,'B'); 
		strTuning = strTuning.replace (/Db/g,'C#'); 
		strTuning = strTuning.replace (/Eb/g,'D#'); 
		strTuning = strTuning.replace (/Fb/g,'E'); 
		strTuning = strTuning.replace (/Gb/g,'F#');
	}
	//--------------------------------------------
		
	const arrTuning = strTuning.split ("-"); 
	if (arrTuning.length < 6) {return "ERROR: arguments"}


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
	if (index === -1) {
		console.log (strTuning + " strFirstNote: " + strFirstNote); 
		return "ERROR";
	}; 	
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
		if (arrIN.indexOf(1) > -1)  {arrIN[arrIN.indexOf(1)]+=12; }	//"b2" --> "b9"
		if (arrIN.indexOf(2) > -1)  {arrIN[arrIN.indexOf(2)]+=12; } //"2" --> "9"
		if (arrIN.indexOf(5) > -1)  {arrIN[arrIN.indexOf(5)]+=12; } //"4" --> "11"
	}
	
	if ((arrIN.indexOf(3) > -1) && (arrIN.indexOf(4)) > -1) {  //si hay "b3" y 3", "b3" --> "#9"
		arrIN[arrIN.indexOf(3)]+=12; 
	}
	
	if ((arrIN.indexOf(7) > -1) && (arrIN.indexOf(8)) > -1) {  //si hay "5" y #5", "#5" --> "b13"
		arrIN[arrIN.indexOf(8)]+=12; 
	}	
	
	//A 6th chord is a major triad with an added 6th.
	//A 13th chord is a dominant 7th chord in which the 5th is (in at least one voice) replaced by the 6th. 
	if (arrIN.indexOf(9) > -1){
		if ((arrIN.indexOf(10) > -1)&& arrIN.indexOf(11)){
			if (arrIN.indexOf(9) > -1)  {arrIN[arrIN.indexOf(9)]+=12; }  //"6" --> "13"
		}
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
	if (arrIN.length === 1) { 
		return (sName.trim())
	}; 
	if (arrIN.length === 2) { 
		sName = arrIN[1]+" "+ "Interval"; 
		sName = sName.trim(); 
		return (sName);
	}; 
	
	//------------- Get iSeven
	let iSeven = 0;
	if (s7 === "b7" || s7 === "7" || s7 === "bb7") { 
		iSeven = 7; 
		if (s13 === "13") {
			if ((s9 === "9" || s9 === "") && (s11 === "11" || s11 === "")) {iSeven = 13;} //9 and 11 optional in 13th		
		}
		if (s11 === "11" && s13 !== "13"){
			if (s9 === "9" || s9 === "")  {iSeven = 11;} //9 optional in 11th	
		}
		if (s9 === "9" && s11 !== "11" && s13 !== "13"){
			iSeven = 9; 
		}		
	}	
	
	//console.log ("iSeven: " + iSeven); 
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

	let sTemp = arrTriad[0]+","+arrTriad[1]+","+arrTriad[2]; 

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
			
		//--------------------5th can be ommitted for 7/b7 chords for guitar, http://www.smithfowler.org/music/Chord_Formulas.htm
		
		case ("1,3,b7")	:
			sTriad="Dominant"; 
			break; 	
		case ("1,3,7")	: 
			sTriad="Major"; 
			break; 			
		case ("1,b3,7") :
			sTriad="min/Maj"; 
			break;	
		case ("1,b3,b7") :
			sTriad="minor"; 
			break;
		
		//--------------------	
			
		case ("1,b3,5") :
			sTriad="minor"; 
			if (iSeven > 0){
				if (s7 === "7")  {sTriad = "min/Maj";}
			}			
			break;
			
		case ("1,b3,b5"): 
			sTriad="Diminished"; 
			if (iSeven > 0){
				if (s6 === "6") {sTriad = "Diminished";	}
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
	if (sTriad === "") {return (sName.trim())}
	
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

	//---exceptions .... 
	//"Diminished 6" --> "Diminished" ("1,b3,b5,6" --> ": 1,b3,b5,bb7")
	if (sName.indexOf("Diminished 6") > -1) {sName = sName.replace ("Diminished 6","Diminished"); }

	sName = sName.trim(); 
	return (sName); 
	
}

//-------Auxiliary functions for arrays-----------------------------------
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

//-------Functions related to barre---------------------------------------
function DrawBarre(iFret,iString){
   //INPUT: iString <integer>: number of string 1 to 6. iFret:<integer> Fret number of the barre
   //OUTPUT: none	
  
	if (arguments.length !==2) {console.log ("ERROR: Invalid number of arguments"); return;}
	if (typeof(iFret) !== "number") {console.log ("ERROR: Invalid type"); return;}
	if (typeof(iString) !== "number") {console.log ("ERROR: Invalid type"); return;};	
	if (parseInt(iString)> 6) {console.log ("ERROR: Invalid input"); return;}; 
	if (parseInt(iFret)< 0) {console.log ("ERROR: Invalid input"); return;}; 	
	
    let w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    let h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    let unitW = 0.014 * w;
    let unitH = unitW * 1.618;
    if (unitW < 19.124 || unitH < 30.942632) { //keep a bigger size for smaller screens
        unitW = 19.124;
        unitH = 30.942632;
    }	
	
	let guitar = document.getElementById("SVGReverseChordFinderGeneric"); 
	let aBarre = document.createElementNS("http://www.w3.org/2000/svg", "line");
    let colDots1 = document.getElementsByClassName("dotPressed"); //this is a LIVE collection and that's why we need an array (arrDots[])
	let colDots2 = document.getElementsByClassName("dotUnpressed"); //this is a LIVE collection and that's why we need an array (arrDots[])
	let arrDots =[]; 
	
	for (let i=0; i<colDots1.length; i++){
		if (parseInt(colDots1[i].getAttribute("Fret")) === parseInt(iFret)){
			if (parseInt(colDots1[i].getAttribute("String")) <= parseInt(iString)){arrDots.push (colDots1[i]);}
		}
	}
	for (let i=0; i<colDots2.length; i++){
		if (parseInt(colDots2[i].getAttribute("Fret")) === parseInt(iFret)){
			if (parseInt(colDots2[i].getAttribute("String")) <= parseInt(iString)){arrDots.push (colDots2[i]);}
		}
	}	

	//find coordinates for the starting and ending point of the barre
	let x1 = 0; let y1 = 0; 
	let x2 = 0; let y2 = 0; 
	for (let i = 0; i < arrDots.length; i++) {
		if (parseInt(arrDots[i].getAttribute("String")) === 1){
			x1 = parseFloat(arrDots[i].getAttribute("cx")); 
			y1 = parseFloat(arrDots[i].getAttribute("cy")); 
		}
		if (parseInt(arrDots[i].getAttribute("String")) === parseInt(iString)){
			x2 = parseFloat (arrDots[i].getAttribute("cx"));
			y2 = parseFloat (arrDots[i].getAttribute("cy"));				
		}			
	}		
	
	if (aBarre.getAttribute("y1") !== aBarre.getAttribute("y2")){
		console.log ("ERROR: There is no such a concept as a diagonal barre"); 
		return; 
	}
		
	aBarre.setAttribute("x1", x1);
	aBarre.setAttribute("y1", y1);		
	aBarre.setAttribute("x2", x2);
	aBarre.setAttribute("y2", y2);				
    aBarre.setAttribute('stroke-width', unitH/2);
    aBarre.setAttribute("class", "barre");
	aBarre.setAttribute("Fret", iFret);
	aBarre.setAttribute("String", iString);
    guitar.appendChild(aBarre);		
	
	
	FixDotsWhenBarre(); 
	ReverseChordMain(); 
	
}

function DeleteBarres(){
	//Erase all barres if any
	let iBarreString = 0; 
	let iBarreFret = 0; 
	
	let aBarres = document.getElementsByClassName("barre");
	if (aBarres.length === 0){return;}  //exit since there is no barre
	
	iBarreString = parseInt(aBarres[0].getAttribute("String")); 
	iBarreFret = parseInt(aBarres[0].getAttribute("Fret"));
	
	//1. Unpress the dots under the barre
	for (let i=0; i <= iBarreString; i++){
		let dot = document.getElementById("String"+i+"Fret"+iBarreFret); 		
		if (dot !== null){		
			dot.setAttribute("Pressed", "No");
			dot.setAttribute("class", "dotUnpressed");		
		}
	}
	
	//2. Remove the barre
	for (let i=0; i < aBarres.length; i++){aBarres[i].remove();}		
	
	ReverseChordMain(); 
}

function FixDotsWhenBarre(){
   //INPUT: none
   //OUTPUT: none	
   
   let iBarreString = 0; 
   let iBarreFret = 0; 
   
	if (arguments.length !==0) {console.log ("ERROR: Invalid number of arguments"); return;}
	
	let aBarres = document.getElementsByClassName("barre");
	if (aBarres.length === 0){
		console.log ("No barre found!");	
		return;
	}else{
		iBarreFret = parseInt(aBarres[0].getAttribute("Fret"));
		iBarreString = parseInt(aBarres[0].getAttribute("String"));
		//console.log ("String: "+iBarreString +"   Fret: "+iBarreFret);  		
	}

	for (let i=1; i <= iBarreString; i++){  //for each guitar string pressed by the barre 
		for (let j=0; j<26; j++){	        //for each fret in that string 
			let dot = document.getElementById("String"+i+"Fret"+j); 		
			if (dot !== null){
				if (j === iBarreFret){				//press all dots UNDER the barre 
					dot.setAttribute("Pressed", "Yes");
					dot.setAttribute("class", "dotPressed");						
				}
				if (dot.getAttribute("Pressed") === "Yes") {
					if (j < iBarreFret){				//unpress all dots before the barre
						dot.setAttribute("Pressed", "No");
						dot.setAttribute("class", "dotUnpressed");
					}

					if (j > iBarreFret){				//this is a dot pressed after the barre, need to unpress the dot under the barre
						let dot2 = document.getElementById("String"+i+"Fret"+iBarreFret); 
						if (dot2 !== null){
							dot2.setAttribute("Pressed", "No");
							dot2.setAttribute("class", "dotUnpressed");							
						}
					}
				}
			}
		}
	}	
}

function AddListenersToBarre(){
	let aBarres = document.getElementsByClassName("barre");
	if (aBarres.length > 0){
		//aBarres[0].addEventListener("click", function (event) {aBarres[0].remove(); });
		aBarres[0].addEventListener("click", function (event) {DeleteBarres()});
	}
}

//yet another chord generator test 
function PRUEBA (){
    let arr1 = ["1"];
	let arr2 = ["","b2", "2"]; 
	let arr3 = ["","b3", "3"];
    let arr4 = ["", "4"]; 
	let arr5 = ["","b5", "5", "#5"];
    let arr6 = ["", "6"];
    let arr7 = ["", "bb7", "b7", "7"];
	let arr9 = ["", "b9", "9", "#9"];
    let arr11 = ["", "b11", "11", "#11"];
    let arr13 = ["", "b13", "13", "#13"];												
 
    let i1, i2, i4, i3, i5, i6, i7, i9, i11, i13;
	
    let counterChords = 0;
	let bolOk = true; 	
	
	for (i1 = 0; i1 < arr1.length; i1++){
		for (i2 = 0; i2 < arr2.length; i2++) {
			for (i3 = 0; i3 < arr3.length; i3++) {
				for (i4=0; i4< arr4.length; i4++){
					for (i5 = 0; i5 < arr5.length; i5++) {
						for (i6 = 0; i6 < arr6.length; i6++) {
							for (i7 = 0; i7 < arr7.length; i7++) {
								for (i9 = 0; i9 < arr9.length; i9++) {
									for (i11 = 0; i11 < arr11.length; i11++) {
										for (i13 = 0; i13 < arr13.length; i13++) {
											//console.log ("1", arr2[i2], arr3[i3], arr5[i5], arr6[i6], arr7[i7], arr9[i9], arr11[i11], arr13[i13]);	
											bolOk = true;
											
											//generate the Chord FormulaStr 
											let arrFormulaStr=[]; 
											arrFormulaStr.length = 0; 
											if (arr1[i1] !== "") {arrFormulaStr.push(arr1[i1])}; 
											if (arr2[i2] !== "") {arrFormulaStr.push(arr2[i2])};
											if (arr3[i3] !== "") {arrFormulaStr.push(arr3[i3])};
											if (arr4[i4] !== "") {arrFormulaStr.push(arr4[i4])};
											if (arr5[i5] !== "") {arrFormulaStr.push(arr5[i5])};
											if (arr6[i6] !== "") {arrFormulaStr.push(arr6[i6])};
											if (arr7[i7] !== "") {arrFormulaStr.push(arr7[i7])};
											if (arr9[i9] !== "") {arrFormulaStr.push(arr9[i9])};
											if (arr11[i11] !== "") {arrFormulaStr.push(arr11[i11])};
											if (arr13[i13] !== "") {arrFormulaStr.push(arr13[i13])};
											
											//remember that 9, 11 and 13 can also be thought of as 2, 4 and 6
											if (1){
												if (arr1[i1] ==="1" 	&& arr7[i7]  ==="#7")	{bolOk = false;}
												if (arr2[i2] ==="b2" 	&& arr9[i9]  ==="b9") 	{bolOk = false;}	
												if (arr2[i2] ==="2" 	&& arr9[i9]  ==="9") 	{bolOk = false;}
												if (arr3[i3] ==="b3" 	&& arr9[i9]  ==="#9") 	{bolOk = false;}		
												if (arr3[i3] ==="3" 	&& arr11[i11] ==="b11")	{bolOk = false;}	
												if (arr4[i4] ==="4" 	&& arr11[i11] ==="11") 	{bolOk = false;}
												if (arr5[i5] ==="b5" 	&& arr11[i11] ==="#11")	{bolOk = false;}	
												if (arr5[i5] ==="5" 	&& arr13[i13] ==="bb13"){bolOk = false;}	
												if (arr5[i5] ==="#5" 	&& arr13[i13] ==="b13") {bolOk = false;}
												if (arr6[i6] ==="6" 	&& arr13[i13] ==="13") 	{bolOk = false;}
												if (arr7[i7] ==="b7" 	&& arr13[i13] ==="#13") {bolOk = false;}
												if (arr7[i7] ==="bb7" 	&& arr6[i6]   ==="6") 	{bolOk = false;}		
											}
											
											//bb7 only valid for Dim 
											if (arr7[i7] === "bb7") {
												if (arr2[i2] === "" && arr3[i3]=== "b3" && arr4[i4] === "" && arr5[i5] === "b5" && arr6[i6]  === "") {
													//do nothing 
												}
												else {
													bolOk = false;
												}
											}											
											
											if (arr2[i2] ==="" && arr3[i3] ==="" && arr4[i4] ==="") {bolOk = false;} 
											if (arr2[i2] ==="" && arr3[i3] ==="" && arr4[i4] ==="" && arr5[i5] ==="") {bolOk = false;} 
											if (arr3[i3] !=="" && arr2[i2] !=="") {bolOk = false;} //2 and 3 not a valid triad
											if (arr3[i3] !=="" && arr4[i4] !=="") {bolOk = false;} //3 and 4 not a valid triad
											if (arr2[i2] !=="" && arr4[i4] !=="") {bolOk = false;} //2 and 4 not a valid triad
											if (arr2[i2] ==="2" && arr5[i5] ==="b5") {bolOk = false;} //2 and b5 not a valid triad
											if (arr2[i2] ==="2" && arr5[i5] ==="#5") {bolOk = false;} //2 and #5 not a valid triad
											if (arr2[i2] ==="b2" && arr5[i5] ==="#5") {bolOk = false;} //b2 and #5 not a valid triad
											if (arr3[i3] ==="b3" && arr5[i5] ==="#5") {bolOk = false;} //b3 and #5 not a valid triad
											if (arr2[i2] ==="" && arr3[i3] ==="" && arr4[i4] ==="4" && arr5[i5] ==="#5") {bolOk = false;} //b3 and #5 not a valid triad
											if (arr2[i2] ==="" && arr3[i3] ==="" && arr4[i4] ==="" && arr5[i5] ==="b5") {bolOk = false;} 
											
											//5 is optional for 7/9/11/13 chords 
											if (arr5[i5] === ""){
												if (arr7[i7] === "b7" || arr7[i7] === "7" || arr7[i7] === "bb7") { } else {bolOk = false;}
											}
											//9 is optional por 11/13 chords 
											if (arr9[i9] === ""){
												if (arr7[i7] === "b7" || arr7[i7] === "7" || arr7[i7] === "bb7") { } else {bolOk = false;}
												if (arr11[i11] === "11" ) { } else {bolOk = false;}
											}
											
											//11 is optional por 13 chords 
											if (arr11[i11] === ""){
												
												
											}
											
											
											if (bolOk){
												counterChords++;
												console.log (arrFormulaStr.join()); 
											}
										
										}
									}
								}														
							}
						}
					}
				}
			}
		}
	}
console.log (counterChords + "  " + "chords!");  
}

		
