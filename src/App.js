import React, { Component } from 'react';
import XLSX from 'xlsx';
import styled from 'styled-components';
import './App.css';

/* const make_cols = refstr => Array.from({ length: XLSX.utils.decode_range(refstr).e.c + 1 }, (x, i) => XLSX.utils.encode_col(i));
const make_width = refstr => Array.from({ length: XLSX.utils.decode_range(refstr).e.c + 1 }, () => 60);

 */




class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [], /* Array of Arrays e.g. [["a","b"],[1,2]] */
      cols: []  /* Array of column objects e.g. { name: "C", K: 2 } */
    };
    this.handleFile = this.handleFile.bind(this);
    this.exportFile = this.exportFile.bind(this);
    this.scanIG = this.scanIG.bind(this);
    this.resetView = this.resetView.bind(this);
  };
  handleFile(file/*:File*/) {
    /* Boilerplate to set up FileReader */
    const reader = new FileReader();
    const rABS = !!reader.readAsBinaryString;
    reader.onload = (e) => {
      /* Parse data */
      const bstr = e.target.result;
      const wb = XLSX.read(bstr, { type: rABS ? 'binary' : 'array' });
      /* Get first worksheet */
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      /* Convert array of arrays */
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      /* Update state */
      this.setState({ data: data, cols: make_cols(ws['!ref']) });
    };
    if (rABS) reader.readAsBinaryString(file); else reader.readAsArrayBuffer(file);
  };
  scanIG() {
    const IG = this.state.data.filter(item => {
      return (item[7] == "IG" || item[7] == "Saknas") // IG || Saknas

    })
    this.setState({
      oldData: this.state.data, data: IG
    });
  }
  resetView() {
    this.setState({ data: this.state.oldData, oldData: null })
  }

  exportFile() {
    /* convert state to workbook */
    const ws = XLSX.utils.aoa_to_sheet(this.state.data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SheetJS");
    /* generate XLSX file and send to client */
    XLSX.writeFile(wb, "sheetjs.xlsx")
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <strong>IGMeister</strong> <p>v0.1 (c) 2019 Kristian Kjeldsen</p>
          {this.state.data.length ? <div>
            <button className="btn btn-success" onClick={this.scanIG}>IG/Saknas</button>
            <button className="btn btn-success" onClick={this.resetView}>Reset</button> </div> : null}

        </header>
        <StyledDragDropFile handleFile={this.handleFile}>
          <div className="row"><div className="col-xs-12">
            <DataInput handleFile={this.handleFile} />
          </div></div>
          <div className="row"><div className="col-xs-12">
            <button disabled={!this.state.data.length} className="btn btn-success" onClick={this.exportFile}>Export</button>
          </div></div>
          <div className="row"><div className="col-xs-12">
            <OutTable data={this.state.data} cols={this.state.cols} />
          </div></div>
        </StyledDragDropFile>
      </div>
    );
  }
}
class DragDropFile extends React.Component {
  constructor(props) {
    super(props);
    this.onDrop = this.onDrop.bind(this);
  };
  suppress(evt) { evt.stopPropagation(); evt.preventDefault(); };
  onDrop(evt) {
    evt.stopPropagation(); evt.preventDefault();
    const files = evt.dataTransfer.files;
    if (files && files[0]) this.props.handleFile(files[0]);
  };
  render() {
    return (
      <div onDrop={this.onDrop} onDragEnter={this.suppress} onDragOver={this.suppress}>
        {this.props.children}
      </div>
    );
  };
};
const StyledDragDropFile = styled(DragDropFile)`
background-color: #282c34;
color: white;
font-size: calc(10px + 2vmin);
`
/*
  Simple HTML5 file input wrapper
  usage: <DataInput handleFile={callback} />
    handleFile(file:File):void;
*/
class DataInput extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  };
  handleChange(e) {
    const files = e.target.files;
    if (files && files[0]) this.props.handleFile(files[0]);
  };
  render() {
    return (
      <form className="form-inline">
        <div className="form-group">
          <label htmlFor="file">Export from Schoolsoft</label>
          <input type="file" className="form-control" id="file" accept={SheetJSFT} onChange={this.handleChange} />
        </div>
      </form>
    );
  };
}

/*
  Simple HTML Table
  usage: <OutTable data={data} cols={cols} />
    data:Array<Array<any> >;
    cols:Array<{name:string, key:number|string}>;
*/
class OutTable extends React.Component {
  constructor(props) { super(props); };
  render() {
    return (
      <div className="table-responsive">
        <table className="table table-striped variable-rows">
          <thead>
            <tr>{this.props.cols.map((c) => <th key={c.key}>{c.name}</th>)}</tr>
          </thead>
          <tbody>
            {this.props.data.map((r, i) => <tr key={i}>
              {this.props.cols.map(c => <td key={c.key}>{r[c.key]}</td>)}
            </tr>)}
          </tbody>
        </table>
      </div>
    );
  };
};

/* list of supported file types */
const SheetJSFT = [
  "xlsx", "xlsb", "xlsm", "xls", "xml", "csv", "txt", "ods", "fods", "uos", "sylk", "dif", "dbf", "prn", "qpw", "123", "wb*", "wq*", "html", "htm"
].map(function (x) { return "." + x; }).join(",");

/* generate an array of column objects */
const make_cols = refstr => {
  let o = [], C = XLSX.utils.decode_range(refstr).e.c + 1;
  for (var i = 0; i < C; ++i) o[i] = { name: XLSX.utils.encode_col(i), key: i }
  return o;
};
export default App;
