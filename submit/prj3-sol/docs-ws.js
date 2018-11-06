'use strict';

const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const process = require('process');
const url = require('url');
const queryString = require('querystring');

const OK = 200;
const CREATED = 201;
const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const CONFLICT = 409;
const SERVER_ERROR = 500;


//Main URLs
const DOCS = '/docs';
const COMPLETIONS = '/completions';

//Default value for count parameter
const COUNT = 5;
const START = 0


/** Listen on port for incoming requests.  Use docFinder instance
 *  of DocFinder to access document collection methods.
 */
function serve(port, docFinder) {
  const app = express();
  app.locals.port = port;
  app.locals.finder = docFinder;
  setupRoutes(app);
  const server = app.listen(port, async function() {
    console.log(`PID ${process.pid} listening on port ${port}`);
  });
  return server;
}

module.exports = { serve };


function setupRoutes(app) {
  app.use(cors());            //for security workaround in future projects
  app.use(bodyParser.json()); //all incoming bodies are JSON
  	
  //@TODO: add routes for required 4 services
  
  app.post(`${DOCS}` , AddContent(app));
  app.get(`${DOCS}/:name` , GetContent(app));
  app.get(`${COMPLETIONS}` , GetCompletions(app));
  app.get(`${DOCS}?:query` , SearchContent(app));
  
  app.use(doErrors()); //must be last; setup for server errors   
}

function GetContent(app){
return errorWrap(async function(req, res) {  
 try {
      const name = req.params.name;
	//console.log(name);
      const results = await app.locals.finder.docContent(name);
	//console.log(results);
	//var arr = [];
	var links = { rel:"self" , href: baseUrl(req,DOCS+'/'+name)}
	var ws1 = {content:results, links}
      //const results = await app.locals.model.read({ id: id });
      if (results.length === 0) {
	throw {
	  isDomain: true,
	  errorCode: 'NOT_FOUND',
	  message: `user ${name} not found`,
	};
      }
      else {
	res.json(ws1);
      }
    }
    catch(err) {
	
      const mapped = mapError(err);
      res.status(mapped.status).json(mapped);
    }
  });

}



function GetCompletions(app){
return errorWrap(async function(req, res) {  
 try {
	//console.log(req.query)
	//console.log(res)
      const text = req.query.text;
	if(typeof req.query['text']==='undefined')
		{
			res.status(BAD_REQUEST).json({ code: 'BAD_PARAM', message: "bad query parameter \"text\"is missing" });
			return
		}
      const results = await app.locals.finder.complete(text);
	//console.log(results);
      if (results.length === 0) {
	throw {
	  isDomain: true,
	  errorCode: 'NOT_FOUND',
	  message: `user ${name} not found`,
	};
      }
      else {
	res.json(results);
      }
    }
    catch(err) {
      const mapped = mapError(err);
      res.status(mapped.status).json(mapped);
    }
  });

}



function AddContent(app) {
	//console.log("hello");
  return errorWrap(async function(req, res) {
    try {
      const obj = req.body;
	if(typeof obj.name==='undefined')
		{
			res.status(BAD_REQUEST).json({ code: 'BAD_PARAM', message: "required body parameter \"name\"is missing" });
			return;
		}
	if(typeof obj.content==='undefined')
		{
			res.status(BAD_REQUEST).json({ code: 'BAD_PARAM', message: "required body parameter \"content\"is missing" });
			return;
		}
     // console.log(obj.name," : ",obj.content);
      const results = await app.locals.finder.addContent(obj.name , obj.content);
      var addcont = {href: baseUrl(req,DOCS+'/'+obj.name)}
      res.append('Location', baseUrl(req) + '/' + obj.name);
      res.status(CREATED).json(addcont);
    }
    catch(err) {
      const mapped = mapError(err);
      res.status(mapped.status).json(mapped);
    }
  });
}




function SearchContent(app){
return errorWrap(async function(req, res) {  
 try {
	//console.log(req);
	
    const query = req.query || {};
	
	if (query.q === undefined)
	{
		res.status(BAD_REQUEST).json({ code: 'BAD_PARAM', message: "required query parameter \"q\" is missing" });
	}
	else
	{
		let q = query.q;
		let start = (query.start !== undefined) ? parseInt(query.start) : parseInt(START);
		let count = (query.count !== undefined) ? parseInt(query.count) : parseInt(COUNT);
		
		if(isNaN(start) || start < 0)
		{
			res.status(BAD_REQUEST).json({ code: 'BAD_PARAM', message: "bad query parameter \"start\"" });
		}
		else if(isNaN(count) || count < 0)
		{
			res.status(BAD_REQUEST).json({ code: 'BAD_PARAM', message: "bad query parameter \"count\"" });
		}
		else
		{
			const records = await app.locals.finder.find(q);
			// Total number of records
			const totalCount = records.length;
			
			let arr = [];
			if(totalCount > 0)
			{
				let c2=0;
				for(var i = start; i < totalCount && i < start + count; i++ )
				{
				  // Please correct this if it is wrong.
				  records[i].href = baseUrl(req) + 'docs' + '/' + records[i].name;
                                  arr[c2++]=records[i];
				}
			}
			let links = [];
			q = q.replace(' ', '%20');
			var selflink = {
								"rel" : "self",
								"href" : baseUrl(req) + 'docs?q=' + q + "&start=" + start + "&count=" + count
							};
			let c=0;
			links[c++] = selflink;
			
			if(start > 0)
			{
			  var previousLink = {
									"rel" : "previous",
									"href" : baseUrl(req) + 'docs?q=' + q + "&start=" + (start-count <= 0 ? 0 : start-count) + "&count=" + count
								 };
				links[c++] = previousLink;
				
			}
			
			if(start + count < totalCount)
			{
			  var nextLink = {
									"rel" : "next",
									"href" : baseUrl(req) + 'docs?q=' + q + "&start=" + (start+count) + "&count=" + count
						     };
			links[c++] = nextLink;
			}
			res.json(
					{
					  "results" : arr,
					  "totalCount" : totalCount,
					  "links" : links
					}
				);
		}		
	}
 
    }
    catch(err) {
      const mapped = mapError(err);
      res.status(mapped.status).json(mapped);
    }
  });

}



//@TODO: add handler creation functions called by route setup
//routine for each individual web service.  Note that each
//returned handler should be wrapped using errorWrap() to
//ensure that any internal errors are handled reasonably.

/** Return error handler which ensures a server error results in nice
 *  JSON sent back to client with details logged on console.
 */ 
function doErrors(app) {
  return async function(err, req, res, next) {
    res.status(SERVER_ERROR);
    res.json({ code: 'SERVER_ERROR', message: err.message });
    console.error(err);
  };
}

/** Set up error handling for handler by wrapping it in a 
 *  try-catch with chaining to error handler on error.
 */
function errorWrap(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    }
    catch (err) {
      next(err);
    }
  };
}
  

const ERROR_MAP = {
  EXISTS: CONFLICT,
  NOT_FOUND: NOT_FOUND
}

/** Map domain/internal errors into suitable HTTP errors.  Return'd
 *  object will have a "status" property corresponding to HTTP status
 *  code.
 */
function mapError(err) {
  console.error(err);
  return err.isDomain
    ? { status: (ERROR_MAP[err.errorCode] || BAD_REQUEST),
	code: err.errorCode,
	message: err.message
      }
    : { status: SERVER_ERROR,
	code: 'INTERNAL',
	message: err.toString()
      };
} 


/** Return base URL of req for path.
 *  Useful for building links; Example call: baseUrl(req, DOCS)
 */
function baseUrl(req, path='/') {
  const port = req.app.locals.port;
  const url = `${req.protocol}://${req.hostname}:${port}${path}`;
  return url;
}
