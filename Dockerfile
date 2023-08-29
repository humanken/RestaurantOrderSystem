FROM python:3.9.13

LABEL org.opencontainers.image.authors="ken"
LABEL org.opencontainers.image.email="3hotpeper@gmail.com"

# 安裝 netcat，測試資料庫連線
RUN apt-get update && apt install -y netcat

ENV PYTHONUNBUFFERED 1

RUN mkdir /app
WORKDIR /app
COPY ./requirements.txt /app/requirements.txt
# 更新pip，安裝依賴
RUN /usr/local/bin/python -m pip install --upgrade pip
RUN pip install uwsgi --no-cache-dir
RUN pip install -r requirements.txt
COPY . /app/

# windows -> linux, 將換行符(\r)換成空字串
RUN sed -i 's/\r//' ./start.sh

# 添加權限
RUN chmod +x ./start.sh

# 資料遷移，啟用uwsgi service
ENTRYPOINT /bin/bash ./start.sh

# CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]