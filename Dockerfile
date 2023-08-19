FROM python:3.9.13

LABEL org.opencontainers.image.authors="ken"
LABEL org.opencontainers.image.email="3hotpeper@gmail.com"

ENV PYTHONUNBUFFERED 1

RUN mkdir /app
WORKDIR /app
COPY ./requirements.txt /app/requirements.txt
RUN pip install -r requirements.txt
COPY . /app/

# CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]