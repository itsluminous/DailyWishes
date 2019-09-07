import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { SocialSharing } from '@ionic-native/social-sharing';
import { PhotoLibrary } from '@ionic-native/photo-library';
import { SQLite } from '@ionic-native/sqlite';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { DatePicker } from '@ionic-native/date-picker';
import { BackgroundMode } from '@ionic-native/background-mode';
import { SQLitePorter } from '@ionic-native/sqlite-porter';
import { File } from '@ionic-native/file';
import { AlertController } from 'ionic-angular';
import { ImagePicker } from '@ionic-native/image-picker';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { SqlStorageProvider } from '../providers/sql-storage/sql-storage';

@NgModule({
  declarations: [
    MyApp,
    HomePage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    SocialSharing,
    PhotoLibrary,
    SQLite,
    LocalNotifications,
    DatePicker,
    BackgroundMode,
    SQLitePorter,
    File,
    AlertController,
    ImagePicker,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    SqlStorageProvider
  ]
})
export class AppModule {}
