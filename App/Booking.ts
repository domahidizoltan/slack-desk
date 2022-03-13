namespace AppConfig {

  export class Booking {

    static getForPerson(personName: string, startDate: Date, endDate?: Date, limit?: number): Map<Date, string> {
      this.validateDates(startDate, endDate)

      let bookedBySamePerson = (range: RangeAlias) => range.getValue().toString() == personName
      return AppConfig.Sheet.doForRows(startDate, endDate || startDate, bookedBySamePerson, limit)
    }

    static getForTable(table: string, startDate: Date, endDate?: Date, limit?: number): Map<Date, string> {
      this.validateDates(startDate, endDate)

      let isBooked = (range: RangeAlias) => !!range.getValue().toString()
      return AppConfig.Sheet.doForRows(startDate, endDate || startDate, isBooked, limit, Number(table))
    }

    static getFreeTables(startDate: Date, endDate?: Date): Map<Date, string> {
      let endDt = endDate || startDate
      this.validateDates(startDate, endDt)

      let results = new Map<Date, string>()
      let resultsDateStr: string[] = []
      let getFreeTables = (range: RangeAlias) => {
        let date = AppConfig.Sheet.getDateForCell(range)
        if (resultsDateStr.indexOf(date.toDateString()) == -1) {
          let isBooked = !!range.getValue().toString()
          if (!isBooked) {
            let table = AppConfig.Sheet.getColumnHeaderForCell(range)
            results.set(date, table)
            resultsDateStr.push(date.toDateString())
          }
        }
        return true
      }

      let totalTables = Number(config.get(TOTAL_TABLES))
      let table = 1
      let days = AppConfig.Calendar.getDays(startDate, endDt)
      while (resultsDateStr.length < days && table < totalTables) {
        AppConfig.Sheet.doForRows(new Date(startDate), endDt, getFreeTables, null, table++)
      }

      return new Map([...results].sort((a, b) => a[0].getTime() - b[0].getTime() ))
    }

    static deleteForPerson(personName: string, startDate: Date, endDate?: Date) {
      this.validateDates(startDate, endDate)

      let deleteWithSameName = (range: RangeAlias) => {
        let condition = range.getValue().toString() == personName
        if (condition) {
          range.setValue(null)
        }
        return condition
      }
      return AppConfig.Sheet.doForRows(startDate, endDate || startDate, deleteWithSameName)
    }
    
    static bookTable(personName: string, table: string, startDate: Date, endDate?: Date): Map<Date, string> {
      this.deleteForPerson(personName, new Date(startDate), endDate)

      let results = new Map<Date, string>()
      let bookTable = (range: RangeAlias) => {
        let isNotBooked = !!!range.getValue().toString()
        if (isNotBooked) {
          range.setValue(personName)
          let bookedTable = AppConfig.Sheet.getColumnHeaderForCell(range)
          let date = AppConfig.Sheet.getDateForCell(range)
          results.set(date, bookedTable)
        }
        return isNotBooked
      }

      if (table === "?") {
        this.getFreeTables(startDate, endDate || startDate).forEach(
          (tbl, dt) => {
            AppConfig.Sheet.doForRows(new Date(dt), new Date(dt), bookTable, null, Number(tbl))
          }
        )
      } else {
        AppConfig.Sheet.doForRows(startDate, endDate || startDate, bookTable, null, Number(table))
      }

      return results
    }

    private static validateDates(startDate: Date, endDate?: Date) {
      if (startDate < new Date() || (endDate && startDate >= endDate)) {
        new Error("Invalid date range!")
      }
    }

  }
}



function testBooking() {  
  // let getRes = App.Booking.getForPerson("ricsi", new Date(2022, 2, 29), new Date(2022, 3, 5), 2)
  // getRes.forEach((v, k) => {console.log(`${k.toDateString()} => ${v}`)})

  // let getTRes = App.Booking.getForTable("10", new Date(2022, 2, 29), new Date(2022, 3, 5), 2)
  // getTRes.forEach((v, k) => {console.log(`${k.toDateString()} => ${v}`)})


  // let delRes = App.Booking.deleteForPerson("ricsi", new Date(2022, 2, 23), new Date(2022, 2, 29))
  // delRes.forEach((v, k) => {console.log(`${k.toDateString()} => ${v}`)})

  
   let addRes = AppConfig.Booking.bookTable("test", "?", new Date(2022, 2, 30), new Date(2022, 3, 5))
   addRes.forEach((v, k) => {console.log(`${k.toDateString()} => ${v}`)})

  // let getFRes = App.Booking.getFreeTables(new Date(2022, 2, 30), new Date(2022, 3, 5))
  // getFRes.forEach((v, k) => {console.log(`${k.toDateString()} => ${v}`)})

}