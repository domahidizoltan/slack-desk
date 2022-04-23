namespace Slack {

  export class Helper {
    static log = (msgType: string, msg: string) => {
      //App.Sheet.log(msgType, msg)
      console.log(msgType, msg)
    }

    static formatDate = (date: Date): string => {
      return `${date.getFullYear()}-${this.pad(date.getMonth()+1)}-${this.pad(date.getDate())}`
    }

    private static pad = (n: number): string => n.toString().padStart(2, "0")
  }
}