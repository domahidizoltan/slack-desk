type RangeAlias = GoogleAppsScript.Spreadsheet.Range
type RangeAction = (range: RangeAlias) => boolean

namespace App {

  export class Sheet {

    static createMonthlySheet(date: Date): void {
      let sheetName = this.getSheetName(date)
      if (ss.getSheetByName(sheetName)) {
        throw new Error(`Sheet not found: ${sheetName}`);
      }
    
      this.cloneTemplate(date)    
    }
    
    static deleteMonthlySheet(date: Date): void {
      let sheetName = this.getSheetName(date)
      let sheet = ss.getSheetByName(sheetName)
      if (sheet) {
        ss.deleteSheet(sheet)
      }
    }

    static doForRows(startDate: Date, endDate: Date, action: RangeAction, limit?: number, column?: number): Map<Date, string> {
      let results = new Map<Date, string>()
      let nonWorkingDays = App.Calendar.getNonWorkingDays(startDate, endDate).map(d => d.toDateString())
      let columns = Number(config.get(TOTAL_TABLES)) + 1
      let sheetName = this.getSheetName(startDate)
      let sheet = ss.getSheetByName(sheetName)

      let day = startDate
      day.setDate(day.getDate() - 1)
      while(day < endDate) {
        if (limit && results.size >= limit) {
          break
        }

        day.setDate(day.getDate() + 1)

        if (nonWorkingDays.indexOf(day.toDateString()) > -1) {
          continue
        }

        let name = this.getSheetName(day)
        if (sheetName != name) {
          sheet = ss.getSheetByName(name)
          if (sheet == null) {
            continue
          }
          sheetName = name
        }

        let row = day.getDate() + 1
        let range: RangeAlias
        if (column) {
          range = sheet.getRange(row, column + 1)
        } else {
          range = sheet.getRange(row, 2, 1, columns)
        }

        range.getValues()[0].forEach((value, idx) => {
          if (column) {
            idx = column + 1
          } else {
            idx = idx + 2
          }

          let range = sheet.getRange(row, idx)
          if (action(range)) {
            let result: string
            if (column) {
              result = range.getValue().toString()
            } else {
              result = sheet.getRange(1, idx).getValue().toString()
            }
            results.set(new Date(day), result)
          }
        })
      }

      return results
    }

    static getDateForCell(range: RangeAlias): Date {
      let day = Number(range.getRow()) - 1
      let name = range.getSheet().getName().split("-")
      let date = new Date(`${name[1]}/${day}/20${name[0]}`)
      return date
    }

    static getColumnHeaderForCell(range: RangeAlias): string {
      let col = range.getColumn()
      let columnHeader = range.getSheet().getRange(1, col).getValue().toString()
      return columnHeader
    }

    static log(msgType: string, msg: string) {
      if (config.get(LOG_SLACK_POST).toLowerCase() == "true") {
        let logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("log")
        logSheet.insertRowBefore(1)
    
        let now = new Date()
        logSheet.getRange(1, 1).setValue(`${now.toLocaleTimeString()} ${now.toLocaleDateString()}`)
        logSheet.getRange(1, 2).setValue(msgType)
        logSheet.getRange(1, 3).setValue(msg)
      }
    }
    
    private static getSheetName(date: Date): string {
      let year = date.getFullYear().toString().substring(2)
      let month = (date.getMonth()+1).toString().padStart(2, "0")
      return year + "-" + month
    }

    private static cloneTemplate(date: Date): void {
      let sheetName = this.getSheetName(date)

      let newIndex = this.getNewSheetIndex(sheetName)
      let newSheet = ss.insertSheet(sheetName, newIndex)
      newSheet.activate()

      let columns = Number(config.get(TOTAL_TABLES)) + 1
      let rows = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate() + 1
      let templateCells = template.getRange(1, 1, rows, columns)
      templateCells.copyValuesToRange(newSheet, 1, columns, 1, 32)
      templateCells.copyFormatToRange(newSheet, 1, columns, 1, 32)

      this.formatNonWorkingDayRows(date, newSheet)
    }

    private static getNewSheetIndex(sheetName: string): number {
      let newIndex: number = 0
      let sheets = ss.getSheets()
      for (let idx = 0; idx < sheets.length; idx++) {
        if (sheetName < sheets[idx].getName()) {
          newIndex = idx
          break
        }
      }

      return newIndex
    }

    private static formatNonWorkingDayRows(date: Date, sheet: GoogleAppsScript.Spreadsheet.Sheet): void {
      let monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      let monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)
      let rows = monthEnd.getDate() + 1
      let columns = Number(config.get(TOTAL_TABLES)) + 1

      let nonWorkingDays = App.Calendar.getNonWorkingDays(monthStart, monthEnd).map(d => d.toDateString())
      let nonWorkingDayCell = template.getRange(config.get(NON_WORKING_DAY_BG_CELL))
      for (let idx = 1; idx < rows; idx++) {
        let day = new Date(date.getFullYear(), date.getMonth(), idx).toDateString()
        if (nonWorkingDays.indexOf(day) > -1) {
          let row = idx + 1
          nonWorkingDayCell.copyFormatToRange(sheet, 2, columns, row, row)
          let range = sheet.getRange(row, 2, 1, columns)
          sheet.setActiveRange(range).setValue(null)
        }
      }
    }

  }
}


function testSheet() {
  App.Sheet.deleteMonthlySheet(new Date(2022, 1))
  App.Sheet.deleteMonthlySheet(new Date(2022, 2))
  App.Sheet.deleteMonthlySheet(new Date(2022, 3))
  App.Sheet.deleteMonthlySheet(new Date(2022, 4))

  App.Sheet.createMonthlySheet(new Date(2022, 4))
  App.Sheet.createMonthlySheet(new Date(2022, 1))
  App.Sheet.createMonthlySheet(new Date(2022, 3))
  App.Sheet.createMonthlySheet(new Date(2022, 2))
}