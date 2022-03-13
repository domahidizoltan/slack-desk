namespace AppConfig {
  let calendar: GoogleAppsScript.Calendar.Calendar

  export class Calendar {

    private static getCalendar(): GoogleAppsScript.Calendar.Calendar {
      if (!calendar) {
        calendar = CalendarApp.getCalendarsByName(config.get(HOLIDAYS_CALENDAR))[0]
      } 
      return calendar
    }

    static getNonWorkingDays(startDate: Date, endDate: Date): Date[] {
      let specialDays = new Map<string, string>()
      this.getCalendar().getEvents(startDate, endDate)
        .map(e => {
          if (e.isAllDayEvent()) {
            specialDays.set(e.getAllDayStartDate().toDateString(), e.getTitle())
          }
        })
    
      let days: Date[] = []
      let day = new Date(startDate)
      while(day <= endDate) {
        let sd = specialDays.get(day.toDateString())
        let isDayOff = day.getDay() === 6 || day.getDay() === 0
        if (sd) {
          isDayOff = !sd.includes(config.get(EXTRA_WORKDAY_TITLE))
        }
    
        if (isDayOff) {
          days.push(new Date(day))
        }
    
        day.setDate(day.getDate() + 1)
      }
      return days
    }
    
    static getDays(startDate: Date, endDate: Date): number{
      let millis = Math.abs(endDate.getTime() - startDate.getTime())
      let days = Math.ceil(millis / (1000 * 60 * 60 * 24)) + 1
      return days - this.getNonWorkingDays(startDate, endDate).length
    }
  }
  
}

function testCalendar() {
  let days = AppConfig.Calendar.getNonWorkingDays(new Date(2022, 02, 7), new Date(2022, 02, 27))
  console.log(days)
}
