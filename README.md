# Automated changelog from github pull requests

## Setup
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

## Pull request comment formatting

Follow the below formatting for your PR comments. Only add the headers you require and replace the feature list with whatever is relevant to your PR. Try and make it clear enough as to be understandable for someone just reading your PR without any specifics.

```jsx
## Added 
- Feature 1
- Feature 2

## Changed
- Feature 3
- Feature 4

## Fixed
- Feature 5
- Feature 6
```

## Access current change log

http://103.189.212.99:4567/changelog

## Clear current change log

http://103.189.212.99:4567/new
