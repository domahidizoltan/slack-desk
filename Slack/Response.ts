namespace Slack {

  export class Response {

    static error = (msg: string) => this.getContent("error", {"message": msg})

    static upcomingBookings = () => this.getContent("upcoming_bookings", {})

    private static getContent(templateName: string, variables: any): GoogleAppsScript.Content.TextOutput {
      let template = HtmlService.createTemplateFromFile("Slack/template/" + templateName + ".json")
      template.v = variables
      let content = template.evaluate().getContent()
      return ContentService.createTextOutput(content).setMimeType(ContentService.MimeType.JSON)
    }
  }
}
