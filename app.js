import * as http from 'http'

const serverPort = 7000;

const MoonrakerIP = "192.168.1.102";
const MoonrakerPort = 7125;

const server = http.createServer((req, res) => {
    if(req.url === "/") {
        http.get(`http://${MoonrakerIP}:${MoonrakerPort}/printer/objects/query?webhooks=state&print_stats&extruder=target,temperature&heater_bed=target,temperature&virtual_sdcard`, (result) => {
            const { statusCode } = result;

            if(statusCode === 200) {
                result.setEncoding('UTF8');
                
                let data = '';
                result.on('data', (chunk) => { data += chunk; });
                result.on('end', () => {
                    try {
                        const parsedData = JSON.parse(data);
                        let printerStatus = parsedData.result.status.webhooks.state;

                        let fileName = parsedData.result.status.print_stats.filename;
                        let fileNameWithoutExtension = fileName.replace(".gcode", "");
                        let printStatus = parsedData.result.status.print_stats.state;

                        let extruderCurrentTemp = parsedData.result.status.extruder.temperature;
                        let extruderTargetTemp = parsedData.result.status.extruder.target;

                        let bedCurrentTemp = parsedData.result.status.heater_bed.temperature;
                        let bedTargetTemp = parsedData.result.status.heater_bed.target;

                        let progress = parsedData.result.status.virtual_sdcard.progress;
                        
                        if(printerStatus === "shutdown") {
                            sendResponse(res, "Принтер выключен");
                        }
                        else if(printerStatus === "ready") {
                            if(printStatus === "standby") {
                                sendResponse(res, "Принтер простаивает");
                            }
                            else if(printStatus === "paused") {
                                sendResponse(res, "Принтер на паузе");
                            }
                            else if(printStatus === "error") {
                                sendResponse(res, "Печать завершена с ошибкой");
                            }
                            else if(printStatus === "complete") {
                                sendResponse(res, "Печать завершена успешно");
                            }
                            else if(printStatus === "printing") {

                                if(difference(extruderCurrentTemp, extruderTargetTemp) <= 2.0 && difference(bedCurrentTemp, bedTargetTemp) <= 2.0)
                                {
                                    sendResponse(res, "Принтер печатает. " +
                                    `Файл: ${fileNameWithoutExtension}. ` +
                                    `Прогресс: ${declOfNum(Math.floor(progress*100), ['процент', 'процента', 'процентов'])}. ` +
                                    `Сопло: ${declOfNum(Math.round(extruderCurrentTemp), ['градус', 'градуса', 'градусов'])} из ${declOfNum(Math.round(extruderTargetTemp), ['градус', 'градуса', 'градусов'])}. ` +
                                    `Стол: ${declOfNum(Math.round(bedCurrentTemp), ['градус', 'градуса', 'градусов'])} из ${declOfNum(Math.round(bedTargetTemp), ['градус', 'градуса', 'градусов'])}.`);
                                }
                                else {
                                    sendResponse(res, "Принтер нагревается. " +
                                    `Файл: ${fileNameWithoutExtension}. ` +
                                    `Сопло: ${declOfNum(Math.round(extruderCurrentTemp), ['градус', 'градуса', 'градусов'])} из ${declOfNum(Math.round(extruderTargetTemp), ['градус', 'градуса', 'градусов'])}. ` +
                                    `Стол: ${declOfNum(Math.round(bedCurrentTemp), ['градус', 'градуса', 'градусов'])} из ${declOfNum(Math.round(bedTargetTemp), ['градус', 'градуса', 'градусов'])}.`);
                                }
                            }
                            else {
                                sendResponse(res, "Неизвестное ссостояние принтера");
                            }
                        }
                        else {
                            sendResponse(res, "Неизвестное ссостояние принтера");
                        }
                    } catch (e) {
                        console.log(e.message);
                        sendResponse(res, "Возникла проблема при обработке данных!");
                    }
                });
                
            }
            else {
                sendResponse(res, "Moonraker недоступен!");
                result.resume();
            }
        }).on('error', (e) => {
            sendResponse(res, "Moonraker недоступен!");
        });
    }
    else {
        sendResponse(res, "Неизвестная команда!");
    }
});

server.listen(serverPort, () => {
    console.log("Сервер запущен по адресу http://localhost:%d", serverPort);
});

function sendResponse(response, text) {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({
        status: "ok",
        value: text
    }));
}

function difference(a, b) {
    return Math.abs(a - b);
}

function declOfNum(number, titles) {
    const cases = [2, 0, 1, 1, 1, 2];
    const result = titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
    return `${number} ${result}`;
  }