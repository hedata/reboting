# reboting



# Deployment:
* running on normal vm azure  - port 80 , 443 and ssh open from the outside world
  * login ssh is only valid with key

* internal routing with iptables
sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 3000
sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 443 -j REDIRECT --to-port 3001

so we can run node service as non root user
