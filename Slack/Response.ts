namespace Slack {

  type output = GoogleAppsScript.Content.TextOutput
  export class Response {

    static error = (msg: string): output => this.getContent("error", {"message": msg})
    static confirmation = (msg: string): output => this.getContent("confirmation", {"message": msg})

    static upcomingBookings = (data: {
      todayDate: string, 
      todayBookedDesk: string, 
      nextDate: string, 
      nextBookedDesk: string
    }): output => this.getContent("upcoming_bookings", data)
    
    static deleteBookings = (dateFrom: Date, dateTo: Date): output => {
      return this.getContent("delete_bookings", {
        dateFrom: Slack.Helper.formatDate(dateFrom),
        dateTo: Slack.Helper.formatDate(dateTo)
      })
    }

    private static getContent(templateName: string, variables: any): output {
      let template = HtmlService.createTemplateFromFile("Slack/template/" + templateName + ".json")
      template.v = variables
      let content = template.evaluate().getContent()
      return ContentService.createTextOutput(content).setMimeType(ContentService.MimeType.JSON)
    }
  }
}
