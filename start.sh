#!/bin/bash
# 1. 用 netcat 測試資料庫連線，等待 mysql service 啟動後
# 2. collect 靜態文件 到 static資料夾
# 3. 資料遷移
# 4. 建立超級使用者
# 5. 用 uwsgi 啟動 django
# 6. tail空命令，避免執行 .sh 完退出

while ! nc -z db 3306 ; do
    echo "Waiting for the MySQL Server"
    sleep 3
done

python manage.py collectstatic --noinput&&
python manage.py makemigrations&&
python manage.py migrate&&
python manage.py shell -c "
from django.contrib.auth.models import User
try:
    User.objects.create_superuser('ken', '3hotpeper@gmail.com', '0317')
except Exception as e:
    print(e)
exit()
"&&
uwsgi --ini /app/uwsgi.ini&&
tail -f /dev/null

exec "$@"
