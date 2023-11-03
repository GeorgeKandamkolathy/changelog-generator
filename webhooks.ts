var fs = require("fs/promises")

const express = require('express');
const asyncHandler = require('express-async-handler')

const app = express();

app.set('view engine', 'ejs');

interface ChangeLog {
  added: string[];
  changed: string[];
  fixed: string[];
  [key:string]: string[];
}


const change_log: ChangeLog = {added: [], changed: [], fixed: []};


async function readCurrentChangelog() {
  var file = await fs.readFile(__dirname + '/static/changelog.json', 'utf8');
  if (file !== "" && file !== null) {
    return JSON.parse(file) 
  }
  return change_log
}

async function writeCurrentChangelog(changeLog: ChangeLog) {
  await fs.writeFile(__dirname + '/static/changelog.json', JSON.stringify(changeLog))
}


app.post('/webhook', express.json({type: 'application/json'}), asyncHandler( async (request:any, response:any) => {

  response.status(202).send('Accepted');

  const githubEvent = request.headers['x-github-event'];

  if (githubEvent === 'pull_request') {
    const data = request.body;

    if (data.action === 'closed' && data.pull_request.merged === true) {
      const currentChangeLog = await readCurrentChangelog()
      const changeHeaders = data.pull_request.body.split('##').map((s:String) => s.replace(/\\r?\\n|\\r/g, ''))

      changeHeaders.forEach((element: String) => {
        if (element.trim() !== '') {
          const logItems = element.split('-').map(s => s.trim());
          
          currentChangeLog[logItems[0].toLowerCase()].push(...logItems.slice(1,));

        }
      });
      writeCurrentChangelog(currentChangeLog);
    }
  } else if (githubEvent === 'ping') {
    console.log('GitHub sent the ping event');
  } else {
    console.log(`Unhandled event: ${githubEvent}`);
  }
}));

app.get('/changelog', asyncHandler( async (request:any, response:any) => {

  const changeLog = await readCurrentChangelog()

  response.render('pages/changelog', {
    changelog: changeLog
  })
}))

app.get('/new', asyncHandler(async (requeset:any, response:any) => {
  await writeCurrentChangelog(change_log)

  response.status(200).send()
}))

const port = 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});