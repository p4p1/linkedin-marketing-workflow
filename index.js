/* index.js
 * Created on: Mon 17 Oct 2022 02:09:06 AM BST
 *
 *  ____   __  ____  __
 * (  _ \ /. |(  _ \/  )
 *  )___/(_  _))___/ )(
 * (__)    (_)(__)  (__)
 * https://leosmith.xyz/
 *
 * Description:
 *  A javascript file to send a linkedin post when a new blog post is created
 *
 */
let Parser = require('rss-parser');
const fetch = require('node-fetch');
const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const {spawn} = require('child_process');


const LINKEDIN_SECRET = core.getInput("LINKEDIN_SECRET");
const GITHUB_TOKEN = core.getInput("GITHUB_TOKEN");
const FILEPATH = core.getInput("FILE_PATH");
const RSS_FEED = core.getInput("rss_feed");

const commiterUsername = core.getInput('commiter_username');
const commiterEmail = core.getInput('commiter_email');
const commitMessage = core.getInput('commit_message');

core.setSecret(GITHUB_TOKEN);
core.setSecret(LINKEDIN_SECRET);

/*
 * Executes a command and returns its result as promise
 * @param cmd {string} command to execute
 * @param args {array} command line args
 * @param options {Object} extra options
 * @return {Promise<Object>}
 */
const exec = (cmd, args = [], options = {}) => new Promise((resolve, reject) => {
  let outputData = '';
  const optionsToCLI = {
    ...options
  };
  if (!optionsToCLI.stdio) {
    Object.assign(optionsToCLI, {stdio: ['inherit', 'inherit', 'inherit']});
  }
  const app = spawn(cmd, args, optionsToCLI);
  if (app.stdout) {
    // Only needed for pipes
    app.stdout.on('data', function (data) {
      outputData += data.toString();
    });
  }

  app.on('close', (code) => {
    if (code !== 0) {
      return reject({code, outputData});
    }
    return resolve({code, outputData});
  });
  app.on('error', () => reject({code: 1, outputData}));
});

/*
 * Pure request to send post
 * @param title {string} title of post
 * @param url {string} url of the blog post
 * @param desc {string} description of the blog post
 * @param user_id {string} user id to be sent to API
 */
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

/*
 * A wrapper around sendPostLinkedIn used to get UserId before sending post create request
 * @param title {string} the title of the blog pos
 * @param content {string} the description of the blog post
 * @param link {string} the link of the blog post
 */
function sendpost(title, content, link) {
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
      sendPostLinkedIn(title, link, content, result.id)
    })
    .catch(error => console.log('error', error));
}

async function update_last_upload() {
  await exec('git', [
    'config',
      '--global',
      'user.email',
      commiterEmail,
    ]);
  await exec('git', ['config', '--global', 'user.name', commiterUsername]);
  if (GITHUB_TOKEN) {
    await exec('git', ['remote', 'set-url', 'origin',
      `https://${GITHUB_TOKEN}@github.com/${process.env.GITHUB_REPOSITORY}.git`]);
  }
  await exec('git', ['add', FILEPATH]);
  await exec('git', ['commit', '-m', commitMessage]);
  await exec('git', ['push']);
}

let parser = new Parser();
(async () => {
  // Parse the rss feed
  let feed = await parser.parseURL(RSS_FEED);

  // check the file to see if the post has already been sent
  fs.readFile(FILEPATH, 'utf8', function(err, data){
    if (data != feed.items[0].title) {
      // write to file if not posted
      fs.writeFile(FILEPATH, feed.items[0].title, function (err) {
        if (err) return console.log(err);
      });

      // push the file to the repo to remember what was uploaded to linkedin
      update_last_upload();
      // send the post
      sendpost(feed.items[0].title, feed.items[0].content, feed.items[0].link);
    }
  });
})();
