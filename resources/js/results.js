import { BarChart, StackedBarChart } from './charts.js';
import { Table } from './table.js';

var questionsFetch = fetch('resources/data/questions.json')
  .then(res => res.json())

var responsesFetch = fetch('https://api.github.com/repos/simonarnell/GDPRDPIAT/contents/_data/dpia?ref=staticman')
  .then(res => res.json())
  .then(json => Promise.all(json.map(dpia => {
    return fetch(dpia.download_url)
      .then(res => res.json())
    })))

var questions = [], responses = [];
Promise.all([questionsFetch, responsesFetch]).then(vals => {
  vals[0].pages.map(page => page.questions.map(question => {
    questions.push(question)
    responses[question.name] = {
      ...(()=>{
        let choices = {}
        if(question.choices !== undefined) {
          choices = question.choices.reduce((acc, choice) => {
            acc[choice.value] = 0
            return acc
          }, {})
        } else if(question.type == 'matrix') {
          choices = question.rows.reduce((acc, row) => {
            acc[row.value] = question.columns.reduce((acc, column) => {
              acc[column.value] = 0
              return acc
            }, {})
            return acc
          }, {})
        }
        return choices
      })(),
      ...vals[1].map(response => {
        let formattedResponse = [];
        if(response[question.name] !== undefined) {
          if(question.type == 'checkbox') formattedResponse = response[question.name].split(',')
          else formattedResponse = [response[question.name]]
        } else if(question.type == 'matrix') formattedResponse = question.rows.map(row => response[question.name + String.fromCharCode(97 + (row.value - 1))])
        return formattedResponse
      }).reduce((acc, responses, idx) => {
        if(idx == 0 && question.type == 'matrix')
          acc = question.rows.reduce((acc, row) => {
            acc[row.value] = question.columns.reduce((acc, column) => {
              acc[column.value] = 0
              return acc
            }, {})
            return acc
          }, {})
        let countedResponse = responses.reduce((acc, response, idx) => {
          if(question.type == 'matrix') {
            if(response == undefined) return acc
            if(!acc[idx+1]) acc[idx+1] = {};
            acc[idx+1][response] = !!acc[idx+1][response] ? acc[idx+1][response] + 1 : 1
          } else acc[response] = !!acc[response] ? acc[response] + 1 : 1
          return acc
        }, {})
        Object.keys(countedResponse).forEach(item => {
          if(question.type == 'matrix') {
            if(!acc[item]) acc[item] = {}
            Object.keys(countedResponse[item]).forEach(response => acc[item][response] = !!acc[item] ? acc[item][response] + countedResponse[item][response] : 1)
          } else acc[item] = !!acc[item] ? acc[item] + countedResponse[item] : 1
        })
        return acc
      }, {})
    }
  }))
  questions.map(({choices, columns, name, rows, title, type}) => {
    let config = {
      height: 540,
      width: 1920,
      margin: {
        top: 10,
        left: 20,
        right: 10,
        bottom: 10
      },
      padding: {
        inner: 0.03,
        outer: 0.03
      },
      legend: {
        width: 240,
        height: 50
      }
    }
    let responseSet = {}
    if(type == 'matrix') {
      responseSet.choices = rows.map(row => {
        return {
          question: row.text,
          ...columns.reduce((acc, column) => {
            acc[column.text] = responses[name][row.value][column.value]
            return acc
          }, {})
        }
      })
    } else if (choices !== undefined) {
      responseSet.choices = choices.map(choice => {
        return { [choice.text]: responses[name][choice.value] }
      })
    } else return
    let section = document.createElement('section')
    section.id = name
    document.getElementById('results').appendChild(section)
    new Table({ name, title })
    if(type == 'matrix') new StackedBarChart(config, { name, type, responseSet })
    else new BarChart(config, { name, type, responseSet })
  })
})
