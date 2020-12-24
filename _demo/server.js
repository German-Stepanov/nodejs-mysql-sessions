//Вспомогательная функция
Object.defineProperty(Object.prototype, 'myFormat', {writable: true, value:
	function() {
		var str = '' + JSON.stringify(this, null, 4);
		//TABS
		str = str.replace(/((?!\r\n)[\s\S]+?)($|(?:\r\n))/g, function (s, STR, CRLN, POS) {
			return STR.replace(/([^\t]*?)\t/g, function (s, STR, POS) {
				return STR + (new Array(4 - (STR.length + 4 ) % 4 + 1)).join(' ');
			}) + CRLN;
		});
		//LN
		str = str.replace(/\n/g, '<br/>');
		//SPACES
		return str.replace(/ +/g, function (s) {
			return (s.length==1) ? (' ') : ((new Array(s.length)).join('&nbsp;') + ' ');
		});
	}
});

//Устанавка конфигурации (глобальная)
myConfig = {};
//Конфигурация пользователя
myConfig.data = {
	port		: 2020,
	isDebug		: true,		//Сообшения сервера
};
//Конфигурация модуля кукисов
myConfig.cookies = {
	password 	: 'password',	//Пароль шифрования кукисов ('' - без шифрования)
};
var cookies = require('encode-decode-cookies')(myConfig.cookies);

//Конфигурация базы данных 
myConfig.db = {
	host 		: 'localhost',
	user 		: 'user',	
	password 	: 'password',
	database 	: 'test',	
};
//Конфигурация сессий
myConfig.sessions = {
	db		: myConfig.db,
	label		: 'SN',		//Название метки в кукисах
	timeout 	: 60,		//Время жизни сессии при бездействии, секунд
	checkIP		: false,	//Проверять изменение IP					
};
var sessions = require('mysql-sessions')(myConfig.sessions);

var controller = function(req, res, next) {
	var url = req.url.split('/');
	if (url[1]=='set') {
		//Установка данных пользователя
		var data = {};
		data[url[2]] = url[3]=='object' ? {user_name:"name", user_id:17} : url[3];
		if (url[4]) {
			data[url[4]] = url[5];		
		}
		req.session.set(data, function(success) {
			//Возврат на главную страницу
			res.writeHead(302, {'Location':'/'});
			res.end();
			return next(success);
		})
	} else if (url[1]=='delete') {
		//Удаление данных пользователя
		var name = url[2];
		if (url[3]) {
			name = [url[2], url[3]]	;		
		}
		req.session.delete(name, function( success ) {
			res.writeHead(302, {'Location':'/'});
			res.end();
			return next(success);
		});
	} else if (url[1]=='pop') {
		var name = url[2];
		req.session.pop(name, function(success, value) {
			if (value) {
				console.log('Получены данные "' + name + '". Значение "' + value + '"');
			} else {
				console.log('Данные не обнаружены');
			}
			res.writeHead(302, {'Location':'/'});
			res.end();
			return next(success);
		});
	} else {
		//Вывод главной страницы
		res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
		res.write('<style>* {font-size:18px} h1 {font-size:32px;margin-bottom:5px} h2 {font-size:24px;margin-bottom:5px} a {text-decoration:none; }</style>');
		res.write('<h1>Главная страница <a href="/" title="Обновить активность пользователя">(ОБНОВИТЬ)</a></h1> ');
		res.write('<div>Время жизни сессии при бездействии <b>' + myConfig.sessions.timeout + '</b> секунд</div>');
		res.write('<h2>Зашифрованные кукисы клиента (до session.start)</h2>');
		res.write('req.cookies.headers = "' + req.cookies.headers + '"');
		res.write('<h2>Расшифрованные кукисы клиента (до session.start)</h2>');
		res.write('req.cookies.parse = ');
		res.write(req.cookies.parse.myFormat());
		res.write('<h2>Строка сессии</h2>');
		res.write('req.session.row = ');
		res.write(req.session.row.myFormat());
		res.write('<h2>Данные пользователя</h2>');
		res.write('req.session.parse = ');
		res.write(req.session.parse.myFormat());
		//Добавляем меню
		res.write('<h2>УСТАНОВИТЬ ДАННЫЕ<br/>req.session.set(data, function(success) {})</h2>');
		res.write('<div><a href="/set/user_id/17">Установить <b>user_id</b> число <b>17</b></a></div>');
		res.write('<div><a href="/set/user_id/0">Установить <b>user_id</b> число <b>0</b></a></div>');
		res.write('<div><a href="/set/status/active">Установить <b>status</b> строку <b>active</b> (req.session.data.set(status, "active", function(success) {}))</a></div>');
		res.write('<div><a href="/set/status/passive">Установить <b>status</b> строку <b>passive</b> (req.session.data.set(status, "passive", function(success) {}))</a></div>');
		res.write('<div><a href="/set/row/object">Установить <b>row</b> объект <b>{user_name:"name", user_id:17}</b></a></div>');
		res.write('<div><a href="/set/flash_message/text_text_text">Установить <b>flash_message</b> значение <b>text_text_text</b> как флэш-данные</a></div>');
		res.write('<div><a href="/set/user_id/17/status/active">Установить <b>user_id</b> число <b>17</b> и <b>status</b> строку <b>active</b> (data = {user_id:17,status:"active"})</a></div>');

		res.write('<h2>УДАЛИТЬ ДАННЫЕ<br/>req.session.delete(name, function(success) {})</h2>');
		res.write('<div><a href="/delete/user_id">Удалить <b>user_id</b></a></div>');
		res.write('<div><a href="/delete/status">Удалить <b>status</b></a></div>');
		res.write('<div><a href="/delete/row">Удалить <b>row</b></a></div>');
		res.write('<div><a href="/delete/user_id/status">Удалить <b>user_id</b> и <b>status</b></a></div>');

		res.write('<h2>ПОЛУЧИТЬ И УДАЛИТЬ ДАННЫЕ (ФЛЭШ-ДАННЫЕ)<br/>req.session.pop(name, function(value, success) {})</h2>');
		res.write('<div><a href="/pop/flash_message">Получить значение <b>flash_message</b> и отобразить в консоли</a></div>');

		res.end();
		return next(1);
	}
}

//Формируем задачу
var app = function(req, res) {
	//Установим метку времени
	if (myConfig.data.isDebug) {
		console.log('\nПолучен запрос req.url', req.url);
		console.time('app');
	}
	//Подключаем и запускаем модуль кукисов
	cookies.start(req, res);
	//Подключаем и запускаем модуль сессий
	sessions.start(req, res, function () {
		//Запуск контроллера обработки запросов
		controller(req, res, function(success) {
			if(!success) console.log('Что-то пошло не так');
			//Выводим общее время
			if (myConfig.data.isDebug) {
				console.timeEnd('app');
			}
		});
	});
};
//Создаем и запускаем сервер для задачи
var server = require('http').createServer(app);
server.listen(myConfig.data.port);
//Отображаем информацию о старте сервера
if (myConfig.data.isDebug) console.log('Server start on port ' + myConfig.data.port + ' ...');
