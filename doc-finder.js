const {inspect} = require('util'); //for debugging

'use strict';

class DocFinder {

  /** Constructor for instance of DocFinder. */
  constructor() {
      //@TODO
        this.storeNoise = new Map();
	this.indexes = new Map();
	this.dataSet = new Map();
	this.storeContent = new Map();
	this.fileIndexes = new Map();
	this.storeOffsetMatch = new Map();
      //this._wordsLow = new Map();
	 //console.log("CONSTRUCTOR CALLING");
  }

  /** Return array of non-noise normalized words from string content.
   *  Non-noise means it is not a word in the noiseWords which have
   *  been added to this object.  Normalized means that words are
   *  lower-cased, have been stemmed and all non-alphabetic characters
   *  matching regex [^a-z] have been removed.
   */
  words(content) {
    //@TODO
      //console.log("Method Words");	
	return this._wordsLow(content).map((w) => normalize(w.word)).filter((w) => !this.is_noise_word(w))	
	//console.log(this._wordsLow);
   // return [];
  }

is_noise_word(word){
//for(var i = 0; i<this.storeNoise.size; i++){
	if(this.storeNoise.has(word))
		{
			return true;
		}
	//}
}
 _wordsLow(content){
	let match;
	//console.log("hello");
	var storeMatch = [];
	//console.log(content);
	while (match = WORD_REGEX.exec(content)) {
	    const [word, offset] = [match[0], match.index];
	   //console.log(word, offset);
	    storeMatch.push({word, offset});
	}
        //console.log("this is from array in noise words", storeMatch);
        
	//console.log(storeMatch);
	//this.storeOffsetMatch = storeMatch;
 return storeMatch;
    }
    
  /** Add all normalized words in noiseWords string to this as
   *  noise words. 
   */
  addNoiseWords(noiseWords) {
      //@TODO
      var noiseList = noiseWords.split("\n");
      for(var i=0;i<noiseList.length;i++)
      {
	  this.storeNoise.set(noiseList[i],noiseList[i]);
	 }
		 
    //  console.log("Add NOise WOrds");
      //console.log(this.storeNoise);
  }

  /** Add document named by string name with specified content to this
   *  instance. Update index in this with all non-noise normalized
   *  words in content string.
   */ 

addContent(name, content) {
    //@TODO	
	//console.log(name);
	var fileContent  = this.dataSet.set(name, content);
	//var editContent = this.words(content);
	//console.log("Edit  " + editContent);
	//var editContent = content.split(" ");
	//console.log(name);
	//var count = 1;	

	var lineWithNumber = new Map();
	this.storeOffsetMatch.set(name, lineWithNumber);
	//console.log("jsdgfdgfkdfh: ", this.storeOffsetMatch);

	var contentList = content.split("\n");
	let counter = 0;
      	for(var j=0;j<contentList.length;j++)
      	{
	//console.log("name: "+name);
		lineWithNumber.set(contentList[j], counter);
		counter++;
		var editContent = this.words(contentList[j]);
//console.log(this.storeOffsetMatch);
		for(var i=0;i<editContent.length;i++)
	      	{
			//console.log(editContent[i]);
			var count = 1;	
			if(this.indexes.has(name +" "+editContent[i]))
			{		
				count = this.indexes.get(name +" "+editContent[i]);
				this.indexes.set(name + " " +editContent[i], count+1);
				//console.log(this.indexes.set(name + " " +editContent[i], count+1));
			}
			else{
				this.fileIndexes.set(name,name);
				this.indexes.set(name +" " +editContent[i], count);
				this.storeContent.set(name +" " +editContent[i] , contentList[j]);
			}
	}
//console.log(this.fileIndexes);
	} 	
//console.log(this.indexes);
//console.log("After sujfgdgkudvhflvfl: ",this.storeOffsetMatch);
  }
    
  /** Given a list of normalized, non-noise words search terms, 
   *  return a list of Result's  which specify the matching documents.  
   *  Each Result object contains the following properties:
   *     name:  the name of the document.
   *     score: the total number of occurrences of the search terms in the
   *            document.
   *     lines: A string consisting the lines containing the earliest
   *            occurrence of the search terms within the document.  Note
   *            that if a line contains multiple search terms, then it will
   *            occur only once in lines.
   *  The Result's list must be sorted in non-ascending order by score.
   *  Results which have the same score are sorted by the document name
   *  in lexicographical ascending order.
   *
   */
  find(terms) {
    //@TODO
	 //console.log(terms);
	/**var termCount = terms.length;
	//console.log(terms.length);
	//var hello = this.storeContent;
	//console.log(hello);
	var storeContentKeys = this.storeContent.keys();
	//console.log(storeContentKeys);
	let count = 0;
	for(let storeKey of storeContentKeys){
		//console.log(storeKey);
		let keyItem = ''+storeKey;
		var x = keyItem.split(' ')[0];
		var new_x = x+' '+terms[0];
		//console.log("key_x: "+new_x);
		if(keyItem === new_x) {
			console.log(x+" : "+this.storeContent.get(keyItem));
			console.log(x+" : "+this.indexes.get(keyItem));
		}
		//console.log("var x: ",x);
		//if(count != termCount
			
	}*/

	
	var termCount = terms.length;
	//console.log(terms.length);
	//var hello = this.storeContent;
	//console.log(hello);
	var storeContentKeys = this.fileIndexes.keys();
	//console.log(storeContentKeys);
	let count = 0;
	for(let storeKey of storeContentKeys){
		//console.log(termCount);
		let x = ''+storeKey;
		//var x = keyItem.split(' ')[0];
		if(termCount === 1) {
			var new_x = x+' '+terms[0];
			//console.log("key_x: "+new_x);
			if(this.storeContent.has(new_x)) {
				console.log(x+" : "+this.storeContent.get(new_x));
				console.log(this.indexes.get(new_x));
			}
		} else {
			//console.log(this.storeOffsetMatch);
			let minOff = 9999,minOff2 = 9999, minLine = '';
			let termFoundCount = 0, j = 0;
			let testMap = new Map();
			for(let termFound of terms) {
				var new_x = x+' '+termFound;
				if(this.indexes.get(new_x)) {
				//console.log(parseInt(this.indexes.get(new_x)),":",new_x);
				if(parseInt(this.indexes.get(new_x)) !== NaN) {
					//console.log("before j: "+parseInt(this.indexes.get(new_x)));
					
					j = parseInt(j)+parseInt(this.indexes.get(new_x));
					//if(j == NaN) {
						//console.log("sjfgjshdjshs");
					//	j = parseInt(this.indexes.get(new_x));
					//}
					//console.log("before j: "+j);
					var xyz = this.storeOffsetMatch.get(x).get(this.storeContent.get(new_x));
					//console.log("xyz: ",xyz);
					if(!testMap.has(this.storeContent.get(new_x))) {
						testMap.set(parseInt(xyz),this.storeContent.get(new_x));
					}
					if(minOff > xyz) {
						minOff = xyz;
						minLine = this.storeContent.get(new_x);
					}
				}
				}
			}
			if(j !== NaN && j != 0) {
				console.log(x," : ",j);
				//console.log(testMap);
				var tKey = Array.from(testMap.keys());
				
				tKey.sort(function(a, b){return a-b});
				for (let z of tKey)
					console.log (testMap.get(z));
			}
		}
			
	}





	/**for(var i=0;i<terms.length;i++)
	{	
		console.log(this.indexes);
		if(this.indexes.has(terms[i]))
		{
			console.log("in the file");
			console.log(this.storeContent(name +" " +terms[i] , contentList[i]));
			}
		}*/
    return [];
  }


  /** Given a text string, return a ordered list of all completions of
   *  the last word in text.  Returns [] if the last char in text is
   *  not alphabetic.
   */
  complete(text) {
    //@TODO
   	 console.log(text);	  
	return [];
  }  



} //class DocFinder

module.exports = DocFinder;

/** Regex used for extracting words as maximal non-space sequences. */
const WORD_REGEX = /\S+/g;

/** A simple class which packages together the result for a 
 *  document search as documented above in DocFinder.find().
 */ 
class Result {
  constructor(name, score, lines) {
    this.name = name; this.score = score; this.lines = lines;
  }
  toString() { return `${this.name}: ${this.score}\n${this.lines}`; }
}

/** Compare result1 with result2: higher scores compare lower; if
 *  scores are equal, then lexicographically earlier names compare
 *  lower.
 */
function compareResults(result1, result2) {
  return (result2.score - result1.score) ||
    result1.name.localeCompare(result2.name);
	console.log("Comparing results");
}

/** Normalize word by stem'ing it, removing all non-alphabetic
 *  characters and converting to lowercase.
 */
function normalize(word) {
	return stem(word.toLowerCase()).replace(/[^a-z]/g, '');
}

/** Place-holder for stemming a word before normalization; this
 *  implementation merely removes 's suffixes.
 */
function stem(word) {
	//console.log("normalise WORD");
  return word.replace(/\'s$/, '');
}

