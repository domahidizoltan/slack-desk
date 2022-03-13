const ss = SpreadsheetApp.getActiveSpreadsheet()
const template = ss.getSheetByName("template")

namespace AppConfig {
    const configRange = "A36:B39"
    
    export function getConfig(): Map<string, string> {
        let values = template.getRange(configRange).getValues()
        return new Map<string, string>(values.map(row => [row[0].toString(), row[1].toString()]))
    }
}

const TOTAL_TABLES = "TOTAL_TABLES"
const NON_WORKING_DAY_BG_CELL = "NON_WORKING_DAY_BG_CELL"
const HOLIDAYS_CALENDAR = "HOLIDAYS_CALENDAR"
const EXTRA_WORKDAY_TITLE = "EXTRA_WORKDAY_TITLE"
const config = AppConfig.getConfig()

function testConfig() {
    console.log(config.get(HOLIDAYS_CALENDAR))
}