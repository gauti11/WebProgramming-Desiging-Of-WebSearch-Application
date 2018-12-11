//-*- mode: rjsx-mode;

'use strict';

const React = require('react');

class Add extends React.Component {

  /** called with properties:
   *  app: An instance of the overall app.  Note that props.app.ws
   *       will return an instance of the web services wrapper and
   *       props.app.setContentName(name) will set name of document
   *       in content tab to name and switch to content tab.
   */
  constructor(props) {
    super(props);
	this.state = {valuedata:''}
	this.state = {fvalue:''};

this.onFileHandle = this.onFileHandle.bind(this);
    //@TODO
  }


async onFileHandle(fileEvent)
{
	let file = fileEvent.target.files[0];
	//console.log(file);
	let fread = await readFile(file);
	let fname = file.name;
	fname = fname.replace(/\.[^/.]+$/,"");
	//console.log(fname);
	//console.log(fread);

await this.props.app.ws.addContent(fname, fread);
this.props.app.setContentName(fname);
}
  //@TODO add code

  //Note that a you can get information on the file being uploaded by
  //hooking the change event on <input type="file">.  It will have
  //event.target.files[0] set to an object containing information
  //corresponding to the uploaded file.  You can get the contents
  //of the file by calling the provided readFile() function passing
  //this object as the argument.


 render() {
    //@TODO
return (
<div>
	<form>
		<label>
			<span class="label">File upload</span>
			<span class = "control"></span>
		<input type = "file" onChange={this.onFileHandle} />
	</label>
		<br/>
		
	</form>
<div>
</div>
<span class="error"></span>
</div>
    );
  }

}

module.exports = Add;

/** Return contents of file (of type File) read from user's computer.
 *  The file argument is a file object corresponding to a <input
 *  type="file"/>
 */
async function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>  resolve(reader.result);
    reader.readAsText(file);
  });
}
