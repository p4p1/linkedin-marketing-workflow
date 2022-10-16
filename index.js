const fetch = require('node-fetch');
const core = require('@actions/core');
const github = require('@actions/github');

const LINKEDIN_SECRET = core.getInput("LINKEDIN_SECRET");
core.setSecret(LINKEDIN_SECRET);

console.log("helloWorld");
