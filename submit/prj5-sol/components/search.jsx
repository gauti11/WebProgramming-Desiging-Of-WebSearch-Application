//-*- mode: rjsx-mode;

'use strict';

const React = require('react');

class Search extends React.Component {


  /** called with properties:
   *  app: An instance of the overall app.  Note that props.app.ws
   *       will return an instance of the web services wrapper and
   *       props.app.setContentName(name) will set name of document
   *       in content tab to name and switch to content tab.
   */
  constructor(props) {
    super(props);
    this.state = {term:''}
    this.state = {finalVal: ''}
    this.state = {iterator: 0};
this.state = {err: ''};
    
    this.onInputChange=this.onInputChange.bind(this);
    this.onSubmitVal = this.onSubmitVal.bind(this);
 this.onClickVal = this.onClickVal.bind(this);
    //@TODO
  }

onInputChange(term){
this.setState({value: term.target.value});
//console.log(term.target.value);
}

onClickVal(e){
e.preventDefault();
this.props.app.setContentName(e.target.innerHTML)
//<a class="result-name" href={this.props.app.setContentName(name)}>{this.props.app.setContentName(name)}</a>
//console.log(e.target.innerHTML);
console.log("INOnclick");
}


async onSubmitVal(term){
term.preventDefault();
this.setState({iterator: 0})
this.setState({finalVal: ''});
var ks = await this.props.app.ws.searchDocs(this.state.value,0)
//console.log(ks);

let error = ''
if(ks.totalCount == 0)
{
  error = 'No results for '+ this.state.value;
}
this.setState({err: error});
this.setState({finalVal: ks.results});
this.setState({iterator: ks.totalCount})
//console.log("ONSUBMIT: ",this.state.iterator);
//console.log("ONSUBMIT: ",ks.totalCount);
}

//href={this.state.finalVal[i].name}

finalResult()
{
var arr = [];
//console.log("in final result: ",this.state.iterator);
	for(var i = 0; i < this.state.iterator; i++)
		{	
			if(i<5){
			console.log("hello world");
			//console.log(this.state.finalVal[i].name);
			arr.push(<div class="result">
					<a class="result-name" onClick = {this.onClickVal}>{this.state.finalVal[i].name}</a>
					
					<p>{this.state.finalVal[i].lines}</p>
					</div>
				)
			
			//console.log(arr);
		}
else
{
	//console.log("GReater than 5", arr);
	return arr;
}

}


//console.log(arr);
return arr;
}

//{this.getHighlightedText(this.state.finalVal[i].lines, this.onInputChange)}

/** getHighlightedText(text, higlight) {
console.log("In HIGHLIGHTED TEXT: ", higlight);
    // Split on higlight term and include term into parts, ignore case
    let parts = text.split(new RegExp(`(${higlight})`, 'gi'));
    return <span> { parts.map((part, i) => 
        <span key={i} style={part.toLowerCase() === higlight.toLowerCase() ? { fontWeight: 'bold' } : {} }>
            { part }
        </span>)
    } </span>;
}*/


  render() {
    //@TODO
return (
<div class="tab-content">
	<form onSubmit={this.onSubmitVal}>
		<label>
			<span class="label">Search Terms:</span>
			<span class = "control"></span>
		<input type ="text" value={this.state.value} onChange={this.onInputChange}/>
		
		<br/>
		</label>
	</form>
<div>
{this.finalResult()}
</div>
<span class="error">{this.state.err}</span>
</div>
    );
  }

}

module.exports = Search;
