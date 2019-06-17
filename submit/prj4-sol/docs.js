'use strict';

const express = require('express');
const upload = require('multer')();
const fs = require('fs');
const mustache = require('mustache');
const Path = require('path');
const { URL } = require('url');

const STATIC_DIR = 'statics';
const TEMPLATES_DIR = 'templates';

function serve(port, base, model) {
  const app = express();
  app.locals.port = port;
  app.locals.base = base;
  app.locals.model = model;
  process.chdir(__dirname);
  app.use(base, express.static(STATIC_DIR));
  setupTemplates(app, TEMPLATES_DIR);
  setupRoutes(app);
  app.listen(port, function() {
    console.log(`listening on port ${port}`);
  });
}


module.exports = serve;

/******************************** Routes *******************************/

function setupRoutes(app) {
  const base = app.locals.base;
  //@TODO add appropriate routes
  app.get(`${base}/search.html`, doSearch(app));
  app.get(`${base}/add.html`, AddDoc(app));
  app.post(`${base}/add`,upload.single('file'),createDoc(app));
  app.get(`${base}/:id`, getDoc(app)); //must be last
}

/*************************** Action Routines ***************************/

//@TODO add action routines for routes + any auxiliary functions..

function AddDoc(app) {
  return async function(req, res) {
    try {
    const model = { base: app.locals.base };
    const html = doMustache(app, 'add', model);
    res.send(html);
    }
    catch (err) {
          console.error(err);
	  var errors = wsErrors(err);
          var model = errorModel(app, {}, errors);
          const html = doMustache(app, 'add', model);
          res.send(html);
	}
  };
};
function doSearch(app) {
  return async function(req, res) {
    const isSubmit = req.query.submit !== undefined;
    var doclist = [];
    let errors = undefined;
    const search = getNonEmptyValues(req.query);
    let model, template;
    //console.log(search);
    if (isSubmit) {
      //console.log("Inside Submit");
      //errors = validate(search);
      //console.log(Object.keys(search).length);
      if (typeof search['q'] === 'undefined') {
	doclist.error = true;
	doclist.errormsg = "please specify one-or-more search terms";
        const msg = 'please specify one-or-more search terms';
	errors = Object.assign(errors || {}, { _: msg });
        model = {  base: app.locals.base,doclist};
      }
      if (!errors) {
	//const q = querystring.stringify(search);
        //console.log(search.q);
	try {
	  doclist = await app.locals.model.list(search.q);
          //console.log(doclist.results.length);
          doclist.value = search.q;
          if (doclist.results.length === 0) {
          //console.log("No Results Found");
          
          const msg = `no document containing "${doclist.value}" found; please retry`;
	  errors = Object.assign(errors || {}, { _: msg });
          model = errorModel(app, {}, errors);
          }
          //var AllLines = doclist.results[0].lines[0];
          //console.log(AllLines);
          //AllLines = AllLines.replace(doclist.value,"<span class='search-term'>"+doclist.value+"</span>");
          //console.log(AllLines);
          var words = search.q.split(" ");
          //console.log(words.length);
          var resultlength = doclist.results.length;
          for ( var i = 0;i < resultlength;i++)
          {
          var lineslength = doclist.results[i].lines.length;
          for (var j = 0;j <lineslength;j++)
          {
            var AllLines = doclist.results[i].lines[j];
            for (var t = 0 ; t < words.length ; t++)
            {
            var regex = new RegExp(words[t],"ig");
            var word = AllLines.match(regex);
            AllLines = AllLines.replace(word,`<span class="search-term">${word}</span>`);
            }
            doclist.results[i].lines[j] = AllLines;
          }
          }
          if(doclist.links.length === 3)
          {
           doclist.nextval = true;
           doclist.prevval = true;
           var nlink = doclist.links[1].href.split("?");
           doclist.nextlink = nlink[1].replace("%20","+");
           var plink = doclist.links[2].href.split("?");
           doclist.prevlink = plink[1].replace("%20","+");
          }
          if(doclist.links.length === 2)
          {
           if(doclist.links[1].rel == "next")
           {
           doclist.nextval = true;
           doclist.prevval = false;
           var nlink = doclist.links[1].href.split("?");
           doclist.nextlink = nlink[1].replace("%20","+");
           }
           if(doclist.links[1].rel == "prev")
           {
           doclist.nextval = false;
           doclist.prevval = true;
           var nlink = doclist.links[1].href.split("?");
           doclist.prevlink = nlink[1].replace("%20","+");
           }
          }
          //console.log(doclist.length);
	}
	catch (err) {
          console.error(err);
	  errors = wsErrors(err);
          model = errorModel(app, {}, errors);
	}
	
       }
    }
    if (!isSubmit && typeof req.query['start'] != 'undefined') {
      //console.log("Inside Submit");
      //errors = validate(search);
      if (Object.keys(search).length == 0) {
	const msg = 'at least one search parameter must be specified';
	errors = Object.assign(errors || {}, { _: msg });
      }
     // if (!errors) {
	//const q = querystring.stringify(search);
        //console.log(search.q);
	try {
	  doclist = await app.locals.model.listval(search.q,search.start,search.count);
          doclist.value = search.q;
          var words = search.q.split(" ");
          //console.log(words.length);
          var resultlength = doclist.results.length;
          for ( var i = 0;i < resultlength;i++)
          {
          var lineslength = doclist.results[i].lines.length;
          for (var j = 0;j <lineslength;j++)
          {
            var AllLines = doclist.results[i].lines[j];
            for (var t = 0 ; t < words.length ; t++)
            {
            var regex = new RegExp(words[t],"ig");
            var word = AllLines.match(regex);
            AllLines = AllLines.replace(word,`<span class="search-term">${word}</span>`);
            }
            doclist.results[i].lines[j] = AllLines;
          }
          } 
          //console.log(doclist.links.length);
          if(doclist.links.length === 3)
          {
           doclist.nextval = true;
           doclist.prevval = true;
           var nlink = doclist.links[1].href.split("?");
           //console.log(nlink[1]);
           doclist.nextlink = nlink[1].replace("%20","+");
           var plink = doclist.links[2].href.split("?");
           doclist.prevlink = plink[1].replace("%20","+");
          }
          if(doclist.links.length === 2)
          {
           if(doclist.links[1].rel == "next")
           {
           doclist.nextval = true;
           doclist.prevval = false;
           var nlink = doclist.links[1].href.split("?");
           doclist.nextlink = nlink[1].replace("%20","+");
           }
           if(doclist.links[1].rel == "previous")
           {
           doclist.nextval = false;
           doclist.prevval = true;
           var nlink = doclist.links[1].href.split("?");
           doclist.prevlink = nlink[1].replace("%20","+");
           }
          }
          //console.log(doclist.length);
	}
	catch (err) {
          console.error(err);
	  errors = wsErrors(err);
          model = errorModel(app, {}, errors);
	}
	
     // }
    }
    template = 'search';
    if (!errors) {
    
    model = {  base: app.locals.base, doclist: doclist };
    }
    
    //console.log(model);
    const html = doMustache(app, template, model);
    res.send(html);
  };
};

function getDoc(app) {
  return async function(req, res) {
    let model;
    const id = req.params.id;
    try {
      const doccontent = await app.locals.model.get(id);
      //console.log(doccontent);
      //console.log(id);
      doccontent.name = id;
       model = { base: app.locals.base, doccontent: doccontent };
    }
    catch (err) {
      console.error(err);
      const errors = wsErrors(err);
      model = errorModel(app, {}, errors);
    }
    const html = doMustache(app, 'doccontent', model);
    res.send(html);
  };
};

function createDoc(app) {
  return async function(req, res) {
     //console.log("Inside Create");
    //const isSubmit = req.query.submit !== undefined;
    
    //if (isSubmit) {
     let validation = undefined;
      try {
           //console.log(req.file);
          //console.log(req.file.originalname);
          //console.log(req.file.buffer.toString('utf8'));
           if (typeof req.file === 'undefined') {
           const msg = 'please select a file containing a document to upload';
	   validation = msg;
           var model = {  base: app.locals.base, validation: validation };
           const html = doMustache(app, 'add', model);
           res.send(html);
           }
           if (!validation) {
           var filename = req.file.originalname.split(".");
	   await app.locals.model.create(filename[0],req.file.buffer.toString('utf8'));
           res.redirect(`${app.locals.base}/${filename[0]}`);
           }
          //res.redirect(`${app.locals.base}/${user.id}.html`);
      }
      catch (err) {
	console.error(err);
	var errors = wsErrors(err);
        var model = errorModel(app, {}, errors);
          const html = doMustache(app, 'add', model);
          res.send(html);
      }
    //}
  };
};
/************************ General Utilities ****************************/

/** return object containing all non-empty values from object values */
function getNonEmptyValues(values) {
  const out = {};
  Object.keys(values).forEach(function(k) {
    const v = values[k];
    if (v && v.trim().length > 0) out[k] = v.trim();
  });
  return out;
}
function errorModel(app, values={}, errors={}) {
  return {
    base: app.locals.base,
    errors: errors._,
  };
}

/** Return a URL relative to req.originalUrl.  Returned URL path
 *  determined by path (which is absolute if starting with /). For
 *  example, specifying path as ../search.html will return a URL which
 *  is a sibling of the current document.  Object queryParams are
 *  encoded into the result's query-string and hash is set up as a
 *  fragment identifier for the result.
 */
function relativeUrl(req, path='', queryParams={}, hash='') {
  const url = new URL('http://dummy.com');
  url.protocol = req.protocol;
  url.hostname = req.hostname;
  url.port = req.socket.address().port;
  url.pathname = req.originalUrl.replace(/(\?.*)?$/, '');
  if (path.startsWith('/')) {
    url.pathname = path;
  }
  else if (path) {
    url.pathname += `/${path}`;
  }
  url.search = '';
  Object.entries(queryParams).forEach(([k, v]) => {
    url.searchParams.set(k, v);
  });
  url.hash = hash;
  return url.toString();
}

/************************** Template Utilities *************************/

function wsErrors(err) {
  const msg = (err.message) ? err.message : 'web service error';
  console.error(msg);
  return { _: [ msg ] };
}


/** Return result of mixing view-model view into template templateId
 *  in app templates.
 */
function doMustache(app, templateId, view) {
  const templates = { footer: app.templates.footer };
  return mustache.render(app.templates[templateId], view, templates);
}

/** Add contents all dir/*.ms files to app templates with each 
 *  template being keyed by the basename (sans extensions) of
 *  its file basename.
 */
function setupTemplates(app, dir) {
  app.templates = {};
  for (let fname of fs.readdirSync(dir)) {
    const m = fname.match(/^([\w\-]+)\.ms$/);
    if (!m) continue;
    try {
      app.templates[m[1]] =
	String(fs.readFileSync(`${TEMPLATES_DIR}/${fname}`));
    }
    catch (e) {
      console.error(`cannot read ${fname}: ${e}`);
      process.exit(1);
    }
  }
}

