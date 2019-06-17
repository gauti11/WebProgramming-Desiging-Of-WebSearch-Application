<!DOCTYPE html>
<html>
  <head>
    <title>Documents Collection Search</title>
    <link rel="stylesheet" href="{{{base}}}/css/style.css">
  </head>
  <body>
    <h1>Documents Collection Search</h1>
    <ul>
      {{#errors}}
        <li class="error">{{.}}</li>
      {{/errors}}
    </ul>
    <form method="GET" action="{{{base}}}/search.html">
       <p>
	 Please fill in one or more search terms in the field below:
        </p>
	<label>
        <span class="label">Search Terms:</span>
        <input id="query" name="q" value="{{doclist.value}}">
	</label>
	<br/>
        {{#doclist.error}}
        <span class="error">{{{doclist.errormsg}}}</span><br/>
        </label>
        {{/doclist.error}}
      <input id="submit" name="submit" type="submit" value="Search" class="control">
    </form> 
    {{#doclist}}
    <h2>Search Results</h2>
    <p class="error">{{msg}}</p>
    {{#doclist.results}}
     <p class="result">
      <a href="{{{base}}}/{{name}}">{{name}}</a><br>
      {{#lines}} 
      {{{.}}} <br>
      {{/lines}}
    </p>
    {{/doclist.results}}
    {{#doclist.prevval}}
     <a href="{{{base}}}/search.html?{{{doclist.prevlink}}}">Previous</a>
    {{/doclist.prevval}}
    {{#doclist.nextval}}
     <a href="{{{base}}}/search.html?{{{doclist.nextlink}}}">Next</a>
    {{/doclist.nextval}}
    {{/doclist}}
    {{>footer}}
  </body>
</html>
