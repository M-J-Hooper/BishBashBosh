# BishBashBosh
A multi-user Linux terminal in the cloud.

Users connect via Socket.IO to a Node.js server running on an Amazon Web Services EC2 instance. The server executes user commands on an interactive Bash terminal running in a Docker container. Each users' commands appear in a different color. 

Connect to the test server here: http://ec2-35-176-139-236.eu-west-2.compute.amazonaws.com:3000
