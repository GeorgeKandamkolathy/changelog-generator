# Automated changelog from github pull requests

1. Clone repository into local
2. `npm install` in the cloned repository
3. `npm install -g pm2`
4.  `npm run build`
5. In the `dist` folder create a `static` folder with a file called `changelog.json`
6. `pm2 start dist/webhooks.js`
7. `curl [localhost:3000](http://localhost:3000)` to check that it is running
8. Set up an nginx proxy for this port 
9. Add a webhook to your repository pointing to `SERVERADDRESS/webhook`
10. Set the webhook to send events for push and pull requests
