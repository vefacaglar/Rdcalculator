import './App.css';
import moment from 'moment';
import _ from 'lodash';
import React, { useState } from 'react';

function App() {
  const [hours, setHours] = useState(0);
  const [sessions, setSessions] = useState([]);

  let tableHead;
  if (sessions.length) {
    tableHead = <tr>
      <th>Name</th>
      <th>Input</th>
      <th>Output</th>
      <th>Spent Minutes</th>
    </tr>
  }

  return (
    <div className="App">
      <div>
        <input type="file" onChange={(e) => readFile(e, setHours, setSessions)} />
      </div>
      <div>
        <label>Spent hours: {hours}</label>
      </div>
      <table>
        {tableHead}
        {sessions.map(x => <tr>
          <td>{x.name}</td>
          <td>{x.input}</td>
          <td>{x.output}</td>
          <td>{x.spentMinutes}</td>
        </tr>)}
      </table>
    </div>
  );
}

const readFile = (e, setHours, setSessions) => {
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
