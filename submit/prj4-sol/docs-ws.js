'use strict';

const axios = require('axios');


function DocsWs(baseUrl) {
  this.docsUrl = `${baseUrl}/docs`;
}

module.exports = DocsWs;

//@TODO add wrappers to call remote web services.
  
DocsWs.prototype.list = async function(q) {
  try {
    const url = this.docsUrl  + ((q === undefined) ? '' : `?q=${q}`);
    //console.log(url);
    const response = await axios.get(url);
    //console.log(response.data);
    return response.data;
  }
  catch (err) {
    console.error(err);
    throw (err.response && err.response.data) ? err.response.data : err;
  }
};

  
DocsWs.prototype.listval = async function(q,s,c) {
  try {
    const url = this.docsUrl  + ((q === undefined) ? '' : `?q=${q}&start=${s}&count=${c}`);
    //console.log(url);
    const response = await axios.get(url);
    //console.log(response.data);
    return response.data;
  }
  catch (err) {
    console.error(err);
    throw (err.response && err.response.data) ? err.response.data : err;
  }
};

DocsWs.prototype.get = async function(id) {
  try {
    const response = await axios.get(`${this.docsUrl}/${id}`);
    return response.data;
  }
  catch (err) {
    console.error(err);
    throw (err.response && err.response.data) ? err.response.data : err;
  }  
};


DocsWs.prototype.create = async function(docname,doccontent) {
  try {
    //console.log("Inside Axios");
    var docinfo = {"name" : docname,"content" : doccontent};
    const response = await axios.post(this.docsUrl, docinfo);
    //console.log(response.data);
    //console.log("Outside Axios");
    return response.data;
  }
  catch (err) {
    console.error(err);
    throw (err.response && err.response.data) ? err.response.data : err;
  }
};
