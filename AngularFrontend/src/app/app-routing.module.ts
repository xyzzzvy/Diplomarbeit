import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './components/homepage/homepage.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { AiCoachComponent} from './components/ai-coach/ai-coach.component';
import { PlayAgainstBotsComponent} from './components/play-against-bots/play-against-bots.component';
import { PlayAgainstOtherComponent} from './components/play-against-other/play-against-other.component';
import { TournamentsComponent } from './components/tournaments/tournaments.component';
import { CreateAccountComponent } from './components/create-account/create-account.component';
import { PlayAgainstFriendsComponent } from './components/play-against-friends/play-against-friends.component';
import {AgbComponent} from './components/agb/agb.component';
import {ImpressumComponent} from './components/impressum/impressum.component';
import {LoginComponent} from './components/login/login.component';
import {ForgottPasswordComponent} from './components/login/forgott-password/forgott-password.component';
import {ChessboardComponent} from './components/chessboard/chessboard.component';
import {BotsPanelComponent} from './components/bots-panel/bots-panel.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomepageComponent },
  { path: 'registration', component: RegistrationComponent },
  { path: 'aicoach', component: AiCoachComponent },
  { path: 'playAgainstBots', component: PlayAgainstBotsComponent },
  { path: 'playAgainstOther', component: PlayAgainstOtherComponent },
  { path: 'tournaments', component: TournamentsComponent },
  { path: 'createAccount', component: CreateAccountComponent },
  { path: 'playAgainstFriends', component: PlayAgainstFriendsComponent },
  { path: 'agb', component: AgbComponent },
  { path: 'impressum', component: ImpressumComponent },
  { path: 'login', component: LoginComponent },
  { path: 'forgottPassword', component: ForgottPasswordComponent },
  { path: 'chessboard', component: ChessboardComponent },
  { path: 'botsPanel', component: BotsPanelComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
