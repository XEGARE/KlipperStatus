# KlipperStatus
Получение состояния печати принтера на базе прошивки Klipper и отправка результата на Алису

## Подготовка
1. Клонируем репозиторий:
```
git clone https://github.com/XEGARE/KlipperStatus.git
```

2. Редактируем **app.js**:
```
const serverPort = 7000;

const MoonrakerIP = "192.168.1.102";
const MoonrakerPort = 7125;
```

3. Переходим в папку:
```
cd KlipperStatus
```

4. Запускаем скрипт:
```
npm start
```
или
```
node app.js
```

## Интеграция в Алису
### Понадобится:
1. Яндекс.Станция
2. Домовенок Кузя с привязкой к станции
3. Белый IP, KeenDNS или DynDNS

### Настройка:
1. Переходим на сайт [AlexStar](https://alexstar.ru/smarthome)
2. Заходим/Регистрируем аккаунт через Яндекс
3. Добавить правило HTTP (GET)
4. Заполняем правило
![image](https://github.com/XEGARE/KlipperStatus/assets/28856609/a718f62f-6c1a-471b-ab3b-ca18ccca1bf2)
5. Добавляем сценарий в приложение "Дом с Алисой"
![image](https://github.com/XEGARE/KlipperStatus/assets/28856609/34fd80cc-7097-4f1c-a9b6-b20e0421ed5f)
6. **Проверяем работу**
