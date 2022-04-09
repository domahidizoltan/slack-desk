function doGet(event: GoogleAppsScript.Events.DoGet): GoogleAppsScript.Content.TextOutput {
  return Slack.Handler.get(event)
}

function doPost(event: GoogleAppsScript.Events.DoPost): GoogleAppsScript.Content.TextOutput {
  return Slack.Handler.post(event)
}

namespace Slack {

  export class Handler {
    static get(event: GoogleAppsScript.Events.DoGet): GoogleAppsScript.Content.TextOutput {
      let res = this.authorize(event)
      if (res) return res
  
      console.info("get %s", JSON.stringify(event))
    }

    static post(event: GoogleAppsScript.Events.DoPost): GoogleAppsScript.Content.TextOutput {
      this.log("post", JSON.stringify(event))
      let res = this.authorize(event)
      if (res) return res

      let userName = event.parameter["user_name"]
      let todayDate = new Date()
      let nextWeekDate = new Date(todayDate.setDate(todayDate.getDate() + 7 + (7-todayDate.getDay())))
      this.log("start", this.formatDate(todayDate))
      this.log("next", this.formatDate(nextWeekDate))
      let bookings = App.Booking.getForPerson(userName, todayDate, nextWeekDate, 2)

//catch error

      let todayDesk = " "
      let nextDesk = " "
      let nextDate = new Date()
      if (bookings.has(todayDate)) {
        todayDesk = `Desk *${bookings.get(todayDate)}*`
      }

      return Slack.Response.upcomingBookings({
        todayDate: this.formatDate(todayDate),
        todayBookedDesk: todayDesk, 
        nextDate: this.formatDate(nextDate), 
        nextBookedDesk: nextDesk,
      })
    }

    private static authorize(event: GoogleAppsScript.Events.AppsScriptHttpRequestEvent): GoogleAppsScript.Content.TextOutput {
      let token = event.parameter["token"]
      if (!token || token != slackToken) {
        this.log("invalid token", token)
        return Slack.Response.error("Unauthorized")
      }
    }

    private static log = (msgType: string, msg: string) => App.Sheet.log(msgType, msg)

    private static formatDate = (date: Date): string => {
      return `${this.pad(date.getDay())}/${this.pad(date.getMonth()+1)}/${date.getFullYear()}`
    }

    private static pad = (n: number): string => n.toString().padStart(2, "0")
  }
}
