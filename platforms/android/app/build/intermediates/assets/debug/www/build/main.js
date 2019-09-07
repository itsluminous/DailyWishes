webpackJsonp([0],{

/***/ 101:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return SqlStorageProvider; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__ionic_native_sqlite__ = __webpack_require__(197);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__ionic_native_social_sharing__ = __webpack_require__(195);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__ionic_native_sqlite_porter__ = __webpack_require__(200);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_ionic_angular__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__ionic_native_local_notifications__ = __webpack_require__(51);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};






var SqlStorageProvider = /** @class */ (function () {
    function SqlStorageProvider(sqlite, sharingVar, sqlitePorter, events, localNotifications) {
        this.sqlite = sqlite;
        this.sharingVar = sharingVar;
        this.sqlitePorter = sqlitePorter;
        this.events = events;
        this.localNotifications = localNotifications;
        this.nameOfImage = "";
        this.scheduleData = { Morning: { Time: "00:00", Count: 0, Current: 0 },
            Afternoon: { Time: "00:00", Count: 0, Current: 0 },
            Evening: { Time: "00:00", Count: 0, Current: 0 },
            Night: { Time: "00:00", Count: 0, Current: 0 } };
        this.OneTimeEvents = [];
    }
    SqlStorageProvider.prototype.initializeDatabase = function () {
        var _this = this;
        return this.sqlite.create({ name: 'dailyWishes.db', location: 'default' })
            .then(function (db) {
            console.log("db created");
            _this.db = db;
            var sql = [];
            sql.push("CREATE TABLE IF NOT EXISTS TableIndexes(type TEXT, idx INTEGER, maxIdx INTEGER, notificationTime TEXT)");
            sql.push("CREATE TABLE IF NOT EXISTS GoodMorning(rowid INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, path TEXT, thumbnail TEXT)");
            sql.push("CREATE TABLE IF NOT EXISTS GoodAfternoon(rowid INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, path TEXT, thumbnail TEXT)");
            sql.push("CREATE TABLE IF NOT EXISTS GoodEvening(rowid INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, path TEXT, thumbnail TEXT)");
            sql.push("CREATE TABLE IF NOT EXISTS GoodNight(rowid INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, path TEXT, thumbnail TEXT)");
            sql.push("CREATE TABLE IF NOT EXISTS OneTimeEvents(rowid INTEGER PRIMARY KEY AUTOINCREMENT, eventTitle TEXT, eventDate TEXT, eventTime TEXT, imagePath TEXT)");
            _this.db.sqlBatch(sql)
                .then(function () { console.log("Tables created"); _this.initializeTableIndexes(); })
                .catch(function (e) { return console.error("Error: " + JSON.stringify(e)); });
        })
            .catch(function (e) { return console.error(JSON.stringify(e)); });
    };
    SqlStorageProvider.prototype.initializeTableIndexes = function () {
        var _this = this;
        return this.db.executeSql("SELECT type FROM TableIndexes", [])
            .then(function (resultSet) {
            var sql = [];
            if (resultSet.rows.length > 0) {
                console.log("Table already has data");
                sql.push("UPDATE TableIndexes SET maxIdx = (SELECT COUNT(*) FROM GoodMorning) WHERE type='Morning'");
                sql.push("UPDATE TableIndexes SET maxIdx = (SELECT COUNT(*) FROM GoodAfternoon) WHERE type='Afternoon'");
                sql.push("UPDATE TableIndexes SET maxIdx = (SELECT COUNT(*) FROM GoodEvening) WHERE type='Evening'");
                sql.push("UPDATE TableIndexes SET maxIdx = (SELECT COUNT(*) FROM GoodNight) WHERE type='Night'");
            }
            else {
                console.log("Table is getting initialized for first time");
                sql.push("INSERT INTO TableIndexes(type, idx, maxIdx, notificationTime) VALUES ('Morning',1,0,'06:30'), ('Afternoon',1,0,'12:00'), ('Evening',1,0,'17:30'), ('Night',1,0,'20:30')");
                sql.push("UPDATE TableIndexes SET maxIdx = (SELECT COUNT(*) FROM GoodMorning) WHERE type='Morning'");
                sql.push("UPDATE TableIndexes SET maxIdx = (SELECT COUNT(*) FROM GoodAfternoon) WHERE type='Afternoon'");
                sql.push("UPDATE TableIndexes SET maxIdx = (SELECT COUNT(*) FROM GoodEvening) WHERE type='Evening'");
                sql.push("UPDATE TableIndexes SET maxIdx = (SELECT COUNT(*) FROM GoodNight) WHERE type='Night'");
            }
            return _this.db.sqlBatch(sql)
                .then(function () { console.log("Indexes Initialized"); Promise.resolve("Indexes Initialized"); })
                .catch(function (e) { console.error("Error: " + JSON.stringify(e)); Promise.reject("Indexes Initialized"); });
        })
            .catch(function (e) { console.error("Error: " + JSON.stringify(e)); Promise.reject("Indexes Initialized"); });
    };
    SqlStorageProvider.prototype.getData = function () {
        var _this = this;
        var that = this;
        return this.sqlite.create({ name: 'dailyWishes.db', location: 'default' })
            .then(function (db) {
            _this.db = db;
            return that.db.executeSql("SELECT * FROM TableIndexes", [])
                .then(function (resultSet) {
                for (var i = 0; i < resultSet.rows.length; i++) {
                    switch (resultSet.rows.item(i).type) {
                        case 'Morning': {
                            that.scheduleData.Morning.Time = resultSet.rows.item(i).notificationTime;
                            that.scheduleData.Morning.Count = resultSet.rows.item(i).maxIdx;
                            that.scheduleData.Morning.Current = resultSet.rows.item(i).idx;
                            break;
                        }
                        case 'Afternoon': {
                            that.scheduleData.Afternoon.Time = resultSet.rows.item(i).notificationTime;
                            that.scheduleData.Afternoon.Count = resultSet.rows.item(i).maxIdx;
                            that.scheduleData.Afternoon.Current = resultSet.rows.item(i).idx;
                            break;
                        }
                        case 'Evening': {
                            that.scheduleData.Evening.Time = resultSet.rows.item(i).notificationTime;
                            that.scheduleData.Evening.Count = resultSet.rows.item(i).maxIdx;
                            that.scheduleData.Evening.Current = resultSet.rows.item(i).idx;
                            break;
                        }
                        case 'Night': {
                            that.scheduleData.Night.Time = resultSet.rows.item(i).notificationTime;
                            that.scheduleData.Night.Count = resultSet.rows.item(i).maxIdx;
                            that.scheduleData.Night.Current = resultSet.rows.item(i).idx;
                            break;
                        }
                    }
                }
                return Promise.resolve(that.scheduleData);
            })
                .catch(function (e) { console.error("Error: " + JSON.stringify(e)); return Promise.reject(that.scheduleData); });
        })
            .catch(function (e) { return console.error(JSON.stringify(e)); });
    };
    SqlStorageProvider.prototype.SendWish = function (tableName, wishType, triggeredFromNotification) {
        var _this = this;
        //if last notification then schedule for tomorrow
        this.localNotifications.getAll().then(function (scheduleData) {
            if (triggeredFromNotification && scheduleData.length == 0)
                _this.events.publish('scheduleTomorrow', null);
        });
        //send message on whatsapp
        this.sqlite.create({ name: 'dailyWishes.db', location: 'default' })
            .then(function (db) {
            _this.db = db;
            _this.getSingleData(tableName, wishType).then(function (nameOfImage) {
                _this.sharingVar.shareViaWhatsApp("Good " + wishType, "file:///storage/emulated/0/DailyWishesAppData/" + wishType + "/" + nameOfImage, null)
                    .then(function () { console.log("Success"); _this.events.publish('loadData', null); }, function () { console.log("failed"); });
            });
        })
            .catch(function (e) { return console.error(JSON.stringify(e)); });
    };
    SqlStorageProvider.prototype.SendOneTimeWish = function (eventId, triggeredFromNotification) {
        var _this = this;
        //if last notification then schedule for tomorrow
        this.localNotifications.getAll().then(function (scheduleData) {
            if (triggeredFromNotification && scheduleData.length == 0)
                _this.events.publish('scheduleTomorrow', null);
        });
        //send message on whatsapp
        this.sqlite.create({ name: 'dailyWishes.db', location: 'default' })
            .then(function (db) {
            _this.db = db;
            _this.getOTEData(eventId).then(function (message) {
                _this.sharingVar.shareViaWhatsApp(message, "Image", "data:image/png;base64," + _this.nameOfImage)
                    .then(function () { console.log("Success"); _this.events.publish('loadData', null); }, function () { console.log("failed"); });
            });
        })
            .catch(function (e) { return console.error(JSON.stringify(e)); });
    };
    SqlStorageProvider.prototype.getSingleData = function (tableName, wishType) {
        var _this = this;
        var that = this;
        return that.db.executeSql("SELECT * FROM " + tableName + " WHERE rowid = (SELECT idx from TableIndexes WHERE type = '" + wishType + "')", [])
            .then(function (single) {
            that.nameOfImage = single.rows.item(0).name;
            return _this.db.executeSql("UPDATE TableIndexes SET idx = CASE WHEN idx = maxIdx THEN  1 ELSE idx+1 END WHERE type = '" + wishType + "'", [])
                .then(function () { return Promise.resolve(that.nameOfImage); })
                .catch(function (e) { console.error("Error: " + JSON.stringify(e)); return Promise.reject(""); });
        })
            .catch(function (e) { console.error("Error: " + JSON.stringify(e)); return Promise.reject(""); });
    };
    SqlStorageProvider.prototype.getOTEData = function (eventId) {
        var _this = this;
        var that = this;
        console.log("rowid=", eventId);
        return that.db.executeSql("SELECT * FROM OneTimeEvents WHERE rowid = ?", [eventId])
            .then(function (single) {
            console.log(JSON.stringify(single));
            that.nameOfImage = single.rows.item(0).imagePath;
            return _this.deleteOTE(eventId)
                .then(function () { return Promise.resolve(single.rows.item(0).eventTitle); })
                .catch(function (e) { console.error("Error: " + JSON.stringify(e)); return Promise.reject(""); });
        })
            .catch(function (e) { console.error("Error: " + JSON.stringify(e)); return Promise.reject(""); });
    };
    SqlStorageProvider.prototype.saveData = function (data, tableName) {
        this.db.executeSql('INSERT INTO ' + tableName + '(name, path, thumbnail) SELECT ?,?,? WHERE NOT EXISTS(SELECT 1 FROM ' + tableName + ' WHERE name = ?)', [data.fileName, data.photoURL, data.thumbnailURL, data.fileName])
            .then(function (res) {
            return console.log(JSON.stringify(res));
        })
            .catch(function (e) { return console.error(JSON.stringify(e)); });
    };
    SqlStorageProvider.prototype.updateNotificationSchedule = function (morning, afternoon, evening, night) {
        var sql = [];
        sql.push("UPDATE TableIndexes SET notificationTime = '" + morning + "' WHERE type='Morning'");
        sql.push("UPDATE TableIndexes SET notificationTime = '" + afternoon + "' WHERE type='Afternoon'");
        sql.push("UPDATE TableIndexes SET notificationTime = '" + evening + "' WHERE type='Evening'");
        sql.push("UPDATE TableIndexes SET notificationTime = '" + night + "' WHERE type='Night'");
        return this.db.sqlBatch(sql)
            .then(function () { return Promise.resolve("Updated Schedule"); })
            .catch(function (e) { console.error("Error: " + JSON.stringify(e)); return Promise.reject(""); });
    };
    SqlStorageProvider.prototype.exportDB = function () {
        return this.sqlitePorter.exportDbToSql(this.db)
            .then(function (res) { console.log(JSON.stringify(res)); return Promise.resolve(res); })
            .catch(function (e) { console.error("Error: " + JSON.stringify(e)); return Promise.reject(""); });
    };
    SqlStorageProvider.prototype.importDB = function (sql) {
        return this.sqlitePorter.importSqlToDb(this.db, sql)
            .then(function (res) { console.log(JSON.stringify(res)); return Promise.resolve(res); })
            .catch(function (e) { console.error("Error: " + JSON.stringify(e)); return Promise.reject(""); });
    };
    SqlStorageProvider.prototype.SaveOneTimeEvent = function (oneTimeEvents) {
        var _this = this;
        console.log(oneTimeEvents);
        return this.sqlite.create({ name: 'dailyWishes.db', location: 'default' })
            .then(function (db) {
            _this.db = db;
            oneTimeEvents.forEach(function (ote) {
                _this.db.executeSql("SELECT eventTitle FROM OneTimeEvents where rowid = " + ote.Id, [])
                    .then(function (resultSet) {
                    if (resultSet.rows.length > 0) {
                        console.log("Table already has this one time event. Update it.");
                        _this.db.executeSql("UPDATE OneTimeEvents SET eventTitle=?, eventDate=?, eventTime=?, imagePath=? WHERE rowid =?", [ote.Text, ote.ScheduleDate, ote.Time, ote.ImagePath, ote.Id]).catch(function (e) { return console.error(JSON.stringify(e)); });
                        //sql.push("UPDATE OneTimeEvents SET eventTitle = '" + ote.Text + "', eventDate = '" + ote.ScheduleDate + "', eventTime = '" + ote.Time + "', imagePath = '" + ote.ImagePath + "' where rowid = " + ote.Id);
                    }
                    else {
                        console.log("Adding this one time event for first time");
                        _this.db.executeSql('INSERT INTO OneTimeEvents(eventTitle, eventDate, eventTime, imagePath) VALUES (?,?,?,?)', [ote.Text, ote.ScheduleDate, ote.Time, ote.ImagePath]).catch(function (e) { return console.error(JSON.stringify(e)); });
                        //sql.push("INSERT INTO OneTimeEvents(eventTitle, eventDate, eventTime, imagePath) VALUES ('" + ote.Text + "','" + ote.ScheduleDate + "','" + ote.Time + "','" + ote.ImagePath + "')");
                    }
                });
            });
            return _this.getOneTimeEvents();
            // console.log(sql);
            // return this.db.sqlBatch(sql)
            //   .then(() => {console.log("One time events set"); Promise.resolve("One time events set")})
            //   .catch(e => {console.error("Error: " + JSON.stringify(e));Promise.reject("Indexes Initialized")})
        })
            .catch(function (e) { return console.error(JSON.stringify(e)); });
    };
    SqlStorageProvider.prototype.getOneTimeEvents = function () {
        var _this = this;
        var that = this;
        return this.sqlite.create({ name: 'dailyWishes.db', location: 'default' })
            .then(function (db) {
            _this.db = db;
            return that.db.executeSql("SELECT * FROM OneTimeEvents", [])
                .then(function (resultSet) {
                for (var i = 0; i < resultSet.rows.length; i++) {
                    var oneTimeEvent = { Id: resultSet.rows.item(i).rowid, Text: resultSet.rows.item(i).eventTitle,
                        ScheduleDate: resultSet.rows.item(i).eventDate, Time: resultSet.rows.item(i).eventTime,
                        ImagePath: resultSet.rows.item(i).imagePath };
                    that.OneTimeEvents.unshift(oneTimeEvent);
                }
                return Promise.resolve(that.OneTimeEvents);
            })
                .catch(function (e) { console.error("Error: " + JSON.stringify(e)); return Promise.reject(that.OneTimeEvents); });
        })
            .catch(function (e) { return console.error(JSON.stringify(e)); });
    };
    SqlStorageProvider.prototype.deleteOTE = function (Id) {
        console.log("Delete : " + Id);
        return this.db.executeSql('DELETE FROM OneTimeEvents WHERE rowid =?', [Id]).catch(function (e) { return console.error(JSON.stringify(e)); });
    };
    SqlStorageProvider = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["A" /* Injectable */])(),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1__ionic_native_sqlite__["a" /* SQLite */], __WEBPACK_IMPORTED_MODULE_2__ionic_native_social_sharing__["a" /* SocialSharing */],
            __WEBPACK_IMPORTED_MODULE_3__ionic_native_sqlite_porter__["a" /* SQLitePorter */], __WEBPACK_IMPORTED_MODULE_4_ionic_angular__["b" /* Events */],
            __WEBPACK_IMPORTED_MODULE_5__ionic_native_local_notifications__["a" /* LocalNotifications */]])
    ], SqlStorageProvider);
    return SqlStorageProvider;
}());

//# sourceMappingURL=sql-storage.js.map

/***/ }),

/***/ 111:
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncatched exception popping up in devtools
	return Promise.resolve().then(function() {
		throw new Error("Cannot find module '" + req + "'.");
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = 111;

/***/ }),

/***/ 152:
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncatched exception popping up in devtools
	return Promise.resolve().then(function() {
		throw new Error("Cannot find module '" + req + "'.");
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = 152;

/***/ }),

/***/ 203:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return HomePage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__ionic_native_date_picker__ = __webpack_require__(198);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__ionic_native_photo_library__ = __webpack_require__(196);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__providers_sql_storage_sql_storage__ = __webpack_require__(101);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__ionic_native_local_notifications__ = __webpack_require__(51);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__ionic_native_background_mode__ = __webpack_require__(199);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__ionic_native_file__ = __webpack_require__(201);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__ionic_native_image_picker__ = __webpack_require__(202);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};











var HomePage = /** @class */ (function () {
    function HomePage(navCtrl, photoLibrary, sqlStorage, localNotifications, datePicker, loadingController, toastController, backgroundMode, events, file, alertCtrl, imagePicker) {
        var _this = this;
        this.navCtrl = navCtrl;
        this.photoLibrary = photoLibrary;
        this.sqlStorage = sqlStorage;
        this.localNotifications = localNotifications;
        this.datePicker = datePicker;
        this.loadingController = loadingController;
        this.toastController = toastController;
        this.backgroundMode = backgroundMode;
        this.events = events;
        this.file = file;
        this.alertCtrl = alertCtrl;
        this.imagePicker = imagePicker;
        this.constPathForDailyWishes = "DailyWishesAppData";
        this.GoodMorning = { Time: "00:00", Count: 0, Current: 0 };
        this.GoodAfternoon = { Time: "00:00", Count: 0, Current: 0 };
        this.GoodEvening = { Time: "00:00", Count: 0, Current: 0 };
        this.GoodNight = { Time: "00:00", Count: 0, Current: 0 };
        this.ScheduleDate = "Never";
        this.OneTimeEvents = [];
        events.subscribe('scheduleTomorrow', function (data) {
            _this.loadData(false).then(function () { return _this.schedule(1); });
        });
        events.subscribe('loadData', function (data) {
            _this.loadData(false);
        });
    }
    HomePage.prototype.loadMedia = function () {
        var _this = this;
        var that = this;
        var loader = this.loadingController.create({
            content: 'Loading Photos...'
        });
        this.photoLibrary.requestAuthorization().then(function () {
            loader.present().then(function () {
                console.log("Subscribing photoLibrary");
                _this.photoLibrary.getLibrary().subscribe({
                    next: function (library) {
                        console.log("starting Library ForEach");
                        library.forEach(function (libraryItem) {
                            console.log(libraryItem.photoURL);
                            if (libraryItem.photoURL.indexOf(that.constPathForDailyWishes) > -1) {
                                console.log(libraryItem.photoURL);
                                if (libraryItem.photoURL.indexOf("Morning") > -1)
                                    that.sqlStorage.saveData(libraryItem, "GoodMorning");
                                else if (libraryItem.photoURL.indexOf("Afternoon") > -1)
                                    that.sqlStorage.saveData(libraryItem, "GoodAfternoon");
                                else if (libraryItem.photoURL.indexOf("Evening") > -1)
                                    that.sqlStorage.saveData(libraryItem, "GoodEvening");
                                else if (libraryItem.photoURL.indexOf("Night") > -1)
                                    that.sqlStorage.saveData(libraryItem, "GoodNight");
                            }
                        });
                        _this.sqlStorage.initializeTableIndexes().then(function () {
                            _this.loadData(true);
                            loader.dismiss();
                            var toast = _this.toastController.create({
                                message: 'Photos Loaded',
                                duration: 2000,
                                position: 'bottom'
                            });
                            toast.present();
                        });
                    },
                    error: function () { console.log('could not get photos'); loader.dismiss(); },
                    complete: function () {
                        console.log('done getting photos');
                    }
                });
            });
        })
            .catch(function () { return alert('Permission wasn\'t granted'); });
    };
    HomePage.prototype.setMorningTime = function () {
        var _this = this;
        this.datePicker.show({
            date: new Date(),
            mode: 'time',
            androidTheme: this.datePicker.ANDROID_THEMES.THEME_HOLO_DARK
        }).then(function (time) { return _this.GoodMorning.Time = ("0" + time.getHours()).slice(-2) + ":" + ("0" + time.getMinutes()).slice(-2); }, function (err) { return console.log('Error occurred while getting date: ', err); });
    };
    HomePage.prototype.setAfternoonTime = function () {
        var _this = this;
        this.datePicker.show({
            date: new Date(),
            mode: 'time',
            androidTheme: this.datePicker.ANDROID_THEMES.THEME_HOLO_DARK
        }).then(function (time) { return _this.GoodAfternoon.Time = ("0" + time.getHours()).slice(-2) + ":" + ("0" + time.getMinutes()).slice(-2); }, function (err) { return console.log('Error occurred while getting date: ', err); });
    };
    HomePage.prototype.setEveningTime = function () {
        var _this = this;
        this.datePicker.show({
            date: new Date(),
            mode: 'time',
            androidTheme: this.datePicker.ANDROID_THEMES.THEME_HOLO_DARK
        }).then(function (time) { return _this.GoodEvening.Time = ("0" + time.getHours()).slice(-2) + ":" + ("0" + time.getMinutes()).slice(-2); }, function (err) { return console.log('Error occurred while getting date: ', err); });
    };
    HomePage.prototype.setNightTime = function () {
        var _this = this;
        this.datePicker.show({
            date: new Date(),
            mode: 'time',
            androidTheme: this.datePicker.ANDROID_THEMES.THEME_HOLO_DARK
        }).then(function (time) { return _this.GoodNight.Time = ("0" + time.getHours()).slice(-2) + ":" + ("0" + time.getMinutes()).slice(-2); }, function (err) { return console.log('Error occurred while getting date: ', err); });
    };
    HomePage.prototype.schedule = function (addDays) {
        var _this = this;
        var that = this;
        var today = new Date();
        if (addDays == 0 && (this.GoodMorning.Time != '00:00' || this.GoodAfternoon.Time != '00:00'
            || this.GoodEvening.Time != '00:00' || this.GoodNight.Time != '00:00')
            && this.todayPassed(this.GoodMorning.Time, this.GoodAfternoon.Time, this.GoodEvening.Time, this.GoodNight.Time)) {
            console.log("Preparing to schedule for tomorrow as today is over`");
            addDays = 1;
        }
        today.setDate(today.getDate() + addDays);
        var todayString = today.toISOString().substr(0, 11);
        this.sqlStorage.updateNotificationSchedule(this.GoodMorning.Time, this.GoodAfternoon.Time, this.GoodEvening.Time, this.GoodNight.Time)
            .then(function () {
            that.scheduleNotification(1991, 'Morning', todayString, that.GoodMorning.Time, 'Send Good Morning !');
            that.scheduleNotification(1992, 'Afternoon', todayString, that.GoodAfternoon.Time, 'Send Good Afternoon !');
            that.scheduleNotification(1993, 'Evening', todayString, that.GoodEvening.Time, 'Send Good Evening !');
            that.scheduleNotification(1994, 'Night', todayString, that.GoodNight.Time, 'Send Good Night !');
            //One time events
            _this.OneTimeEvents.forEach(function (element) {
                var eventDateArray = element.ScheduleDate.split("/");
                var eventDate = eventDateArray[2] + "-" + ('0' + (parseInt(eventDateArray[1], 10) - 1)).slice(-2) + "-" + ('0' + eventDateArray[0]).slice(-2) + "T";
                var eventTime = element.Time.toUpperCase().indexOf('M') > -1 ? _this.time12to24hour(element.Time.toUpperCase()) : element.Time;
                _this.scheduleNotification((3018 + parseInt(element.Id, 10)), (3018 + parseInt(element.Id, 10)), eventDate, eventTime, element.Text);
            });
            var toast = that.toastController.create({
                message: 'Reminder Set.',
                duration: 2000,
                position: 'bottom'
            });
            that.loadData(false);
            toast.present();
            that.backgroundMode.enable();
        })
            .catch(function (e) { return console.error("Error: " + JSON.stringify(e)); });
    };
    HomePage.prototype.scheduleNotification = function (notificationId, key, triggerDate, triggerTime, notificationText) {
        var that = this;
        var soundPath = 'file://audio/notification.mp3';
        //var soundPath = 'file://android_asset/www/assets/sounds/notification.mp3';
        this.localNotifications.isScheduled(notificationId).then(function (isScheduled) {
            console.log('notificationId = ' + notificationId + ', isScheduled = ' + isScheduled + ', key = ' + key + ', triggerDate = ' + triggerDate + ', triggerTime = ' + triggerTime);
            if (isScheduled && triggerTime != '00:00') {
                that.localNotifications.update({
                    id: notificationId,
                    trigger: { at: new Date(triggerDate + triggerTime) },
                    sound: soundPath,
                    vibrate: true,
                    priority: 2,
                    data: { type: key }
                });
            }
            else if (!isScheduled && triggerTime != '00:00') {
                that.localNotifications.schedule({
                    id: notificationId,
                    text: notificationText,
                    trigger: { at: new Date(triggerDate + triggerTime) },
                    //trigger: {firstAt: new Date(todayString + that.GoodMorning.Time), every: ELocalNotificationTriggerUnit.MINUTE},
                    sound: soundPath,
                    vibrate: true,
                    priority: 2,
                    data: { type: key }
                });
            }
            else if (isScheduled && triggerTime == '00:00') {
                console.log("Cancelling schedule for : " + key);
                that.localNotifications.cancel(notificationId);
            }
        });
    };
    HomePage.prototype.clearSchedule = function () {
        var that = this;
        var toast = that.toastController.create({
            message: 'All scheduled notifications cleared.',
            duration: 2000,
            position: 'bottom'
        });
        var alert = this.alertCtrl.create({
            title: 'Confirm Schedule Clear?',
            message: 'This will clear all scheduled notifications you have set. Continue?',
            buttons: [
                {
                    text: 'No',
                    role: 'cancel',
                    handler: function () {
                        console.log('Cancel clicked');
                    }
                },
                {
                    text: 'Yes',
                    handler: function () {
                        // that.GoodMorning.Time = "06:30"; that.GoodAfternoon.Time = "12:00"; that.GoodEvening.Time = "17:30"; that.GoodNight.Time = "20:30"; 
                        that.ScheduleDate = "Never";
                        // that.sqlStorage.updateNotificationSchedule(that.GoodMorning.Time, that.GoodAfternoon.Time, that.GoodEvening.Time, that.GoodNight.Time)
                        // .then(() => {
                        that.localNotifications.cancelAll();
                        toast.present();
                        that.loadData(false);
                        // })
                        // .catch(e => console.error("Error: " + JSON.stringify(e)));
                    }
                }
            ]
        });
        alert.present();
    };
    HomePage.prototype.loadData = function (showToast) {
        var _this = this;
        var toast = this.toastController.create({
            message: 'Data Loaded.',
            duration: 2000,
            position: 'bottom'
        });
        return this.sqlStorage.getData().then(function (data) {
            _this.GoodMorning = data.Morning;
            _this.GoodAfternoon = data.Afternoon;
            _this.GoodEvening = data.Evening;
            _this.GoodNight = data.Night;
            _this.localNotifications.getAll()
                .then(function (scheduleData) {
                console.log(JSON.stringify(scheduleData));
                if (scheduleData.length > 0) {
                    var scheduledDates = scheduleData.map(function (s) { return new Date(s.trigger.at); });
                    scheduledDates.sort();
                    var minutes = ('0' + scheduledDates[0].getMinutes()).slice(-2);
                    var hours = scheduledDates[0].getHours();
                    var ampm = hours >= 12 ? 'pm' : 'am';
                    hours = hours % 12;
                    hours = hours ? hours : 12; //otherwise for 12 pm in afternoon it will show 0 pm
                    _this.ScheduleDate = scheduledDates[0].getDate() + "/" + (scheduledDates[0].getMonth() + 1) + "/" + scheduledDates[0].getFullYear()
                        + ", " + hours + ":" + minutes + " " + ampm;
                }
                else {
                    _this.ScheduleDate = "Never";
                }
                if (showToast) {
                    toast.present();
                }
            })
                .catch(function (e) { return console.log("Error : " + JSON.stringify(e)); });
            //Fetch one time events now
            _this.sqlStorage.getOneTimeEvents()
                .then(function (data) {
                _this.OneTimeEvents = data;
            })
                .catch(function (e) { return console.log("Error : " + JSON.stringify(e)); });
        });
    };
    HomePage.prototype.refreshData = function (refresher) {
        this.loadData(true).then(function () { return refresher.complete(); });
    };
    HomePage.prototype.whatsappShare = function (type) {
        this.sqlStorage.SendWish("Good" + type, type, false);
    };
    HomePage.prototype.exportDB = function () {
        var that = this;
        var toast = that.toastController.create({
            message: 'Backup Complete.',
            duration: 2000,
            position: 'bottom'
        });
        var loader = this.loadingController.create({
            content: 'Starting Backup...'
        });
        loader.present().then(function () {
            that.sqlStorage.exportDB().then(function (sql) {
                that.file.writeFile("file:///storage/emulated/0/DailyWishesAppData/", "DatabaseBackup.dat", sql, { replace: true })
                    .then(function (res) {
                    loader.dismiss();
                    toast.present();
                })
                    .catch(function (e) { console.error("Error: " + JSON.stringify(e)); loader.dismiss(); });
            })
                .catch(function (e) { console.error("Error: " + JSON.stringify(e)); loader.dismiss(); });
        });
    };
    HomePage.prototype.importDB = function () {
        var that = this;
        var toast = that.toastController.create({
            message: 'Database Restore Complete.',
            duration: 2000,
            position: 'bottom'
        });
        var loader = this.loadingController.create({
            content: 'Restoring Database...'
        });
        var alert = this.alertCtrl.create({
            title: 'Confirm DB Restore?',
            message: 'This will overwrite current database. Do you want to proceed?',
            buttons: [
                {
                    text: 'No',
                    role: 'cancel',
                    handler: function () {
                        console.log('Cancel clicked');
                    }
                },
                {
                    text: 'Yes',
                    handler: function () {
                        loader.present().then(function () {
                            that.file.readAsText("file:///storage/emulated/0/DailyWishesAppData/", "DatabaseBackup.dat").then(function (sql) {
                                that.sqlStorage.importDB(sql)
                                    .then(function (res) {
                                    that.sqlStorage.getData().then(function (data) {
                                        that.GoodMorning = data.Morning;
                                        that.GoodAfternoon = data.Afternoon;
                                        that.GoodEvening = data.Evening;
                                        that.GoodNight = data.Night;
                                        loader.dismiss();
                                        toast.present();
                                    });
                                })
                                    .catch(function (e) { console.error("Error: " + JSON.stringify(e)); loader.dismiss(); });
                            })
                                .catch(function (e) { console.error("Error: " + JSON.stringify(e)); loader.dismiss(); });
                        });
                    }
                }
            ]
        });
        alert.present();
    };
    HomePage.prototype.todayPassed = function (morning, afternoon, evening, night) {
        var today = new Date();
        var todayEpochTime = new Date('1990/01/01 ' + ("0" + today.getHours()).slice(-2) + ":" + ("0" + today.getMinutes()).slice(-2));
        var morningEpochTime = new Date('1990/01/01 ' + morning);
        var afternoonEpochTime = new Date('1990/01/01 ' + afternoon);
        var eveningEpochTime = new Date('1990/01/01 ' + evening);
        var nightEpochTime = new Date('1990/01/01 ' + night);
        if ((morning == '00:00' || todayEpochTime > morningEpochTime)
            && (afternoon == '00:00' || todayEpochTime > afternoonEpochTime)
            && (evening == '00:00' || todayEpochTime > eveningEpochTime)
            && (night == '00:00' || todayEpochTime > nightEpochTime)) {
            return true;
        }
        return false;
    };
    HomePage.prototype.addOneTimeEvent = function () {
        var today = new Date();
        var minutes = ('0' + today.getMinutes()).slice(-2);
        var hours = today.getHours();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; //otherwise for 12 pm in afternoon it will show 0 pm
        var timeValue = hours + ":" + minutes + " " + ampm;
        var dateValue = today.getDate() + "/" + (today.getMonth() + 1) + "/" + today.getFullYear();
        var eventData = { Id: 0, Text: "Title", ScheduleDate: dateValue, Time: timeValue, ImagePath: "" };
        this.OneTimeEvents.unshift(eventData);
    };
    HomePage.prototype.pickOneImageOTE = function (eventData) {
        var _this = this;
        this.imagePicker.requestReadPermission().then(function () {
            _this.imagePicker.getPictures({ "outputType": 1, "maximumImagesCount": 1 }).then(function (results) {
                for (var i = 0; i < 1; i++) {
                    console.log(results[i]);
                    var objIndex = _this.OneTimeEvents.findIndex((function (obj) { return obj.Id == eventData.Id; }));
                    _this.OneTimeEvents[objIndex].ImagePath = results[i];
                    console.log(_this.OneTimeEvents[objIndex].ImagePath);
                }
            }, function (err) { console.log(JSON.stringify(err)); });
        })
            .catch(function () { return alert('Permission wasn\'t granted'); });
    };
    HomePage.prototype.setTitleOTE = function (eventData, text) {
        var objIndex = this.OneTimeEvents.findIndex((function (obj) { return obj.Id == eventData.Id; }));
        this.OneTimeEvents[objIndex].Text = text;
    };
    HomePage.prototype.setDateOTE = function (eventData) {
        var _this = this;
        var objIndex = this.OneTimeEvents.findIndex((function (obj) { return obj.Id == eventData.Id; }));
        this.datePicker.show({
            date: new Date(),
            mode: 'date',
            androidTheme: this.datePicker.ANDROID_THEMES.THEME_HOLO_DARK
        }).then(function (date) { return _this.OneTimeEvents[objIndex].ScheduleDate = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear(); }, function (err) { return console.log('Error occurred while getting date: ', err); });
    };
    HomePage.prototype.setTimeOTE = function (eventData) {
        var _this = this;
        var objIndex = this.OneTimeEvents.findIndex((function (obj) { return obj.Id == eventData.Id; }));
        this.datePicker.show({
            date: new Date(),
            mode: 'time',
            androidTheme: this.datePicker.ANDROID_THEMES.THEME_HOLO_DARK
        }).then(function (time) { return _this.OneTimeEvents[objIndex].Time = ("0" + time.getHours()).slice(-2) + ":" + ("0" + time.getMinutes()).slice(-2); }, function (err) { return console.log('Error occurred while getting date: ', err); });
    };
    HomePage.prototype.deleteOTE = function (eventData) {
        var that = this;
        var toast = that.toastController.create({
            message: 'Event deleted.',
            duration: 2000,
            position: 'bottom'
        });
        var alert = this.alertCtrl.create({
            title: 'Confirm event delete?',
            message: 'Are you sure you want to delete this event permanently?',
            buttons: [
                {
                    text: 'No',
                    role: 'cancel',
                    handler: function () {
                        console.log('Cancel clicked');
                    }
                },
                {
                    text: 'Yes',
                    handler: function () {
                        that.sqlStorage.deleteOTE(eventData.Id)
                            .then(function () {
                            that.OneTimeEvents = that.OneTimeEvents.filter(function (obj) {
                                return obj.Id !== eventData.Id;
                            });
                            that.localNotifications.cancel(parseInt(eventData.Id, 10) + 3018);
                            toast.present();
                        })
                            .catch(function (e) { console.error("Error: " + JSON.stringify(e)); });
                    }
                }
            ]
        });
        alert.present();
    };
    HomePage.prototype.scheduleOTE = function () {
        var _this = this;
        var toast = this.toastController.create({
            message: 'One time events set.',
            duration: 2000,
            position: 'bottom'
        });
        this.sqlStorage.SaveOneTimeEvent(this.OneTimeEvents)
            .then(function (data) {
            _this.OneTimeEvents = data;
            console.log(_this.OneTimeEvents);
            _this.OneTimeEvents.forEach(function (element) {
                var eventDateArray = element.ScheduleDate.split("/");
                var eventDate = eventDateArray[2] + "-" + ('0' + eventDateArray[1]).slice(-2) + "-" + ('0' + eventDateArray[0]).slice(-2) + "T";
                var eventTime = element.Time.toUpperCase().indexOf('M') > -1 ? _this.time12to24hour(element.Time.toUpperCase()) : element.Time;
                _this.scheduleNotification((3018 + parseInt(element.Id, 10)), (3018 + parseInt(element.Id, 10)), eventDate, eventTime, element.Text);
            });
            toast.present();
        })
            .catch(function (e) { console.error("Error: " + JSON.stringify(e)); });
    };
    HomePage.prototype.time12to24hour = function (time) {
        var hours = Number(time.match(/^(\d+)/)[1]);
        var minutes = Number(time.match(/:(\d+)/)[1]);
        var AMPM = time.match(/\s(.*)$/)[1];
        if (AMPM == "PM" && hours < 12)
            hours = hours + 12;
        if (AMPM == "AM" && hours == 12)
            hours = hours - 12;
        var sHours = hours.toString();
        var sMinutes = minutes.toString();
        if (hours < 10)
            sHours = "0" + sHours;
        if (minutes < 10)
            sMinutes = "0" + sMinutes;
        return sHours + ":" + sMinutes;
    };
    HomePage = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["m" /* Component */])({
            selector: 'page-home',template:/*ion-inline-start:"C:\Users\kumarp\Music\DailyWishes\src\pages\home\home.html"*/'<ion-header>\n  <ion-navbar color="secondary">\n    <ion-title>\n      Daily Wishes\n    </ion-title>\n  </ion-navbar>\n</ion-header>\n\n<ion-content>\n  <!-- <ion-refresher (ionRefresh)="refreshData($event)">\n      <ion-refresher-content\n      pullingIcon="arrow-dropdown"\n      pullingText="Pull to reload data"\n      refreshingSpinner="circles"\n      refreshingText="Loading...">\n    </ion-refresher-content>\n  </ion-refresher> -->\n  \n  <ion-slides pager style="height: 85%">\n    <ion-slide>\n        <ion-card style="height: 91%;">\n            <ion-card-header style=\'background-color:#1f803c;\'>\n                <h1 style="color: white"><b>Recurring events</b></h1>\n              </ion-card-header>\n            <ion-card-content>\n              <ion-row>\n                <ion-col col-6>\n                  <button ion-button outline style="width:95%"  (click)="loadMedia()">Load Photos</button>\n                </ion-col>\n                <ion-col col-3 text-center>\n                  <h2><b>Time</b></h2>\n                </ion-col>\n                <ion-col col-3 text-center>\n                  <h2><b>Images</b></h2>\n                </ion-col>\n              </ion-row>\n              <ion-row>\n                <button style="width:10%" ion-button icon-only outline (click)="whatsappShare(\'Morning\')"><ion-icon name="logo-whatsapp"></ion-icon></button>\n                <button style="width:87%"  ion-button outline (click)="setMorningTime()">\n                  <ion-col col-6 text-left>          \n                    <h2>Morning</h2>\n                  </ion-col>\n                  <ion-col col-3 text-center>\n                    <h2>{{GoodMorning.Time}}</h2>\n                  </ion-col>\n                  <ion-col col-3 text-right>\n                    <h2>{{GoodMorning.Current}}/{{GoodMorning.Count}}</h2>\n                  </ion-col>\n                </button>\n              </ion-row>\n              <ion-row>\n                <button style="width:10%" ion-button icon-only outline (click)="whatsappShare(\'Afternoon\')"><ion-icon name="logo-whatsapp"></ion-icon></button>\n                <button style="width:87%"  ion-button outline (click)="setAfternoonTime()">\n                  <ion-col col-6 text-left>          \n                    <h2>Afternoon</h2>\n                  </ion-col>\n                  <ion-col col-3 text-center>\n                    <h2>{{GoodAfternoon.Time}}</h2>\n                  </ion-col>\n                  <ion-col col-3 text-right>\n                    <h2>{{GoodAfternoon.Current}}/{{GoodAfternoon.Count}}</h2>\n                  </ion-col>\n                </button>\n              </ion-row>\n              <ion-row>\n                <button style="width:10%" ion-button icon-only outline (click)="whatsappShare(\'Evening\')"><ion-icon name="logo-whatsapp"></ion-icon></button>\n                <button style="width:87%"  ion-button outline (click)="setEveningTime()">\n                  <ion-col col-6 text-left>          \n                    <h2>Evening</h2>\n                  </ion-col>\n                  <ion-col col-3 text-center>\n                    <h2>{{GoodEvening.Time}}</h2>\n                  </ion-col>\n                  <ion-col col-3 text-right>\n                    <h2>{{GoodEvening.Current}}/{{GoodEvening.Count}}</h2>\n                  </ion-col>\n                </button>\n              </ion-row>\n              <ion-row>\n                <button style="width:10%" ion-button icon-only outline (click)="whatsappShare(\'Night\')"><ion-icon name="logo-whatsapp"></ion-icon></button>\n                <button style="width:87%"  ion-button outline (click)="setNightTime()">\n                  <ion-col col-6 text-left>          \n                    <h2>Night</h2>\n                  </ion-col>\n                  <ion-col col-3 text-center>\n                    <h2>{{GoodNight.Time}}</h2>\n                  </ion-col>\n                  <ion-col col-3 text-right>\n                    <h2>{{GoodNight.Current}}/{{GoodNight.Count}}</h2>\n                  </ion-col>\n                </button>\n              </ion-row>\n              <ion-row>\n                <ion-col col-6>\n                    <button ion-button round style="width:100%" (click)="schedule(0)">Schedule</button>\n                </ion-col>\n                <ion-col col-6>\n                    <button ion-button round style="width:100%" (click)="clearSchedule()">Clear Schedules</button><br/>\n                </ion-col>\n              </ion-row>\n              <br/>\n            </ion-card-content>\n          </ion-card>\n    </ion-slide>\n    \n    <ion-slide >\n        <ion-card style="height: 91%;">\n          <ion-card-header style=\'background-color:#1f803c;\'>\n            <h1 style="color: white"><b>One time events</b></h1>\n          </ion-card-header>\n          <ion-card-content>\n              <ion-scroll scrollY="true"> \n              <ion-list>\n                  <ion-item-group style="border: #488aff solid; margin-top: 5px" *ngFor="let oneEvent of OneTimeEvents">\n                    <ion-item-divider color="primary">\n                      <!-- <ion-input value={{oneEvent.Id}}.{{oneEvent.Text}} (input)="setTitleOTE(oneEvent, $event.target.value)"></ion-input> -->\n                      <ion-icon item-right name="trash" (click)="deleteOTE(oneEvent)"></ion-icon>\n                    </ion-item-divider>\n                    <ion-row>\n                      <ion-col col-7>\n                          <button style="width: 95%" ion-button outline (click)="setDateOTE(oneEvent)">\n                              <h2>Date : {{oneEvent.ScheduleDate}}</h2>\n                          </button>\n                          <button style="width: 95%" ion-button outline (click)="setTimeOTE(oneEvent)">\n                              <h2>Time : {{oneEvent.Time}}</h2>\n                          </button>\n                      </ion-col>\n                      <ion-col col-5>\n                          <button style="width: 95%; height: 90%; border:solid blue" ion-button outline (click)="pickOneImageOTE(oneEvent)">\n                            <img width="75px" height="75px" src="data:image/png;base64,{{oneEvent.ImagePath}}" alt="Image">\n                          </button>\n                      </ion-col>\n                    </ion-row>\n                  </ion-item-group>\n                </ion-list>\n              </ion-scroll>\n              <ion-row>\n                <ion-col col-6>\n                    <button ion-button round style="width:100%" (click)="scheduleOTE()">Save Events</button>\n                </ion-col>\n                <ion-col col-6>\n                    <button ion-button round style="width:100%" (click)="addOneTimeEvent()">Add New</button>\n                </ion-col>\n              </ion-row>\n          </ion-card-content>\n        </ion-card>\n    </ion-slide>\n  </ion-slides>\n  \n  \n  <br/>\n  <ion-row>\n    <ion-col col-6>\n        <button ion-button round style="width:90%" (click)="exportDB()">Export DB</button>\n    </ion-col>\n    <ion-col col-6 text-right>\n        <button ion-button round style="width:90%" (click)="importDB()">Import DB</button><br/>\n    </ion-col>\n  </ion-row>  \n</ion-content>\n<ion-footer>\n  <ion-toolbar>\n    <ion-title text-center>Next notification  :  {{ScheduleDate}}</ion-title>\n  </ion-toolbar>\n</ion-footer>\n'/*ion-inline-end:"C:\Users\kumarp\Music\DailyWishes\src\pages\home\home.html"*/
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["g" /* NavController */], __WEBPACK_IMPORTED_MODULE_3__ionic_native_photo_library__["a" /* PhotoLibrary */],
            __WEBPACK_IMPORTED_MODULE_4__providers_sql_storage_sql_storage__["a" /* SqlStorageProvider */], __WEBPACK_IMPORTED_MODULE_5__ionic_native_local_notifications__["a" /* LocalNotifications */],
            __WEBPACK_IMPORTED_MODULE_2__ionic_native_date_picker__["a" /* DatePicker */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["f" /* LoadingController */],
            __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["i" /* ToastController */], __WEBPACK_IMPORTED_MODULE_6__ionic_native_background_mode__["a" /* BackgroundMode */],
            __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["b" /* Events */], __WEBPACK_IMPORTED_MODULE_7__ionic_native_file__["a" /* File */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["a" /* AlertController */],
            __WEBPACK_IMPORTED_MODULE_8__ionic_native_image_picker__["a" /* ImagePicker */]])
    ], HomePage);
    return HomePage;
}());

//# sourceMappingURL=home.js.map

/***/ }),

/***/ 204:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser_dynamic__ = __webpack_require__(205);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__app_module__ = __webpack_require__(227);


Object(__WEBPACK_IMPORTED_MODULE_0__angular_platform_browser_dynamic__["a" /* platformBrowserDynamic */])().bootstrapModule(__WEBPACK_IMPORTED_MODULE_1__app_module__["a" /* AppModule */]);
//# sourceMappingURL=main.js.map

/***/ }),

/***/ 227:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppModule; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser__ = __webpack_require__(32);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_ionic_angular__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__ionic_native_splash_screen__ = __webpack_require__(192);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__ionic_native_status_bar__ = __webpack_require__(194);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__ionic_native_social_sharing__ = __webpack_require__(195);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__ionic_native_photo_library__ = __webpack_require__(196);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__ionic_native_sqlite__ = __webpack_require__(197);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__ionic_native_local_notifications__ = __webpack_require__(51);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__ionic_native_date_picker__ = __webpack_require__(198);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__ionic_native_background_mode__ = __webpack_require__(199);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__ionic_native_sqlite_porter__ = __webpack_require__(200);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__ionic_native_file__ = __webpack_require__(201);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_13__ionic_native_image_picker__ = __webpack_require__(202);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_14__app_component__ = __webpack_require__(277);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_15__pages_home_home__ = __webpack_require__(203);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_16__providers_sql_storage_sql_storage__ = __webpack_require__(101);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};


















var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_1__angular_core__["I" /* NgModule */])({
            declarations: [
                __WEBPACK_IMPORTED_MODULE_14__app_component__["a" /* MyApp */],
                __WEBPACK_IMPORTED_MODULE_15__pages_home_home__["a" /* HomePage */]
            ],
            imports: [
                __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser__["a" /* BrowserModule */],
                __WEBPACK_IMPORTED_MODULE_2_ionic_angular__["e" /* IonicModule */].forRoot(__WEBPACK_IMPORTED_MODULE_14__app_component__["a" /* MyApp */], {}, {
                    links: []
                })
            ],
            bootstrap: [__WEBPACK_IMPORTED_MODULE_2_ionic_angular__["c" /* IonicApp */]],
            entryComponents: [
                __WEBPACK_IMPORTED_MODULE_14__app_component__["a" /* MyApp */],
                __WEBPACK_IMPORTED_MODULE_15__pages_home_home__["a" /* HomePage */]
            ],
            providers: [
                __WEBPACK_IMPORTED_MODULE_4__ionic_native_status_bar__["a" /* StatusBar */],
                __WEBPACK_IMPORTED_MODULE_3__ionic_native_splash_screen__["a" /* SplashScreen */],
                __WEBPACK_IMPORTED_MODULE_5__ionic_native_social_sharing__["a" /* SocialSharing */],
                __WEBPACK_IMPORTED_MODULE_6__ionic_native_photo_library__["a" /* PhotoLibrary */],
                __WEBPACK_IMPORTED_MODULE_7__ionic_native_sqlite__["a" /* SQLite */],
                __WEBPACK_IMPORTED_MODULE_8__ionic_native_local_notifications__["a" /* LocalNotifications */],
                __WEBPACK_IMPORTED_MODULE_9__ionic_native_date_picker__["a" /* DatePicker */],
                __WEBPACK_IMPORTED_MODULE_10__ionic_native_background_mode__["a" /* BackgroundMode */],
                __WEBPACK_IMPORTED_MODULE_11__ionic_native_sqlite_porter__["a" /* SQLitePorter */],
                __WEBPACK_IMPORTED_MODULE_12__ionic_native_file__["a" /* File */],
                __WEBPACK_IMPORTED_MODULE_2_ionic_angular__["a" /* AlertController */],
                __WEBPACK_IMPORTED_MODULE_13__ionic_native_image_picker__["a" /* ImagePicker */],
                { provide: __WEBPACK_IMPORTED_MODULE_1__angular_core__["u" /* ErrorHandler */], useClass: __WEBPACK_IMPORTED_MODULE_2_ionic_angular__["d" /* IonicErrorHandler */] },
                __WEBPACK_IMPORTED_MODULE_16__providers_sql_storage_sql_storage__["a" /* SqlStorageProvider */]
            ]
        })
    ], AppModule);
    return AppModule;
}());

//# sourceMappingURL=app.module.js.map

/***/ }),

/***/ 277:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return MyApp; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__ionic_native_status_bar__ = __webpack_require__(194);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__ionic_native_splash_screen__ = __webpack_require__(192);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__providers_sql_storage_sql_storage__ = __webpack_require__(101);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__ionic_native_local_notifications__ = __webpack_require__(51);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__pages_home_home__ = __webpack_require__(203);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};








var MyApp = /** @class */ (function () {
    function MyApp(platform, statusBar, splashScreen, sqlStorage, localNotifications, events) {
        var _this = this;
        this.sqlStorage = sqlStorage;
        this.localNotifications = localNotifications;
        this.events = events;
        this.rootPage = __WEBPACK_IMPORTED_MODULE_6__pages_home_home__["a" /* HomePage */];
        platform.ready().then(function () {
            statusBar.styleDefault();
            splashScreen.hide();
            sqlStorage.initializeDatabase().then(function () {
                _this.rootPage = __WEBPACK_IMPORTED_MODULE_6__pages_home_home__["a" /* HomePage */];
                _this.events.publish('loadData', null);
            });
            _this.bindNotificationEvent();
        });
    }
    MyApp.prototype.bindNotificationEvent = function () {
        var _this = this;
        this.localNotifications.on('click').subscribe(function (result) { return _this.ShareOnWhatsapp(result.data.type); });
    };
    MyApp.prototype.ShareOnWhatsapp = function (type) {
        console.log("Notification Trigger");
        if (this.isInt(type))
            this.sqlStorage.SendOneTimeWish(parseInt(type, 10) - 3018, true);
        else
            this.sqlStorage.SendWish("Good" + type, type, true);
    };
    MyApp.prototype.isInt = function (value) {
        return !isNaN(value) &&
            parseInt(value) == value &&
            !isNaN(parseInt(value, 10));
    };
    MyApp = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["m" /* Component */])({template:/*ion-inline-start:"C:\Users\kumarp\Music\DailyWishes\src\app\app.html"*/'<ion-nav [root]="rootPage"></ion-nav>\n'/*ion-inline-end:"C:\Users\kumarp\Music\DailyWishes\src\app\app.html"*/
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["h" /* Platform */], __WEBPACK_IMPORTED_MODULE_2__ionic_native_status_bar__["a" /* StatusBar */], __WEBPACK_IMPORTED_MODULE_3__ionic_native_splash_screen__["a" /* SplashScreen */],
            __WEBPACK_IMPORTED_MODULE_4__providers_sql_storage_sql_storage__["a" /* SqlStorageProvider */], __WEBPACK_IMPORTED_MODULE_5__ionic_native_local_notifications__["a" /* LocalNotifications */],
            __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["b" /* Events */]])
    ], MyApp);
    return MyApp;
}());

//# sourceMappingURL=app.component.js.map

/***/ })

},[204]);
//# sourceMappingURL=main.js.map