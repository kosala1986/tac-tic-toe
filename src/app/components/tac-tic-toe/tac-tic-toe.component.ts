import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { PusherService } from '../../modules/tac-tic/services/pusher.service';
import { GameService } from '../../modules/tac-tic/services/game.service';
import * as _ from 'underscore';

@Component({
  selector: 'tac-tic-toe',
  templateUrl: './tac-tic-toe.component.html',
  styleUrls: ['./tac-tic-toe.component.scss'],
  providers: [PusherService]
})
export class TacTicToeComponent implements OnInit {


  blocks: any = [];
  lock: boolean = false;
  messages: Array<any>;
  userName: string = '';
  messageText: string = '';
  themes: Array<any> = [
    { theme: 'White', color: '#FFFF' },
    { theme: 'Black', color: '#000' }
  ];

  @ViewChild('textContent') textContent: ElementRef;

  constructor(private pusherService: PusherService, private gameService: GameService) {
    this.messages = [];

  }

  ngOnInit(): void {

    this.gameService.initBlocks();
    this.pushListener();
    this.blocks = this.gameService.blocks;

  }


  playerClick(event: any, block: any): void {

    if ((this.gameService.blocks[block.id - 1].isLocked || this.lock == true) || !this.gameService.isYourTurn(this.userName)) {
      return;
    }

    this.gameService.freeBlocksRemaining -= 1;
    this.gameService.blocks[block.id - 1].isLocked = true;

    if (this.gameService.turn == 0) {
      this.gameService.blocks[block.id - 1].symbol = 'tick';

    } else {
      this.gameService.blocks[block.id - 1].symbol = 'cross';
    }
    this.gameService.changeTurn();
    var complete = this.gameService.blockSetComplete();
    this.gameService.userClick(this.gameService.blocks[block.id - 1]);
    if (complete == false) {
      return;

    } else {
      this.lock = true;
      this.textContent.nativeElement.textContent = `${this.userName} is the winner!`;
      setTimeout(() => {
        this.resetGame();
      }, 5000);
    }

  }

  initPlayer(): void {
    this.gameService.initPlayer(this.userName);
  }


  pushListener(): void {
    this.pusherService.messagesChannel.bind('client-tac-tic', (response) => {
      this.gameService.pushListener(response);
    });
    this.pusherService.messagesChannel.bind('pusher:subscription_succeeded', (members) => { });
  }

  disableFields(): boolean {
    return this.gameService.players.length == 2;
  }


  resetGame(): void {
    this.gameService.freeBlocksRemaining = 9;
    this.gameService.initBlocks();
    this.lock = false;
    this.gameService.turn = 0;
    location.reload();
  }

}
