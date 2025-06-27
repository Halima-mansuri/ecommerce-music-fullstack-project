#!/usr/bin/env bash

# Install ffmpeg on the fly
apt-get update && apt-get install -y ffmpeg

# Then start the app (gunicorn or whatever you're using)
gunicorn wsgi:app --bind 0.0.0.0:$PORT
