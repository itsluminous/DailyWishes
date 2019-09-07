import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SqlStorageProvider } from '../providers/sql-storage/sql-storage';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { Events } from 'ionic-angular';

import { HomePage } from '../pages/home/home';
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = HomePage;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen,
    private sqlStorage : SqlStorageProvider, private localNotifications: LocalNotifications,
    private events: Events) {
    platform.ready().then(() => {
      statusBar.styleDefault();
      splashScreen.hide();
      sqlStorage.initializeDatabase().then(() => {
        this.rootPage = HomePage;
        this.events.publish('loadData', null);
      });
      this.bindNotificationEvent();
    });
  }

  bindNotificationEvent(){
    this.localNotifications.on('click').subscribe(result => this.ShareOnWhatsapp(result.data.type));
  }

  ShareOnWhatsapp(type){
    console.log("Notification Trigger");
    if(this.isInt(type))   //One time notification
      this.sqlStorage.SendOneTimeWish(parseInt(type, 10) - 3018, true);
    else                   //Daily notification
      this.sqlStorage.SendWish("Good" + type, type, true);
  }

  isInt(value) {
    return !isNaN(value) && 
           parseInt(value) == value && 
           !isNaN(parseInt(value, 10));
  }
}