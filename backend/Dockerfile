FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt /app/

RUN pip install --no-cache-dir -r requirements.txt

COPY . /app/

# Make entrypoint script executable
RUN chmod +x /app/entrypoint.sh

# Change CMD to use our new script
CMD ["/app/entrypoint.sh"]
