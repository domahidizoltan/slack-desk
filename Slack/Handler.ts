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
      Slack.Helper.log("post", JSON.stringify(event))
      let res = this.authorize(event)
      if (res) return res

      try {
        return this.handleRequest(event)
      } catch(e) {
        return Slack.Response.error(e.message)
      }
    }

    private static authorize(event: GoogleAppsScript.Events.AppsScriptHttpRequestEvent): GoogleAppsScript.Content.TextOutput {
      let token = event.parameter["token"]
      if (!token) {
        let payload = event.parameter["payload"]
        if (!!payload) {
          token = JSON.parse(payload)?.["token"]
        }
      }

      if (token != slackToken) {
        Slack.Helper.log("invalid token", token)
        return Slack.Response.error("Unauthorized")
      }
    }

    private static handleRequest(event: GoogleAppsScript.Events.DoPost): GoogleAppsScript.Content.TextOutput {
      let userName = event.parameter["user_name"]
      let payload = event.parameter["payload"]
      if (!!payload) {
        let parsedPayload = JSON.parse(payload)
        let actions = parsedPayload.actions as Array<any>
        let actionId = actions?.[0]?.action_id as string
        switch(actionId) {
          case "delete_bookings": {
            Slack.Helper.log("payload", payload)
            let todayDate = new Date()
            // let nextWeekDate = new Date(todayDate.setDate(todayDate.getDate() + 7 + (7-todayDate.getDay())))      
            let nextWeekDate = new Date(todayDate)
            nextWeekDate.setDate(nextWeekDate.getDate() + 7 + (7-nextWeekDate.getDay()))
            Slack.Helper.log("from", Slack.Helper.formatDate(todayDate))
            Slack.Helper.log("to", Slack.Helper.formatDate(nextWeekDate))
            this.sendResponse(parsedPayload, Slack.Response.deleteBookings(todayDate, nextWeekDate)); 
            break;
          }
        }
        return null
      }

      //return null?

      let todayDate = new Date()
      let nextWeekDate = new Date(todayDate.setDate(todayDate.getDate() + 7 + (7-todayDate.getDay())))
      Slack.Helper.log("start", Slack.Helper.formatDate(todayDate))
      Slack.Helper.log("next", Slack.Helper.formatDate(nextWeekDate))
      let bookings = App.Booking.getForPerson(userName, todayDate, nextWeekDate, 2)

      let todayDesk = " "
      let nextDesk = " "
      let nextDate = new Date()
      if (bookings.has(todayDate)) {
        todayDesk = `Desk *${bookings.get(todayDate)}*`
      }

      return Slack.Response.upcomingBookings({
        todayDate: Slack.Helper.formatDate(todayDate),
        todayBookedDesk: todayDesk, 
        nextDate: Slack.Helper.formatDate(nextDate), 
        nextBookedDesk: nextDesk,
      })

    }

    private static sendResponse(parsedPayload: any, reponsePayload: GoogleAppsScript.Content.TextOutput) {
      let responseUrl = parsedPayload.response_url
      let options = {
        "method": "post",
        "contentType": "application/json",
        "replace_original": true,
        "payload": reponsePayload.getContent()
      } as any

      try {
        UrlFetchApp.fetch(responseUrl, options)
      } catch(e) {
        Slack.Helper.log("failed to send response", e.message)
        options.payload = Slack.Response.error(e.message).getContent()
        UrlFetchApp.fetch(responseUrl, options)
      }
    }

  }
}
