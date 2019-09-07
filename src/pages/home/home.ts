import { Component } from '@angular/core';
import { NavController, LoadingController, ToastController } from 'ionic-angular';
import { DatePicker } from '@ionic-native/date-picker';
import { PhotoLibrary } from '@ionic-native/photo-library';
import { SqlStorageProvider } from '../../providers/sql-storage/sql-storage';
import { LocalNotifications, ELocalNotificationTriggerUnit } from '@ionic-native/local-notifications';
import { BackgroundMode } from '@ionic-native/background-mode';
import { Events } from 'ionic-angular';
import { File } from '@ionic-native/file';
import { AlertController } from 'ionic-angular';
import { ImagePicker } from '@ionic-native/image-picker';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  
  public constPathForDailyWishes:string = "DailyWishesAppData";
  public GoodMorning = {Time:"00:00", Count:0, Current:0};
  public GoodAfternoon = {Time:"00:00", Count:0, Current:0};
  public GoodEvening = {Time:"00:00", Count:0, Current:0};
  public GoodNight = {Time:"00:00", Count:0, Current:0};
  public ScheduleDate = "Never";
  public OneTimeEvents = [];

  constructor(public navCtrl: NavController, private photoLibrary: PhotoLibrary,
    private sqlStorage : SqlStorageProvider, private localNotifications: LocalNotifications,
    private datePicker: DatePicker, private loadingController: LoadingController,
    private toastController: ToastController, private backgroundMode: BackgroundMode,
    private events: Events, private file: File, private alertCtrl: AlertController,
    private imagePicker: ImagePicker) {
      events.subscribe('scheduleTomorrow', (data) => {
        this.loadData(false).then(() => this.schedule(1))
      });

      events.subscribe('loadData', (data) => {
        this.loadData(false);
      });
  }

  loadMedia(){
    var that = this;
    let loader = this.loadingController.create({
      content: 'Loading Photos...'
    });

    this.photoLibrary.requestAuthorization().then(() => {
      loader.present().then(() => {
      this.photoLibrary.getLibrary().subscribe({
        next: library => {
          library.forEach(function(libraryItem) {
            if(libraryItem.photoURL.indexOf(that.constPathForDailyWishes) > -1){
              //console.log(libraryItem.photoURL);
              if(libraryItem.photoURL.indexOf("Morning") > -1)
                that.sqlStorage.saveData(libraryItem, "GoodMorning");
              else if(libraryItem.photoURL.indexOf("Afternoon") > -1)
                that.sqlStorage.saveData(libraryItem, "GoodAfternoon");
              else if(libraryItem.photoURL.indexOf("Evening") > -1)
                that.sqlStorage.saveData(libraryItem, "GoodEvening");
              else if(libraryItem.photoURL.indexOf("Night") > -1)
                that.sqlStorage.saveData(libraryItem, "GoodNight");
            }
          });
          this.sqlStorage.initializeTableIndexes().then(() => {
            this.loadData(true); 
            loader.dismiss();
            let toast = this.toastController.create({
              message: 'Photos Loaded',
              duration: 2000,
              position: 'bottom'
            });
            toast.present();
          })
        },
        error: () => { console.log('could not get photos'); loader.dismiss();},
        complete: () => { 
          console.log('done getting photos'); 
        }
      });
    });
    })
    .catch(() => alert('Permission wasn\'t granted'));
  }

  setMorningTime() {
    this.datePicker.show({
      date: new Date(),
      mode: 'time',
      androidTheme: this.datePicker.ANDROID_THEMES.THEME_HOLO_DARK
    }).then(
      time => this.GoodMorning.Time = ("0" + time.getHours()).slice(-2) + ":" + ("0" + time.getMinutes()).slice(-2),
      err => console.log('Error occurred while getting date: ', err)
    );
  }

  setAfternoonTime(){
    this.datePicker.show({
      date: new Date(),
      mode: 'time',
      androidTheme: this.datePicker.ANDROID_THEMES.THEME_HOLO_DARK
    }).then(
      time => this.GoodAfternoon.Time = ("0" + time.getHours()).slice(-2) + ":" + ("0" + time.getMinutes()).slice(-2),
      err => console.log('Error occurred while getting date: ', err)
    );
  }

  setEveningTime(){
    this.datePicker.show({
      date: new Date(),
      mode: 'time',
      androidTheme: this.datePicker.ANDROID_THEMES.THEME_HOLO_DARK
    }).then(
      time => this.GoodEvening.Time = ("0" + time.getHours()).slice(-2) + ":" + ("0" + time.getMinutes()).slice(-2),
      err => console.log('Error occurred while getting date: ', err)
    );
  }

  setNightTime(){
    this.datePicker.show({
      date: new Date(),
      mode: 'time',
      androidTheme: this.datePicker.ANDROID_THEMES.THEME_HOLO_DARK
    }).then(
      time => this.GoodNight.Time = ("0" + time.getHours()).slice(-2) + ":" + ("0" + time.getMinutes()).slice(-2),
      err => console.log('Error occurred while getting date: ', err)
    );
  }

  schedule(addDays:number){
    var that=this;
    var today = new Date();
    if(addDays ==0 && (this.GoodMorning.Time != '00:00' || this.GoodAfternoon.Time != '00:00'
                    || this.GoodEvening.Time != '00:00' || this.GoodNight.Time != '00:00')
                    && this.todayPassed(this.GoodMorning.Time, this.GoodAfternoon.Time, this.GoodEvening.Time, this.GoodNight.Time)){
                      console.log("Preparing to schedule for tomorrow as today is over`");
                      addDays = 1;
                    }
    today.setDate(today.getDate() + addDays);
    var todayString = today.toISOString().substr(0, 11);
    this.sqlStorage.updateNotificationSchedule(this.GoodMorning.Time, this.GoodAfternoon.Time, this.GoodEvening.Time, this.GoodNight.Time)
    .then(() => {
        that.scheduleNotification(1991, 'Morning', todayString, that.GoodMorning.Time, 'Send Good Morning !');
        that.scheduleNotification(1992, 'Afternoon', todayString, that.GoodAfternoon.Time, 'Send Good Afternoon !');
        that.scheduleNotification(1993, 'Evening', todayString, that.GoodEvening.Time, 'Send Good Evening !');
        that.scheduleNotification(1994, 'Night', todayString, that.GoodNight.Time, 'Send Good Night !');

        //One time events
        this.OneTimeEvents.forEach(element => {
          var eventDateArray  = element.ScheduleDate.split("/");
          var eventDate = eventDateArray[2] + "-" + ('0'+ (parseInt(eventDateArray[1], 10) -1)).slice(-2) + "-" + ('0'+eventDateArray[0]).slice(-2) + "T";
          var eventTime = element.Time.toUpperCase().indexOf('M') > -1 ? this.time12to24hour(element.Time.toUpperCase()) : element.Time;
          this.scheduleNotification((3018 + parseInt(element.Id, 10)), (3018 + parseInt(element.Id, 10)), eventDate, eventTime, element.Text);
        });

        let toast = that.toastController.create({
          message: 'Reminder Set.',
          duration: 2000,
          position: 'bottom'
        });
        that.loadData(false);
        toast.present();
        that.backgroundMode.enable();
    })
    .catch(e => console.error("Error: " + JSON.stringify(e)));
  }
  
  scheduleNotification(notificationId, key, triggerDate, triggerTime, notificationText){
    var that = this;
    var soundPath = 'file://audio/notification.mp3';
    //var soundPath = 'file://android_asset/www/assets/sounds/notification.mp3';
    this.localNotifications.isScheduled(notificationId).then(isScheduled => {
      console.log('notificationId = ' + notificationId + ', isScheduled = ' + isScheduled + ', key = ' + key + ', triggerDate = ' + triggerDate + ', triggerTime = ' + triggerTime)
      if (isScheduled && triggerTime != '00:00') {
        that.localNotifications.update({
          id: notificationId,
          trigger: {at: new Date(triggerDate + triggerTime)},
          sound: soundPath,
          vibrate: true,
          priority:2,
          data: { type: key }
        });
      } else if(!isScheduled && triggerTime != '00:00') {
        that.localNotifications.schedule({
          id: notificationId,
          text: notificationText,
          trigger: {at: new Date(triggerDate + triggerTime)},
          //trigger: {firstAt: new Date(todayString + that.GoodMorning.Time), every: ELocalNotificationTriggerUnit.MINUTE},
          sound: soundPath,
          vibrate: true,
          priority:2,
          data: { type: key }
        });
      }
      else if(isScheduled && triggerTime == '00:00'){
        console.log("Cancelling schedule for : " + key);
        that.localNotifications.cancel(notificationId);
      }
    })
  }

  clearSchedule(){
    var that = this;
    let toast = that.toastController.create({
      message: 'All scheduled notifications cleared.',
      duration: 2000,
      position: 'bottom'
    });
    let alert = this.alertCtrl.create({
      title: 'Confirm Schedule Clear?',
      message: 'This will clear all scheduled notifications you have set. Continue?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {
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
  }

  loadData(showToast):Promise<any>{
    let toast = this.toastController.create({
      message: 'Data Loaded.',
      duration: 2000,
      position: 'bottom'
    });

    return this.sqlStorage.getData().then(data => {
      this.GoodMorning = data.Morning; 
      this.GoodAfternoon = data.Afternoon; 
      this.GoodEvening = data.Evening;
      this.GoodNight = data.Night; 

      this.localNotifications.getAll()
      .then(scheduleData => {
        console.log(JSON.stringify(scheduleData));
        if(scheduleData.length > 0){
          var scheduledDates = scheduleData.map(function(s){return new Date(s.trigger.at);});
          scheduledDates.sort();
          var minutes = ('0'+scheduledDates[0].getMinutes()).slice(-2);
          var hours = scheduledDates[0].getHours();
          var ampm = hours >= 12 ? 'pm' : 'am';
          hours = hours % 12;
          hours = hours ? hours : 12;   //otherwise for 12 pm in afternoon it will show 0 pm
          this.ScheduleDate = scheduledDates[0].getDate() + "/" + (scheduledDates[0].getMonth()+1) + "/" + scheduledDates[0].getFullYear()
                              + ", " + hours + ":" + minutes + " " + ampm;
        }
        else{
          this.ScheduleDate = "Never";
        }
        if(showToast){
          toast.present();
        }
      })
      .catch((e) => console.log("Error : " + JSON.stringify(e)));

      //Fetch one time events now
      this.sqlStorage.getOneTimeEvents()
      .then(data => {
        this.OneTimeEvents = data;
      })
      .catch((e) => console.log("Error : " + JSON.stringify(e)));
    });
  }

  refreshData(refresher) {
    this.loadData(true).then(() => refresher.complete())
  }

  whatsappShare(type){
    this.sqlStorage.SendWish("Good" + type, type, false);
  }

  exportDB(){
    var that = this;
    let toast = that.toastController.create({
      message: 'Backup Complete.',
      duration: 2000,
      position: 'bottom'
    });
    let loader = this.loadingController.create({
      content: 'Starting Backup...'
    });
    loader.present().then(() => {
      that.sqlStorage.exportDB().then((sql) => {
        that.file.writeFile("file:///storage/emulated/0/DailyWishesAppData/", "DatabaseBackup.dat", sql, {replace: true})
        .then((res) => {
          loader.dismiss();
          toast.present();
        })
        .catch(e => {console.error("Error: " + JSON.stringify(e)); loader.dismiss();})
      })
      .catch(e => {console.error("Error: " + JSON.stringify(e)); loader.dismiss()});
    });
  }

  importDB(){
    var that = this;
    let toast = that.toastController.create({
      message: 'Database Restore Complete.',
      duration: 2000,
      position: 'bottom'
    });
    let loader = this.loadingController.create({
      content: 'Restoring Database...'
    });
    let alert = this.alertCtrl.create({
      title: 'Confirm DB Restore?',
      message: 'This will overwrite current database. Do you want to proceed?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            loader.present().then(() => {
              that.file.readAsText("file:///storage/emulated/0/DailyWishesAppData/", "DatabaseBackup.dat").then((sql) => {
                that.sqlStorage.importDB(sql)
                .then((res) => {
                  that.sqlStorage.getData().then(data => {
                    that.GoodMorning = data.Morning; 
                    that.GoodAfternoon = data.Afternoon; 
                    that.GoodEvening = data.Evening;
                    that.GoodNight = data.Night; 
                    loader.dismiss();
                    toast.present();
                  })
                })
                .catch(e => {console.error("Error: " + JSON.stringify(e)); loader.dismiss();})
              })
              .catch(e => {console.error("Error: " + JSON.stringify(e)); loader.dismiss()});
            });
          }
        }
      ]
    });
    alert.present();
  }

  todayPassed(morning, afternoon,evening,night): boolean{
    var today = new Date();
    var todayEpochTime = new Date('1990/01/01 ' + ("0" + today.getHours()).slice(-2) + ":" + ("0" + today.getMinutes()).slice(-2));
    var morningEpochTime = new Date('1990/01/01 ' + morning);
    var afternoonEpochTime = new Date('1990/01/01 ' + afternoon);
    var eveningEpochTime = new Date('1990/01/01 ' + evening);
    var nightEpochTime = new Date('1990/01/01 ' + night);

    if((morning == '00:00' || todayEpochTime > morningEpochTime) 
        && (afternoon == '00:00' || todayEpochTime > afternoonEpochTime) 
        && (evening == '00:00' || todayEpochTime > eveningEpochTime) 
        && (night == '00:00' || todayEpochTime > nightEpochTime) ){
          return true;
        }
    return false;
  }

  addOneTimeEvent(){
    var today = new Date();    
    var minutes = ('0'+today.getMinutes()).slice(-2);
    var hours = today.getHours();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;   //otherwise for 12 pm in afternoon it will show 0 pm
    var timeValue  = hours + ":" + minutes + " " + ampm;
    var dateValue = today.getDate() + "/" + (today.getMonth()+1) + "/" + today.getFullYear();

    var eventData = {Id: 0, Text: "Title", ScheduleDate: dateValue, Time : timeValue, ImagePath: ""};
    this.OneTimeEvents.unshift(eventData);
  }

  pickOneImageOTE(eventData){
    this.imagePicker.requestReadPermission().then(() => {
      this.imagePicker.getPictures({"outputType" : 1, "maximumImagesCount": 1 }).then((results) => {
        for (var i = 0; i < 1; i++) {
            console.log(results[i]);
            var objIndex = this.OneTimeEvents.findIndex((obj => obj.Id == eventData.Id));
            this.OneTimeEvents[objIndex].ImagePath = results[i];
            console.log(this.OneTimeEvents[objIndex].ImagePath);
        }
      }, (err) => { console.log(JSON.stringify(err)) });
    })
    .catch(() => alert('Permission wasn\'t granted'));
  }

  setTitleOTE(eventData, text){    
    var objIndex = this.OneTimeEvents.findIndex((obj => obj.Id == eventData.Id));
    this.OneTimeEvents[objIndex].Text = text;
  }

  setDateOTE(eventData) {
    var objIndex = this.OneTimeEvents.findIndex((obj => obj.Id == eventData.Id));
    this.datePicker.show({
      date: new Date(),
      mode: 'date',
      androidTheme: this.datePicker.ANDROID_THEMES.THEME_HOLO_DARK
    }).then(
      date => this.OneTimeEvents[objIndex].ScheduleDate = date.getDate() + "/" + (date.getMonth()+1) + "/" + date.getFullYear(),
      err => console.log('Error occurred while getting date: ', err)
    );
  }

  setTimeOTE(eventData) {
    var objIndex = this.OneTimeEvents.findIndex((obj => obj.Id == eventData.Id));
    this.datePicker.show({
      date: new Date(),
      mode: 'time',
      androidTheme: this.datePicker.ANDROID_THEMES.THEME_HOLO_DARK
    }).then(
      time => this.OneTimeEvents[objIndex].Time = ("0" + time.getHours()).slice(-2) + ":" + ("0" + time.getMinutes()).slice(-2),
      err => console.log('Error occurred while getting date: ', err)
    );
  }

  deleteOTE(eventData){
    var that = this;
    let toast = that.toastController.create({
      message: 'Event deleted.',
      duration: 2000,
      position: 'bottom'
    });
    let alert = this.alertCtrl.create({
      title: 'Confirm event delete?',
      message: 'Are you sure you want to delete this event permanently?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            that.sqlStorage.deleteOTE(eventData.Id)
              .then(() => {
                that.OneTimeEvents = that.OneTimeEvents.filter(function( obj ) {
                  return obj.Id !== eventData.Id;
                });
                that.localNotifications.cancel(parseInt(eventData.Id, 10) + 3018)
                toast.present();
              })
              .catch(e => {console.error("Error: " + JSON.stringify(e));})
          }
        }
      ]
    });
    alert.present();
  }

  scheduleOTE(){
    let toast = this.toastController.create({
      message: 'One time events set.',
      duration: 2000,
      position: 'bottom'
    });
    this.sqlStorage.SaveOneTimeEvent(this.OneTimeEvents)
    .then((data) => {
      this.OneTimeEvents = data;
      console.log(this.OneTimeEvents);
      this.OneTimeEvents.forEach(element => {
        var eventDateArray  = element.ScheduleDate.split("/");
        var eventDate = eventDateArray[2] + "-" + ('0'+eventDateArray[1]).slice(-2) + "-" + ('0'+eventDateArray[0]).slice(-2) + "T";
        var eventTime = element.Time.toUpperCase().indexOf('M') > -1 ? this.time12to24hour(element.Time.toUpperCase()) : element.Time;
        this.scheduleNotification((3018 + parseInt(element.Id, 10)), (3018 + parseInt(element.Id, 10)), eventDate, eventTime, element.Text);
      });
      toast.present();
    })
    .catch(e => {console.error("Error: " + JSON.stringify(e));});
  }

  time12to24hour(time){
    var hours = Number(time.match(/^(\d+)/)[1]);
    var minutes = Number(time.match(/:(\d+)/)[1]);
    var AMPM = time.match(/\s(.*)$/)[1];
    if(AMPM == "PM" && hours<12) hours = hours+12;
    if(AMPM == "AM" && hours==12) hours = hours-12;
    var sHours = hours.toString();
    var sMinutes = minutes.toString();
    if(hours<10) sHours = "0" + sHours;
    if(minutes<10) sMinutes = "0" + sMinutes;

    return sHours + ":" + sMinutes;
  }
}
