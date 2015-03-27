'use strict';

var Game = require('../game');
var Item = require('./item')();
var util = require('./util');

var charUpdate = Game.charUpdate;

var directions = {
  card: [
    'n',
    'ne',
    'e',
    'se',
    's',
    'sw',
    'w',
    'nw',
    'stop'
  ],
  roll: function() {
    return Math.floor(Math.random() * 8);
  }
};

Crafty.extend({
    randChance: function(a, b) {
        return Crafty.randRange(0, b) > b - a;
    },
    rInt: function(min, max) {
      return Math.floor(Math.random() * (max - min) + min);
    },
    rFlt: function(min, max) {
      return Math.random() * (max - min) + min;
    },
    rSign: function(){
      if(this.rInt(0,1) === 1){
        return 1;
      }else{
        return -1;
      }
    }
});

Crafty.sprite(32, 'js/game/assets/rock.png', {
  rock: [0, 0]
});

Crafty.sprite(32, 'js/game/assets/single_chest.png', {
  spChest: [0, 0]
});

Crafty.c('Grid', {
  init: function() {
    this.attr({
      w: Game.map_grid.tile.width,
      h: Game.map_grid.tile.height
    })
  },
 
  // Locate this entity at the given position on the grid
  at: function(x, y) {
    if (x === undefined && y === undefined) {
      return { x: this.x/Game.map_grid.tile.width, y: this.y/Game.map_grid.tile.height }
    } else {
      this.attr({ x: x * Game.map_grid.tile.width, y: y * Game.map_grid.tile.height });
      return this;
    }
  }
});
 

Crafty.c('Actor', {
  init: function() {
    this.requires('2D, Canvas, Grid');
  },
});

Crafty.c('PlayerCharacter', {
  init: function() {
    this.requires('Actor, Fourway, Color, Collision, Animate')
      .attr({w: 16, h: 16,})
      .color('#1122ff')
      .fourway(this.details.speed)
      .collision()
      .bind('Moved', function(old) {
        if (this.hit('Solid')) {
          this.x = old.x;
          this.y = old.y;
        }
      })
      .onHit('Item', this.visitItem)
      .onHit('Rat', this.hitEnemy)
      .onHit('Skeleton', this.hitEnemy)
      .onHit('Slime', this.hitEnemy)
      .onHit('cItem', this.visitItem)
      .onHit('EnemyNPC', this.hitEnemy)
      .onHit('ExitPoint', function() {
        util.gameLogUpdate('You go deeper.');
        Crafty.scene('main');
      });
  },
  visitItem: function(data) {
    var item = data[0].obj;
    this.details.pickupItem(item.stats);
    item.collect();
    //console.log('You have picked up ' + item.stats.name);
    console.log('Inventory size: ' + this.details.inventory.length);
    util.gameLogUpdate('You have picked up ' + item.stats.name);
  },
  hitEnemy: function(data) {
    var enemy = data[0].obj;
    this.details.enemiesKilled++;

    var sendObj = {
      enemiesKilled: 4,
      invArray: ['thing', 'thing1', 'thing2'],

    };

    charUpdate.emit('characterUpdate', this.details);
    console.log('hit enemy');
    enemy.kill(this.details.level);
    util.gameLogUpdate('They didn\'t suffer.');
  },
  details: Game.player
});

Crafty.c('Rat', {
  direction: directions.card[directions.roll()],
  init: function() {
    this.requires('Actor, Color, Collision, Delay')
      .attr({
        w: 16,
        h: 16,
        dx: Crafty.rFlt(0.5, 1)*Crafty.rSign(),
        dy: Crafty.rFlt(0.5, 1)*Crafty.rSign()
      })
      .color('#A31E00')
      .collision()
      .bind('EnterFrame', function(){
        if (this.hit('Solid')) {
          this.dx *= Crafty.rFlt(0.9,1.1)*Crafty.rSign();
          this.dy *= Crafty.rFlt(0.9,1.1)*Crafty.rSign();
        }
        this.x += this.dx;
        this.y += this.dy;
      });
  },
  kill: function(charLevel) {
    this.killedBy = charLevel;
    this.trigger('NPCDeath');
    this.destroy();
  },
  changeDirection: function() {
  },
  moveSome: function() {
    this.move(this.direction, 0.2);
  }
});

Crafty.c('Skeleton', {
  speed: 0.1,
  direction: directions.card[directions.roll()],
  init: function() {
    this.requires('Actor, Color, Collision, Delay')
      .attr({w: 16, h: 16})
      .color('#E6E6E6')
      .collision()
      .bind('Move', function(old) {
        if (this.hit('Rock')) {
          this.movement = false;
          this.speed = false;
          this.x = old.x;
          this.y = old.y;
        }
      });
  },
  kill: function(charLevel) {
    this.killedBy = charLevel;
    this.trigger('NPCDeath');
    this.destroy();
  },
  changeDirection: function() {
  },
  moveSome: function() {
    this.move(this.direction, 0.2);
  }
});

Crafty.c('Slime', {
  speed: 0.2,
  direction: directions.card[directions.roll()],
  init: function() {
    this.requires('Actor, Color, Collision, Delay')
      .attr({w: 16, h: 16})
      .color('#19A347')
      .collision()
      .bind('Moved', function(old) {
        if (this.hit('Rock')) {
          this.movement = false;
          this.speed = false;
          this.x = old.x;
          this.y = old.y;
        }
      });
  },
  kill: function(charLevel) {
    this.killedBy = charLevel;
    this.trigger('NPCDeath');
    this.destroy();
  },
  changeDirection: function() {
  },
  moveSome: function() {
    this.move(this.direction, 0.2);
  }
});

Crafty.c('EnemyNPC', {
  speed: 0.2,
  direction: directions.card[directions.roll()],
  init: function() {
    this.requires('Actor, Color, Collision, Custom, Animate')
      .attr({w: 16, h: 16})
      .color('#A31E00')
      .collision()
      .bind('Moved', function(old) {
        if (this.hit('Rock')) {
          this.x = old.x;
          this.y = old.y;
        }
      });
  },
  kill: function(charLevel) {
    this.killedBy = charLevel;
    this.trigger('NPCDeath');
    this.destroy();
  },
  changeDirection: function() {
  },
  moveSome: function() {
    this.move(this.direction, 0.2);
  }
});

Crafty.c('FollowAI', {
  followAI: function(obj) {
    this.bind('EnterFrame', function(obj) {
      if ((this.x < (obj.x + 100)) || (this.y < (obj.y + 100))) {
        this.x += this.speed;
      }
    });
  }
});

Crafty.c('LevelBounds', {
  init: function() {
    this.requires('Actor, Color, Solid')
      .color('#808080');
  }
});

Crafty.c('ExitPoint', {
  init: function() {
    this.requires('Actor, Color')
      .color('#8B00AD');
  }
});

Crafty.c('StaticSprite', {
  init: function() {
    this.requires('Actor, Solid, rock');
  }
});

Crafty.c('Floor', {
  init: function() {
    this.requires('Actor, Color')
      .color('#222222');
  }
});

Crafty.c('Water', {
  init: function() {
    this.requires('Actor, Color, Collision')
      .color('#000D96');
  }
});

Crafty.c('Chest', {
  init: function() {
    this.requires('Actor, Color, Solid, spChest');
  }
});

Crafty.c('cItem', {
  stats: '',
  init: function() {
    this.requires('Actor, Color')
      .attr({w: 4, h: 4,})
      .color('#ff0033');
  },
  collect: function() {
    this.destroy();
  },
  initStats: function(charLevel, mod) {
    this.stats = Item.spawn(charLevel, mod);
  }
});

Crafty.c('FitItem', {
  init: function() {
    this.requires('Actor, Color')
      .attr({w: 4, h: 4,})
      .color('#ff0033');
  },
 
  collect: function() {
    this.destroy();
  }
});

