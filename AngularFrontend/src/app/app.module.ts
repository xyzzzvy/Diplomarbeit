import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {provideHttpClient} from '@angular/common/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HomepageComponent } from './components/homepage/homepage.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { AiCoachComponent } from './components/ai-coach/ai-coach.component';
import { PlayAgainstBotsComponent } from './components/play-against-bots/play-against-bots.component';
import { PlayAgainstOtherComponent } from './components/play-against-other/play-against-other.component';
import { TournamentsComponent } from './components/tournaments/tournaments.component';
import { CreateAccountComponent } from './components/create-account/create-account.component';
import { PlayAgainstFriendsComponent } from './components/play-against-friends/play-against-friends.component';
import { AgbComponent } from './components/agb/agb.component';
import { ImpressumComponent } from './components/impressum/impressum.component';
import { LoginComponent } from './components/login/login.component';
import { ForgottPasswordComponent } from './components/login/forgott-password/forgott-password.component';



@NgModule({
  declarations: [
    AppComponent,
    HomepageComponent,
    RegistrationComponent,
    AiCoachComponent,
    PlayAgainstBotsComponent,
    PlayAgainstOtherComponent,
    TournamentsComponent,
    CreateAccountComponent,
    PlayAgainstFriendsComponent,
    AgbComponent,
    ImpressumComponent,
    LoginComponent,
    ForgottPasswordComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
  ],
  bootstrap: [AppComponent],
  providers: [provideHttpClient()]
})
export class AppModule {}
