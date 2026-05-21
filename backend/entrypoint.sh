#!/usr/bin/env bash
python manage.py collectstatic --noinput
python manage.py migrate
gunicorn --bind 0.0.0.0:8000 backend.wsgi:application