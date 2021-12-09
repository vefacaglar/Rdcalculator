import './App.css';
import moment from 'moment';
import _ from 'lodash';
import React, { useState } from 'react';

function App() {
  const [hours, setHours] = useState(0);
  const [sessions, setSessions] = useState([]);

  let tableHead;
  if (sessions.length) {
    tableHead = <thead><tr>
      <th>Name</th>
      <th>Input</th>
      <th>Output</th>
      <th>Minutes</th>
      <th>Hours</th>
    </tr></thead>
  }

  let spentHourClass = ""
  if(hours >= 64){
    spentHourClass = "text-success"
  }else if(hours > 0 && hours < 64){
    spentHourClass = "text-danger"
  }

  return (
    <div className="App">
      <div className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container">
          <label className="navbar-brand">Research&Development Input Output Calculator</label>
        </div>
      </div>
      <div className="container">
        <div>
          <input className="form-control" type="file" onChange={(e) => readFile(e, setHours, setSessions)} />
        </div>
        <div>
          <label style={{
            fontSize: '25px',
            fontWeight: '700'
          }} className={spentHourClass} >Spent hours: {hours}</label>
        </div>
        <table className="table table-hover">
          {tableHead}
          <tbody>
            {sessions.map(x => <tr>
              <td>{x.name}</td>
              <td>{moment(x.input).format('lll')}</td>
              <td>{moment(x.output).format('lll')}</td>
              <td>{x.spentMinutes}</td>
              <td>{(x.spentMinutes / 60).toFixed(2)}</td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const readFile = (e, setHours, setSessions) => {
  if(e.target.files.length <= 0){
    return;
  }
  const file = e.target.files[0]
  console.log(file)
  const fileReader = new FileReader();
  fileReader.onload = (event) => {
    const csv = fileReader.result
    const convertedCsv = csvToJson(csv)
    const jsonResult = convertedCsv.map(item => {
      return item
    })
    const result = jsonResult.map((item, index) => {
      return {
        index: index,
        name: `${item.FirstName} ${item.LastName}`,
        move: item.Move,
        date: moment(item.Date).format(),
      }
    })

    const sessions = calculateSessions(result)
    console.log(sessions)
    setHours(sessions.totalHours)
    setSessions(sessions.sessions)
  }
  fileReader.readAsText(file)
}

const csvToJson = (file) => {
  var lines = file.split("\n");

  var result = [];

  var headers = lines[0].split(",");

  for (var i = 1; i < lines.length; i++) {
    var obj = {};
    var currentline = lines[i].split(",");
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j].replace(/^\s+|\s+$/gm, '')] = currentline[j].replace(/^\s+|\s+$/gm, '');
    }
    result.push(obj);
  }

  //return result; //JavaScript object
  return result //JSON
}

const calculateSessions = (dates) => {
  let sessions = [];
  Array.from(dates).forEach(item => {
    if (item.index % 2 === 0) {
      sessions.push({
        index: item.index,
        name: item.name,
        input: item.date,
      })
    } else {
      sessions.filter(x => x.index === item.index - 1)[0].output = item.date
    }
  })

  sessions.forEach(item => {
    item.spentMinutes = Math.floor((new Date(item.output).getTime() - new Date(item.input).getTime()) / 60000)
  })

  return {
    sessions,
    totalHours: ((_.sum(sessions.map(t => t.spentMinutes))) / 60).toFixed(2)
  };
}

export default App;
