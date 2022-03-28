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

      return Slack.Response.upcomingBookings()
    }

    private static authorize(event: GoogleAppsScript.Events.AppsScriptHttpRequestEvent): GoogleAppsScript.Content.TextOutput {
      let token = event.parameter["token"]
      if (!token || token != slackToken) {
        this.log("invalid token", token)
        return Slack.Response.error("Unauthorized")
      }
    }

    private static log = (msgType: string, msg: string) => AppConfig.Sheet.log(msgType, msg)
  }
}
