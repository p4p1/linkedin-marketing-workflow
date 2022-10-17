let Parser = require('rss-parser');
const fetch = require('node-fetch');
const core = require('@actions/core');
const github = require('@actions/github');

const LINKEDIN_SECRET = core.getInput("LINKEDIN_SECRET");
const RSS_FEED = core.getInput("rss_feed");

//core.setSecret(LINKEDIN_SECRET);

function sendPostLinkedIn(title, url, desc, user_id) {
  var myHeaders = {
    "Authorization": `Bearer ${LINKEDIN_SECRET}`,
    "Content-Type": "application/json"
  }
  var raw = JSON.stringify({
    "author": `urn:li:person:${user_id}`,
    "lifecycleState": "PUBLISHED",
    "specificContent": {
      "com.linkedin.ugc.ShareContent": {
        "shareCommentary": {
          "text": `${desc}`
        },
        "shareMediaCategory": "ARTICLE",
        "media": [
          {
            "status": "READY",
            "description": {
              "text": `${title}`
            },
            "originalUrl": `${url}`,
            "title": {
              "text": `${title}`
            }
          }
        ]
      }
    },
    "visibility": {
      "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
    }
  });

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  fetch("https://api.linkedin.com/v2/ugcPosts", requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));
}

let parser = new Parser();
(async () => {
    let feed = await parser.parseURL(RSS_FEED);

    console.log(feed.title);

    feed.items.forEach((item) => {
          console.log(item.title);
        });
})();

// Code to get user profile
var myHeaders = {"Authorization": `Bearer ${LINKEDIN_SECRET}`}
var requestOptions = {
  method: 'GET',
  headers: myHeaders,
  redirect: 'follow'
};
fetch("https://api.linkedin.com/v2/me", requestOptions)
  .then(response => response.json())
  .then(result => {
    console.log(result);
    //sendPostLinkedIn("example", "https://leosmith.xyz", "A quick example to test some stuff out", result.id)
  })
  .catch(error => console.log('error', error));

