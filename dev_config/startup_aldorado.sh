echo "stopping and removing old containers"
docker stop $(docker ps -a -q)
docker rm $(docker ps -a -q)
docker run --network="host" --name rebotting -v /Volumes/HDD/rebotingdb:/data/db -d mongo:latest
docker run --network="host" -d -v ~/aldorado/twentythree/reboting/uploaded_data:/home/jovyan/work  hedata/dabi:v001 start-notebook.sh --NotebookApp.token='' --NotebookApp.allow_origin="*"
docker run --network="host" -v ~/aldorado/twentythree/reboting/dev_config/nginx.conf:/etc/nginx/nginx.conf:ro -d nginx

