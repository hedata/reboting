# Reboting
Playing around with Bots .-)

# Requirements
* node
* npm

## Dev Server
* docker-compose up -d
* npm run devstart
* for testing notebooks goto http://localhost:8888

# Update Packages
npm install -g npm-check-updates
npm-check-updates -u
npm install 

# Updates
docker-compose down
ng build --prod --aot
docker-compose up -d --build

# Other stuff
## fix inotify shit
echo fs.inotify.max_user_watches=582222 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p


#Jupyterlab updates
Jupyterlab goes fast and it seems like "jupyterlab": "^0.17.5", is not the correct npm package anymore

the problem is 
home/hedata/dev/reboting/node_modules/@jupyterlab/rendermime/lib/renderers.js

for now we have to manually enable rendering

  // Set the inner HTML of the host.
    host.innerHTML = source;
    //if (host.getElementsByTagName('script').length > 0) {
    //    console.warn('JupyterLab does not execute inline JavaScript in HTML output');
    //}
    // TODO - arbitrary script execution is disabled for now.
    // Eval any script tags contained in the HTML. This is not done
    // automatically by the browser when script tags are created by
    // setting `innerHTML`. The santizer should have removed all of
    // the script tags for untrusted source, but this extra trusted
    // check is just extra insurance.
    // if (trusted) {
    //   // TODO do we really want to run scripts? Because if so, there
    //   // is really no difference between this and a JS mime renderer.
    Private.evalInnerHTMLScriptTags(host);

