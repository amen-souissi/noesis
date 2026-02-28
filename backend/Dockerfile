FROM python:3.11-slim

WORKDIR /app

# Dépendances système
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Dépendances Python
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Copier tout le projet (engine + backend)
COPY . /app

ENV DJANGO_SETTINGS_MODULE=backend.settings
ENV PYTHONPATH=/app:/app/backend
ENV PYTHONUNBUFFERED=1

WORKDIR /app/backend

EXPOSE 8000

CMD ["sh", "-c", "python manage.py migrate --noinput && python manage.py seed_presets 2>/dev/null; daphne -b 0.0.0.0 -p 8000 backend.asgi:application"]
