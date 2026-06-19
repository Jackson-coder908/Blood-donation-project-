# Use a lightweight Python image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Copy your files
COPY . .

# Install dependencies (if you have a requirements.txt)
RUN pip install scikit-learn flask

# Run your app
CMD ["python", "app.py"]