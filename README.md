Polytrix 
========
[![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)](http://code.polytrix.me)
[![Platform](https://img.shields.io/badge/platform-web-lightgrey.svg)](http://code.polytrix.me)
[![Build Version](https://img.shields.io/badge/version-0.1.1-brightgreen.svg)](http://code.polytrix.me)
[![License](https://img.shields.io/badge/license-MIT-orange.svg)](http://code.polytrix.me)


Polytrix is a web application for managing your files lives across all your cloud storage services
- It provides the standard view to each of your cloud storages service to let user browse through all of them
- Builded-in compact view reorganize all of your files altogether in a single unit view with search interface
- To each individual files it also serve as an version control manager and many great sharing feature are combined

## Quickstart
1. Run `git clone https://github.com/nexvisync/Polytrix.git`
2. `cd Polytrix/client` and then `npm install && bower install` for obtaining dependencies source files.
3. `cd ../server` and then `npm install` for obtaining server side dependencies source files.
4. Finally, run `npm test` in /server to deploy development server
5. Run `npm start` instead to deploy production server

\* Please install nodemon globally first if you have not installed nodemon yet<br />
  Installation command: `sudo npm install -g nodemon`

## Requirement
- git
- nodeJS
- npm
- bower
- mongodb
- nodemon


## Deployment description
This web application is seperated into two parts, `server` and `client`, server side application is run by express framework and its required node modules, client side app is managed by AngularJS framework

### APIs Reference

