//-*- mode: rjsx-mode;

'use strict';

const React = require('react');

class Content extends React.Component {

  /** called with properties:
   *  app: An instance of the overall app.  Note that props.app.ws
   *       will return an instance of the web services wrapper and
   *       props.app.setContentName(name) will set name of document
   *       in content tab to name and switch to content tab.
   *  name:Name of document to be displayed.
   */
  constructor(props) {
    super(props);
	this.state = {fname:''}
	this.state = {fcontent:''}
	this.name = this.props.name;
    //@TODO
	//this.ContentView = this.ContentView.bind(this);
  }

/**async ContentView()
{
var kq = await this.props.app.ws.getContent(this.state.fname);
console.log(kq);
}*/

async componentDidMount()
{
//await this.ContentView();
console.log('did mount')
var kq = await this.props.app.ws.getContent(this.props.name);
//this.setState({iterator: 0})
this.setState({fcontent: kq.content});
this.setState({fname:kq.name});
//console.log(this.props.name);
//console.log(kq);
}

async componentDidUpdate(prevState)
{
console.log('did update')
//await this.ContentView();
if(this.props.name != prevState.name)
{
var kq = await this.props.app.ws.getContent(this.props.name);
//this.setState({iterator: 0})
this.setState({fcontent: kq.content});
this.setState({fname:kq.name});
console.log(this.props.name);
console.log(kq);
}
}




  //@TODO

  render() {
    //@TODO
return (
<div>
	<section>
		<h1>{this.state.fname}</h1>
		<pre>{this.state.fcontent}</pre>
	</section>
</div>
    );
  }

}

module.exports = Content;
