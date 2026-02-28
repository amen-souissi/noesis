FROM python:3.11-slim

WORKDIR /app

# Install dependencies first (layer caching)
COPY pyproject.toml .
RUN pip install --no-cache-dir ".[dev,viz]"

# Copy source code
COPY . .

CMD ["python", "main.py"]
