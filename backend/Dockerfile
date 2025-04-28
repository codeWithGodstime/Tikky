# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy project files
COPY . /app/

# Expose the port Daphne will listen on
EXPOSE 8000

# Command to run Daphne with your Django project
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "ticky.asgi:application"]
