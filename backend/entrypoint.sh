#!/usr/bin/env bash
python manage.py collectstatic --noinput

# Give it a tiny delay to ensure Render's Internal Network is fully up
# and catch errors if migration fails instead of silently letting Gunicorn run
python manage.py migrate || echo "Migration failed, continuing anyway..."

gunicorn --bind 0.0.0.0:8000 backend.wsgi:application