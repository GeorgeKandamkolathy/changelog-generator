var fs = require("fs/promises")
const helmet = require("helmet");

const express = require('express');
const asyncHandler = require('express-async-handler')

const app = express();

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "script-src": ["'self'", "code.jquery.com", "cdn.jsdelivr.net"],
    },
  }),
);

app.set('view engine', 'ejs');

interface ChangeLog {
  added: string[];
  changed: string[];
  fixed: string[];
  [key:string]: string[];
}


const change_log: ChangeLog = {added: [], changed: [], fixed: []};

// Get current changelog from the json file
async function readCurrentChangelog() {
  var file = await fs.readFile(__dirname + '/static/changelog.json', 'utf8');
  if (file.length !== 0) {
    return JSON.parse(file) 
  }
  return change_log
}

// Write over changelog file with new changelog changes
async function writeCurrentChangelog(changeLog: ChangeLog) {
  await fs.writeFile(__dirname + '/static/changelog.json', JSON.stringify(changeLog))
}

// Route to handle github webhooks
app.post('/webhook', express.json({type: 'application/json'}), asyncHandler( async (request:any, response:any) => {
  response.status(202).send('Accepted');

  const githubEvent = request.headers['x-github-event'];

  if (githubEvent === 'pull_request') {
    const data = request.body;


    // If pull request merged into main, add to the changelog
    if (data.action === 'closed' && data.pull_request.merged === true && data.pull_request.base.ref === 'main') {
      const currentChangeLog = await readCurrentChangelog()
      const changeHeaders = data.pull_request.body.split('##').map((s:String) => s.replace(/\\r?\\n|\\r/g, ''))

      changeHeaders.forEach((element: String) => {
        if (element.trim() !== '') {
          const logItems = element.split('-').map(s => s.trim());
          try {
            currentChangeLog[logItems[0].toLowerCase()].push(...logItems.slice(1,));
          } catch (err) {
            console.log(logItems[0].toLowerCase(), ...logItems.slice(1,))
          }
        }
      });
      writeCurrentChangelog(currentChangeLog);
    }
  }
}));

// Get the current changelog and render it to the page
app.get('/changelog', asyncHandler( async (request:any, response:any) => {
  try {
    const changeLog = await readCurrentChangelog()
    response.render('pages/changelog', {
      changelog: changeLog
    })
  } catch (err) {
    response.render('pages/error', {})
  }
}))

// Clear the current changelog
app.get('/new', asyncHandler(async (requeset:any, response:any) => {
  await writeCurrentChangelog(change_log)

  response.status(200).send("Changelog cleared")
}))

const port = 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});