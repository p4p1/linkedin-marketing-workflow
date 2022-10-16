const fetch = require('node-fetch');
const core = require('@actions/core');
const github = require('@actions/github');

core.setSecret(LINKEDIN_SECRET);

console.log("helloWorld");
