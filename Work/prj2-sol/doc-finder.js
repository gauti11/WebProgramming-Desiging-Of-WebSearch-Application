const assert = require('assert');
const mongo = require('mongodb').MongoClient;
const {inspect} = require('util'); //for debugging
let dbName;
let client;
let db;
'use strict';

/** This class is expected to persist its state.  Hence when the
 *  class is created with a specific database url, it is expected
 *  to retain the state it had when it was last used with that URL.
 */ 
class DocFinder {

  /** Constructor for instance of DocFinder. The dbUrl is
   *  expected to be of the form mongodb://SERVER:PORT/DB
   *  where SERVER/PORT specifies the server and port on
   *  which the mongo database server is running and DB is
   *  name of the database within that database server which
   *  hosts the persistent content provided by this class.
   */
  constructor(dbUrl) {
    //TODO
	this.dbUrl = dbUrl;
	//this._wordsLow = new Map ();
	//this.noiseWords = new Set();
	this.storeNoise = new Map();
       // this.storeNoise = new Map();
	this.indexes = new Map();
	this.dataSet = new Map();
	this.storeContent = new Map();
	this.fileIndexes = new Map();
	this.storeOffsetMatch = new Map();
	//console.log(dbUrl);
	
  }

  /** This routine is used for all asynchronous initialization
   *  for instance of DocFinder.  It must be called by a client
   *  immediately after creating a new instance of this.
   */
  async init() {
	//let client;
    	client = await mongo.connect(this.dbUrl, MONGO_OPTIONS);
	db = client.db('docs');  	
	//console.log("COnnection Successful");
	//client.close();
	//TODO
  }

  /** Release all resources held by this doc-finder.  Specifically,
   *  close any database connections.
   */
  async close() {
    //TODO
	await client.close();
  }

  /** Clear database */
  async clear() {
    //TODO
  }

  /** Return an array of non-noise normalized words from string
   *  contentText.  Non-noise means it is not a word in the noiseWords
   *  which have been added to this object.  Normalized means that
   *  words are lower-cased, have been stemmed and all non-alphabetic
   *  characters matching regex [^a-z] have been removed.
   */
async words(contentText) {
    //TODO
//console.log(!this.is_noise_word('a'));
	//console.log("hfjerygrje    "+await this._wordsLow(await (contentText)).map((w) => normalize(w.word)).filter(w => !(this.is_noise_word(w))));
	let n_arr = [];
	let arr = this._wordsLow((contentText)).map((w) => normalize(w.word));
	//console.log("arr: "+arr);
	for (let a of arr) {
		//console.log("a: "+a, await !this.is_noise_word(a));
		/*if(await !this.is_noise_word(a)) {
			console.log("n_arr: "+n_arr);
			n_arr.push(a);
		}*/

	
		if(await db.collection("noiseWords").findOne({name:a})==null){
				try{	
				//console.log("a: "+a);
				//console.log("hello");	
				n_arr.push(a);
				}
				catch(error){
					return error;
					}
				}
		//else {}
			








	}
	//console.log(arr.filter)
//return this._wordsLow((contentText)).map((w) => normalize(w.word)).filter((w) => !this.is_noise_word(w));
    return n_arr;
  }

  /** Add all normalized words in the noiseText string to this as
   *  noise words.  This operation should be idempotent.
   */
async addNoiseWords(noiseText) {
    //TODO
	//db = await db.collection("noiseWords").insertOne(noiseText, MONGO_OPTIONS);
	//console.log("1 Document Inserted")
	//this.db.createCollection("noiseWords");
	//this.words(noiseWords).forEach((w) => this.noiseWords.add(w));
	//console.log("hello");
var noiseList = noiseText.split("\n");
      		for(var i=0;i<noiseList.length;i++)
     		 {
			//console.log("verification");
	 	 	await db.collection("noiseWords").insertOne({name:noiseList[i]})
			//this.storeNoise.set(noiseList[i],noiseList[i]);	 		
}
//console.log(noiseText);	
  }

/*async is_noise_word(word){
//console.log(await db.collection("noiseWords").findOne({name:word}).count());
if(await db.collection("noiseWords").findOne({name:word})!=null){
	try{	
	console.log(word);
	//console.log("hello");	
	return true;
	}
	catch(error){
		return error;
		}
	}
else{
console.log("in else:   "+ word);
return false;
}
}*/

_wordsLow(content){
	let match;
	//console.log("hello");
	var storeMatch = [];
	//console.log(content);
	while (match = WORD_REGEX.exec(content)) {
	    const [word, offset] = [match[0], match.index];
	  // console.log(word, offset);
	    storeMatch.push({word, offset});
	}
        //console.log("this is from array in noise words", storeMatch);
	//console.log(storeMatch);
	//this.storeOffsetMatch = storeMatch;
 return storeMatch;
    }

  /** Add document named by string name with specified content string
   *  contentText to this instance. Update index in this with all
   *  non-noise normalized words in contentText string.
   *  This operation should be idempotent.
   */ 
 async addContent(name, contentText) {
    //TODO

var fileContent  = this.dataSet.set(name, contentText);
	await db.collection("DocInfo").update({_id: name},{_id: name, fileContent: contentText},{upsert:true});
	//var editContent = this.words(content);
	//console.log("Edit  " + editContent);
	//var editContent = content.split(" ");
	//console.log(name);
	//var count = 1;	
	let doc_arr = [];
	var lineWithNumber = new Map();
	this.storeOffsetMatch.set(name, lineWithNumber);
	//console.log("jsdgfdgfkdfh: ", this.storeOffsetMatch);

	var contentList = contentText.split("\n");
	let counter = 0;
      	for(var j=0;j<contentList.length;j++)
      	{
	//console.log("name: "+name);
		lineWithNumber.set(contentList[j], counter);
		//await db.collection("lineDataCounter").update({_id: editContent[i]},{$set:{fileName: name, _id: editContent[i],count: count}},{upsert: true});
		counter++;
		//console.log(contentList);
		var editContent = await this.words(contentList[j]);
		//console.log(editContent);
		for(var i=0;i<editContent.length;i++)
	      	{
			//console.log(editContent[i]);
			var count = 1;
			if(this.indexes.has(name +" "+editContent[i]))
			{		
				count = this.indexes.get(name +" "+editContent[i]);
				this.indexes.set(name + " " +editContent[i], count+1);
				count++;			
			}
			else{
				this.fileIndexes.set(name,name);
				this.indexes.set(name +" " +editContent[i], count);
				doc_arr.push()
				//this.db.collection("TableData").insertOne({fileName: name, word: editContent[i]})
				//await db.collection("TableData").insertOne({_id: editContent[i],fileName: name,count: 0, line: contentList[j]});
				await db.collection("TableData").update({_id: {word: editContent[i],fileName: name}},{$set:{ _id:{word: editContent[i],fileName: name},count: 0, line: contentList[j], lineCounter:counter}},{upsert: true});
				this.storeContent.set(name +" " +editContent[i] , contentList[j]);
			}
			//await db.collection("TableData").update({"_id.word": editContent[i],"_id.fileName": name},{$set:{ _id: editContent[i],count: count}},{upsert: true});

			await db.collection("TableData").update({_id: {word: editContent[i],fileName: name}},{$set:{ count: count}},{upsert: true});
		}


	//await db.collection("TableData").update({_id: {word: editContent[i],fileName: name}},{$set:{ count: count}},{upsert: true});

	//console.log("file Indexes: ", this.fileIndexes);
	} 	
//console.log("indexes: ", this.indexes);
//console.log("After sujfgdgkudvhflvfl: ",this.storeOffsetMatch);  

}

  /** Return contents of document name.  If not found, throw an Error
   *  object with property code set to 'NOT_FOUND' and property
   *  message set to `doc ${name} not found`.
   */
  async docContent(name) {
    //TODO
	//console.log(name);
	let ret = await db.collection("DocInfo").find({_id:name}).toArray();
	//console.log(ret);
	if(ret.length == 0)
	{
	//console.log("in fail");
	return "";
	}
	else{
	return ret[0].fileContent;
	}
  }
  
  /** Given a list of normalized, non-noise words search terms, 
   *  return a list of Result's  which specify the matching documents.  
   *  Each Result object contains the following properties:
   *
   *     name:  the name of the document.
   *     score: the total number of occurrences of the search terms in the
   *            document.
   *     lines: A string consisting the lines containing the earliest
   *            occurrence of the search terms within the document.  The 
   *            lines must have the same relative order as in the source
   *            document.  Note that if a line contains multiple search 
   *            terms, then it will occur only once in lines.
   *
   *  The returned Result list must be sorted in non-ascending order
   *  by score.  Results which have the same score are sorted by the
   *  document name in lexicographical ascending order.
   *
   */
  async find(terms) {
    //TODO
	let f_ret = await db.collection("DocInfo").distinct('_id');

	var map = new Map();
	var m = new Map();
	for(let file of f_ret) {
		let data =[];
		let counter=0;
		let d_print='';
		let min_line = 9999;
		for(let term of terms) {
			let d_arr = await db.collection("TableData").find({_id:{word:term, fileName: file}}).toArray();
			//console.log(d_arr[0].count);

			if(d_arr.length!=0){
				//console.log(d_arr);
				counter += d_arr[0].count;
				if(d_print != d_arr[0].line+"\n") {
					if(d_arr[0].lineCounter < min_line) {
						min_line = d_arr[0].lineCounter;
						d_print = d_arr[0].line+ "\n"+ d_print ;
					} else {
						d_print = d_print + d_arr[0].line+ "\n";
					}
				}
			}
			
		}

		//console.log("data: "+data);
		/*for(let val of data) {
			console.log("val: "+val);
			counter += val.count;
			if(d_print !== val.line) {
				d_print = d_print + val.line;
			}
		}*/
		if(counter != 0) {
			//m.set(counter, map.set(file, d_print));
			let gh = file+":"+d_print;
			m.set(counter, gh);
		}
		
	}
	

	var tKey = Array.from(m.keys()).sort(function(a, b){return b-a});
	var resArr = [];
	for (let z of tKey) {
		var res = m.get(z).split(":");
		//console.log(res);
		let r = new Result(res[0], z, res[1]);
		resArr.push(r);
	}
    return resArr;
  }

  /** Given a text string, return a ordered list of all completions of
   *  the last normalized word in text.  Returns [] if the last char
   *  in text is not alphabetic.
   */
  async complete(text) {
    //TODO
	var resultArr = [];
	let arr = await db.collection("TableData").distinct('_id.word');
//this._wordsLow((contentText)).map((w) => normalize(w.word)).filter((w) => !this.is_noise_word(w));
	//let x = Array.from(arr).map((w)).filter((w)=> w.startsWith(text));
	//console.log(arr[0]);
	for(let w of arr) {
		if(w.startsWith(text)) {
			resultArr.push(w);
		}
	}
	//resultArr = Array.from(map1.keys());
	return resultArr;
  }

  //Add private methods as necessary

} //class DocFinder

module.exports = DocFinder;

//Add module global functions, constants classes as necessary
//(inaccessible to the rest of the program).

//Used to prevent warning messages from mongodb.
const MONGO_OPTIONS = {
  useNewUrlParser: true
};

/** Regex used for extracting words as maximal non-space sequences. */
const WORD_REGEX = /\S+/g;

/** A simple utility class which packages together the result for a
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
  return word.replace(/\'s$/, '');
}



