const T = require("terminal-table");

class Table {
  constructor(cols) {
    this.t = new T({
      width: cols,
      horizontalLine: true
    });
  }

  push (rows) {
    this.t.push(rows)
  }

  draw () {
    console.log("" + this.t);
  }

  center (row, col) {
    this.t.attr(row, col, {align: 'center'})

  }
}

module.exports = Table