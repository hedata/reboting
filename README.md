# Reboting

##Dev Server
docker-compose up

for testing ipynbs
docker run -p 10001:8888 -v /home/hedata/dev/reboting/uploaded_data:/home/jovyan/work hedata/dabi:v001 start-notebook.sh --NotebookApp.token='' --NotebookApp.allow_origin="*"

# Deployment:
* running on normal vm azure  - port 80 , 443 and ssh open from the outside world
  * login ssh is only valid with key

* internal routing with iptables
sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 3000
sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 443 -j REDIRECT --to-port 3001

so we can run node service as non root user

#fix inotify shit
echo fs.inotify.max_user_watches=582222 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p

#Update Packages
npm install -g npm-check-updates
npm-check-updates -u
npm install 

#Updates
docker-compose up -d --build 

