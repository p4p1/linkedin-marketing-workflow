const fetch = require('node-fetch');
const core = require('@actions/core');
const github = require('@actions/github');

const LINKEDIN_SECRET = core.getInput("LINKEDIN_SECRET");
core.setSecret(LINKEDIN_SECRET);

function sendPostLinkedIn(title, url, desc) {
  var myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${process.env.LINKEDIN_SECRET}`);
  myHeaders.append("Content-Type", "application/json");
  var raw = JSON.stringify({
    "author": "urn:li:person:s2fNfmiGu2",
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

sendPostLinkedIn("example", "https://leosmith.xyz", "A quick example to test some stuff out")
