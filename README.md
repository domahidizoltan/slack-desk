npm i @google/clasp@2.3.0 -g
npm i -S @types/google-apps-script

clasp.json

finalize and export/import template

add project readme: install, usage, generate appscript id (publish)

slack install


----

clasp deploy -d "BP Desk"
{id}

https://script.google.com/macros/s/{id}/exec


----
https://api.slack.com/apps
> Create an App
> From an app manifest
> Select a workspace (select your workspace) -> Next
> Enter app manifest below -> rename `display.name` from `Demo App` to `Slack-Desk` -> Next
> Review summary & create your app -> Create

https://api.slack.com/apps/{id}

---
https://api.slack.com/apps/{id}/general?
> Basic Information
> Add features and functionality
  > Slash commands
  > Create New Command
  > Command: /sd
  > Request URL: https://script.google.com/macros/s/{id}/exec
  > Usage Hint: person table freeTables deletePerson bookTable -> Save

  > Interactive Components
  > Interactivity: on
  > Request URL : https://script.google.com/macros/s/{id}/exec

> Basic Information
> Install your app
> Install to workspace
> Perform actions in your workspace -> Allow



//slack manifest

-----
> Usage Hint: person table getFreeTables deletePerson bookTable -> Save

+ lekerdezni a mai es a kov foglalast (max kov het vegeig):     /sd
  - mindketto melle torles gomb     /sd deletePerson startDate
  - ala uj foglalas gomb es torles gomb     /sd bookTable /sd deltePerson -> modal
+ torles modal, ket idopont kozott, max elore 2. honap vegeig   /sd deletePerson startDate endDate
- asztal foglalas ket datum kozott, max elore 2. honap vegeig:  /sd bookTable X startDate endDate
  - asztal legend
  - egy asztal valasztasa (csak szabad asztalok adott idoben) vagy "?" (ha nincs folyamatos szabad asztal akkor csak "?")   /sd getFreeTables startDate endDate
+ view desk map
+ confirmation
+ lekerdezni asztal foglalasat ma es kov napra  /sd getFreeTables startDate endDate

