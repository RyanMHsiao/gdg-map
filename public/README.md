# Public

This is where everything that should be served to the end-user as part of the website lives.
If you want to test out the website, you need to move to this directory and run a server.
The easiest way to do that is to install npm and install [http-server](https://www.npmjs.com/package/http-server). Once that is installed, simply navigate to this directory and run `http-server`. Then open up your browser and enter `localhost:8080` into the searchbar. If you're having trouble with any of these steps, ask Ryan Hsiao for help.

**assets** is where files containing data should go, including image files, JSON files, and any other types of files that do not contain code.

**js** is where modular JS (.mjs) files should go.

**index.html** is the html file that gets served to users.

**styles.css** contains the CSS for everything. Currently, the plan is to have all CSS in that one file.
