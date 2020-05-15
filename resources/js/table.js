export class Table {
  constructor(data) {
    this.data = data;
    let table = document.createElement('table')
    let tr = document.createElement('tr')
    let td = document.createElement('td')
    let h3 = document.createElement('h3')
    let match = this.data.name.match(/(question)(([0-9])+[a-zA-Z]*)/)
    h3.textContent = `${match[1].slice(0,1).toUpperCase()}${match[1].slice(1, match[1].length)} ${match[2]}`
    td.appendChild(h3)
    tr.appendChild(td)
    table.appendChild(tr)
    tr = document.createElement('tr')
    td = document.createElement('td')
    let h4 = document.createElement('h4')
    h4.textContent = this.data.title
    td.appendChild(h4)
    tr.appendChild(td)
    table.appendChild(tr)
    document.getElementById(this.data.name).appendChild(table)
  }
}
