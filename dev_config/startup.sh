echo "stopping and removing old containers"
docker stop $(docker ps -a -q)
docker rm $(docker ps -a -q)
docker run --network="host" --name rebotting -v /var/thrive_dev/data_mongo:/data/db -d mongo:latest
docker run --network="host" -d -v /home/hedata/dev/reboting/uploaded_data:/home/jovyan/work  hedata/dabi:v001 start-notebook.sh --NotebookApp.token='' --NotebookApp.allow_origin="*"
docker run --network="host" -v /home/hedata/dev/reboting/dev_config/nginx.conf:/etc/nginx/nginx.conf:ro -d nginx

