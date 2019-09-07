import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { SocialSharing } from '@ionic-native/social-sharing';
import { SQLitePorter } from '@ionic-native/sqlite-porter';
import { Events } from 'ionic-angular';
import { LocalNotifications } from '@ionic-native/local-notifications';

@Injectable()
export class SqlStorageProvider {

  private db: SQLiteObject;
  public nameOfImage:string = "";
  public scheduleData = {Morning: {Time:"00:00", Count:0, Current:0}, 
                    Afternoon: {Time:"00:00", Count:0, Current:0}, 
                    Evening: {Time:"00:00", Count:0, Current:0}, 
                    Night: {Time:"00:00", Count:0, Current:0}};
  public OneTimeEvents = [];

  constructor(private sqlite: SQLite, private sharingVar: SocialSharing,
    private sqlitePorter: SQLitePorter, private events: Events,
    private localNotifications: LocalNotifications,) {}

  initializeDatabase():Promise<any>{
    return this.sqlite.create({name: 'dailyWishes.db', location: 'default'})
    .then((db: SQLiteObject) => {
      console.log("db created");
      this.db = db;
      var sql = [];
      sql.push("CREATE TABLE IF NOT EXISTS TableIndexes(type TEXT, idx INTEGER, maxIdx INTEGER, notificationTime TEXT)");
      sql.push("CREATE TABLE IF NOT EXISTS GoodMorning(rowid INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, path TEXT, thumbnail TEXT)");
      sql.push("CREATE TABLE IF NOT EXISTS GoodAfternoon(rowid INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, path TEXT, thumbnail TEXT)");
      sql.push("CREATE TABLE IF NOT EXISTS GoodEvening(rowid INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, path TEXT, thumbnail TEXT)");
      sql.push("CREATE TABLE IF NOT EXISTS GoodNight(rowid INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, path TEXT, thumbnail TEXT)");
      sql.push("CREATE TABLE IF NOT EXISTS OneTimeEvents(rowid INTEGER PRIMARY KEY AUTOINCREMENT, eventTitle TEXT, eventDate TEXT, eventTime TEXT, imagePath TEXT)");
      this.db.sqlBatch(sql)
      .then(() => {console.log("Tables created"); this.initializeTableIndexes();})
      .catch(e => console.error("Error: " + JSON.stringify(e)))
    })
    .catch(e => console.error(JSON.stringify(e)));
  }

  initializeTableIndexes():Promise<any>{
    return this.db.executeSql("SELECT type FROM TableIndexes", [])
    .then(resultSet => {
      var sql = [];
      if(resultSet.rows.length > 0){
        console.log("Table already has data")  
        sql.push("UPDATE TableIndexes SET maxIdx = (SELECT COUNT(*) FROM GoodMorning) WHERE type='Morning'");
        sql.push("UPDATE TableIndexes SET maxIdx = (SELECT COUNT(*) FROM GoodAfternoon) WHERE type='Afternoon'");
        sql.push("UPDATE TableIndexes SET maxIdx = (SELECT COUNT(*) FROM GoodEvening) WHERE type='Evening'");
        sql.push("UPDATE TableIndexes SET maxIdx = (SELECT COUNT(*) FROM GoodNight) WHERE type='Night'");
      }
      else{
        console.log("Table is getting initialized for first time") 
        sql.push("INSERT INTO TableIndexes(type, idx, maxIdx, notificationTime) VALUES ('Morning',1,0,'06:30'), ('Afternoon',1,0,'12:00'), ('Evening',1,0,'17:30'), ('Night',1,0,'20:30')");
        sql.push("UPDATE TableIndexes SET maxIdx = (SELECT COUNT(*) FROM GoodMorning) WHERE type='Morning'");
        sql.push("UPDATE TableIndexes SET maxIdx = (SELECT COUNT(*) FROM GoodAfternoon) WHERE type='Afternoon'");
        sql.push("UPDATE TableIndexes SET maxIdx = (SELECT COUNT(*) FROM GoodEvening) WHERE type='Evening'");
        sql.push("UPDATE TableIndexes SET maxIdx = (SELECT COUNT(*) FROM GoodNight) WHERE type='Night'");
      }
      return this.db.sqlBatch(sql)
      .then(() => {console.log("Indexes Initialized"); Promise.resolve("Indexes Initialized")})
      .catch(e => {console.error("Error: " + JSON.stringify(e));Promise.reject("Indexes Initialized")})
    })
    .catch(e => {console.error("Error: " + JSON.stringify(e));Promise.reject("Indexes Initialized")});
  }

  getData():Promise<any>{
    var that = this;
    return this.sqlite.create({name: 'dailyWishes.db', location: 'default'})
    .then((db: SQLiteObject) => {
      this.db = db;
      return that.db.executeSql("SELECT * FROM TableIndexes",[])
      .then(resultSet => {
        for(var i=0; i< resultSet.rows.length; i++){
          switch(resultSet.rows.item(i).type) { 
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
        return Promise.resolve(that.scheduleData)
      })
      .catch(e => {console.error("Error: " + JSON.stringify(e)); return Promise.reject(that.scheduleData)});
    })
    .catch(e => console.error(JSON.stringify(e)));
  }

  SendWish(tableName, wishType, triggeredFromNotification){
    //if last notification then schedule for tomorrow
    this.localNotifications.getAll().then(scheduleData => { 
      if(triggeredFromNotification && scheduleData.length == 0)
        this.events.publish('scheduleTomorrow', null);
    });
    //send message on whatsapp
    this.sqlite.create({name: 'dailyWishes.db', location: 'default'})
    .then((db: SQLiteObject) => {
      this.db = db;
      this.getSingleData(tableName, wishType).then((nameOfImage) => {
        this.sharingVar.shareViaWhatsApp("Good " + wishType , "file:///storage/emulated/0/DailyWishesAppData/" + wishType + "/" + nameOfImage,  null)
          .then(()=>{ console.log("Success"); this.events.publish('loadData', null);},
          ()=>{ console.log("failed")})
      });
    })
  .catch(e => console.error(JSON.stringify(e)));
  }

  SendOneTimeWish(eventId, triggeredFromNotification){
    //if last notification then schedule for tomorrow
    this.localNotifications.getAll().then(scheduleData => { 
      if(triggeredFromNotification && scheduleData.length == 0)
        this.events.publish('scheduleTomorrow', null);
    });
    //send message on whatsapp
    this.sqlite.create({name: 'dailyWishes.db', location: 'default'})
    .then((db: SQLiteObject) => {
      this.db = db;
      this.getOTEData(eventId).then((message) => {
        this.sharingVar.shareViaWhatsApp(message , "Image", "data:image/png;base64," + this.nameOfImage)
          .then(()=>{ console.log("Success"); this.events.publish('loadData', null);},
          ()=>{ console.log("failed")})
      });
    })
  .catch(e => console.error(JSON.stringify(e)));
  }

  getSingleData(tableName, wishType) : Promise<any>{
    var that = this;
    return that.db.executeSql("SELECT * FROM " + tableName + " WHERE rowid = (SELECT idx from TableIndexes WHERE type = '" + wishType + "')",[])
    .then(single => {
      that.nameOfImage = single.rows.item(0).name;
      return this.db.executeSql("UPDATE TableIndexes SET idx = CASE WHEN idx = maxIdx THEN  1 ELSE idx+1 END WHERE type = '" + wishType + "'",[])
      .then(() => {return Promise.resolve(that.nameOfImage)})
      .catch(e => {console.error("Error: " + JSON.stringify(e)); return Promise.reject("")})
    })
    .catch(e => {console.error("Error: " + JSON.stringify(e)); return Promise.reject("")});
  }

  getOTEData(eventId) : Promise<any>{
    var that = this;
    console.log("rowid=",eventId);
    return that.db.executeSql("SELECT * FROM OneTimeEvents WHERE rowid = ?",[eventId])
    .then(single => {
      console.log(JSON.stringify(single));
      that.nameOfImage = single.rows.item(0).imagePath;
      return this.deleteOTE(eventId)
      .then(() => {return Promise.resolve(single.rows.item(0).eventTitle)})
      .catch(e => {console.error("Error: " + JSON.stringify(e)); return Promise.reject("")})
    })
    .catch(e => {console.error("Error: " + JSON.stringify(e)); return Promise.reject("")});
  }

  saveData(data, tableName) {
    this.db.executeSql('INSERT INTO ' + tableName + '(name, path, thumbnail) SELECT ?,?,? WHERE NOT EXISTS(SELECT 1 FROM ' + tableName + ' WHERE name = ?)',[data.fileName,data.photoURL,data.thumbnailURL,data.fileName])
      .then(res => 
        console.log(JSON.stringify(res)))
      .catch(e => console.error(JSON.stringify(e)));
  }

  updateNotificationSchedule(morning, afternoon,evening,night) : Promise<any>{
    var sql = [];
    sql.push("UPDATE TableIndexes SET notificationTime = '" + morning + "' WHERE type='Morning'");
    sql.push("UPDATE TableIndexes SET notificationTime = '" + afternoon + "' WHERE type='Afternoon'");
    sql.push("UPDATE TableIndexes SET notificationTime = '" + evening + "' WHERE type='Evening'");
    sql.push("UPDATE TableIndexes SET notificationTime = '" + night + "' WHERE type='Night'");
    return this.db.sqlBatch(sql)
      .then(() => {return Promise.resolve("Updated Schedule")})
      .catch(e => {console.error("Error: " + JSON.stringify(e)); return Promise.reject("")})
  }

  exportDB():Promise<any>{    
    return this.sqlitePorter.exportDbToSql(this.db)
    .then((res) => {console.log(JSON.stringify(res)); return Promise.resolve(res);})
    .catch(e => {console.error("Error: " + JSON.stringify(e)); return Promise.reject("")})
  }

  importDB(sql):Promise<any>{    
    return this.sqlitePorter.importSqlToDb(this.db,sql)
    .then((res) => {console.log(JSON.stringify(res)); return Promise.resolve(res);})
    .catch(e => {console.error("Error: " + JSON.stringify(e)); return Promise.reject("")})
  }
  
  SaveOneTimeEvent(oneTimeEvents):Promise<any>{
    console.log(oneTimeEvents);
    return this.sqlite.create({name: 'dailyWishes.db', location: 'default'})
    .then((db: SQLiteObject) => {
      this.db = db;
      oneTimeEvents.forEach(ote => {
        this.db.executeSql("SELECT eventTitle FROM OneTimeEvents where rowid = " + ote.Id, [])
        .then(resultSet => {
          if(resultSet.rows.length > 0){
            console.log("Table already has this one time event. Update it.");  
            this.db.executeSql("UPDATE OneTimeEvents SET eventTitle=?, eventDate=?, eventTime=?, imagePath=? WHERE rowid =?",[ote.Text,ote.ScheduleDate,ote.Time,ote.ImagePath,ote.Id]).catch(e => console.error(JSON.stringify(e)));
            //sql.push("UPDATE OneTimeEvents SET eventTitle = '" + ote.Text + "', eventDate = '" + ote.ScheduleDate + "', eventTime = '" + ote.Time + "', imagePath = '" + ote.ImagePath + "' where rowid = " + ote.Id);
          }
          else{
            console.log("Adding this one time event for first time");
            this.db.executeSql('INSERT INTO OneTimeEvents(eventTitle, eventDate, eventTime, imagePath) VALUES (?,?,?,?)',[ote.Text,ote.ScheduleDate,ote.Time,ote.ImagePath]).catch(e => console.error(JSON.stringify(e)));
            //sql.push("INSERT INTO OneTimeEvents(eventTitle, eventDate, eventTime, imagePath) VALUES ('" + ote.Text + "','" + ote.ScheduleDate + "','" + ote.Time + "','" + ote.ImagePath + "')");
          }
        });
      });
      return this.getOneTimeEvents();
      // console.log(sql);
      // return this.db.sqlBatch(sql)
      //   .then(() => {console.log("One time events set"); Promise.resolve("One time events set")})
      //   .catch(e => {console.error("Error: " + JSON.stringify(e));Promise.reject("Indexes Initialized")})
    })
    .catch(e => console.error(JSON.stringify(e)));
  }

  getOneTimeEvents():Promise<any>{
    var that = this;
    return this.sqlite.create({name: 'dailyWishes.db', location: 'default'})
    .then((db: SQLiteObject) => {
      this.db = db;
      return that.db.executeSql("SELECT * FROM OneTimeEvents",[])
      .then(resultSet => {
        for(var i=0; i< resultSet.rows.length; i++){
          var oneTimeEvent = {Id: resultSet.rows.item(i).rowid, Text: resultSet.rows.item(i).eventTitle, 
                              ScheduleDate: resultSet.rows.item(i).eventDate, Time : resultSet.rows.item(i).eventTime, 
                              ImagePath: resultSet.rows.item(i).imagePath};
          that.OneTimeEvents.unshift(oneTimeEvent);
        }
        return Promise.resolve(that.OneTimeEvents)
      })
      .catch(e => {console.error("Error: " + JSON.stringify(e)); return Promise.reject(that.OneTimeEvents)});
    })
    .catch(e => console.error(JSON.stringify(e)));
  }

  deleteOTE(Id):Promise<any>{
    console.log("Delete : " + Id);
    return this.db.executeSql('DELETE FROM OneTimeEvents WHERE rowid =?',[Id]).catch(e => console.error(JSON.stringify(e)));
  }
}
