import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { MatCommonModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { NgOptimizedImage } from '@angular/common';
import { invoke } from "@tauri-apps/api/tauri";
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { MatDividerModule } from '@angular/material/divider';
import { SelectionModel } from '@angular/cdk/collections';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-dwellers',
  standalone: true,
  templateUrl: './dwellers.component.html',
  styleUrl: './dwellers.component.css',
  imports: [
    FormsModule,
    CommonModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatCommonModule,
    MatTableModule,
    NgOptimizedImage,
    MatGridListModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatBadgeModule,
    MatTooltipModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatSliderModule,
    MatDividerModule,
    MatCheckboxModule,
  ]
})
export class DwellersComponent {
  dwellers: any;
  cur_edit_dweller: any | null = null;
  selection = new SelectionModel<number>(true, []);

  columnsToDisplay = [
    'select',
    'serializeId',
    'name',
    'lastName',
    'currentLevel',
    'gender',
    'rarity',
  ];

  stats_names = [
    "隐藏属性",
    "力量-S",
    "观察-P",
    "耐力-E",
    "魅力-C",
    "智力-I",
    "敏捷-A",
    "幸运-L",
  ];

  constructor() {
    invoke("get_dwellers", {}).then((result: any) => {
      if (typeof (result) == 'string') {
        this.dwellers = JSON.parse(result);
      }
    }).catch((error: string) => { console.log('error: ' + error); });
  }

  ngOnDestroy() {
    let dwellers = JSON.stringify(this.dwellers);
    invoke("set_dwellers", { dwellers }).catch((error: string) => { console.log('error: ' + error); })
  }

  maxSpecial() {
    if (this.selection.selected.length == 0)
      return;

    for (let i in this.selection.selected) {
      this.dwellers[i].stats.stats[0].value = 10; this.dwellers[i].stats.stats[0].exp = 599296.5;
      this.dwellers[i].stats.stats[1].value = 10; this.dwellers[i].stats.stats[1].exp = 599296.5;
      this.dwellers[i].stats.stats[2].value = 10; this.dwellers[i].stats.stats[2].exp = 599296.5;
      this.dwellers[i].stats.stats[3].value = 10; this.dwellers[i].stats.stats[3].exp = 599296.5;
      this.dwellers[i].stats.stats[4].value = 10; this.dwellers[i].stats.stats[4].exp = 599296.5;
      this.dwellers[i].stats.stats[5].value = 10; this.dwellers[i].stats.stats[5].exp = 599296.5;
      this.dwellers[i].stats.stats[6].value = 10; this.dwellers[i].stats.stats[6].exp = 599296.5;
      this.dwellers[i].stats.stats[7].value = 10; this.dwellers[i].stats.stats[7].exp = 599296.5;

    }
  }

  maxLevel() {
    if (this.selection.selected.length == 0)
      return;

    for (let i in this.selection.selected) {
      this.dwellers[i].experience.experienceValue = 2916001;
      this.dwellers[i].experience.currentLevel = 50;
    }
  }


  maxHealth() {
    if (this.selection.selected.length == 0)
      return;

    for (let i in this.selection.selected) {
      this.dwellers[i].health.healthValue = 1000;
      this.dwellers[i].health.radiationValue = 0;
      this.dwellers[i].health.maxHealth = 1000;
    }
  }

  maxHappiness() {
    if (this.selection.selected.length == 0)
      return;

    for (let i in this.selection.selected) {
      this.dwellers[i].happiness.happinessValue = 100;
    }
  }

  removeRelationship() {
    if (this.selection.selected.length == 0)
      return;

    for (let i in this.selection.selected) {
      this.dwellers[i].relations = {
        "relations": [],
        "partner": -1,
        "lastPartner": -1,
        "ascendants": [
          71,
          34,
          -1,
          -1,
          10,
          19
        ]
      };
      this.dwellers[i].lastChildBorn = -1;
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    if (typeof (this.dwellers) === 'undefined')
      return false
    const numSelected = this.selection.selected.length;
    const numRows = this.dwellers.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...[...Array(this.dwellers.length).keys()]);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(index?: number): string {
    if (!index) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(index) ? 'deselect' : 'select'} row ${index + 1}`;
  }

}


export interface Dweller {
  serializeId: number;
  name: string;
  lastName: string;
  happiness: {
    happinessValue: number;
  };
  health: {
    healthValue: number;
    radiationValue: number;
    permaDeath: boolean;
    lastLevelUpdated: number;
    maxHealth: number;
  };
  experience: {
    experienceValue: number;
    currentLevel: number;
    storage: number;
    accum: number;
    needLvUp: boolean;
    wastelandExperience: number;
  };
  relations: {
    relations: [];
    partner: number;
    lastPartner: number;
    ascendants: [];
  };
  gender: number;
  stats: {
    stats: [];
  };
  pregnant: boolean;
  babyReady: boolean;
  assigned: boolean;
  sawIncident: boolean;
  WillGoToWasteland: boolean;
  WillBeEvicted: boolean;
  IsEvictedWaitingForFollowers: boolean;
  skinColor: number;
  hairColor: number;
  outfitColor: number;
  pendingExperienceReward: number;
  uniqueData: string;
  hair: string;
  equipedOutfit: {
    id: string;
    type: string;
    hasBeenAssigned: boolean;
    hasRandonWeaponBeenAssigned: boolean;
  };
  equipedWeapon: {
    id: string;
    type: string;
    hasBeenAssigned: boolean;
    hasRandonWeaponBeenAssigned: boolean;
  };
  equippedPet: {
    id: string;
    type: string;
    hasBeenAssigned: boolean;
    hasRandonWeaponBeenAssigned: boolean;
    extraData: {
      uniqueName: string;
      bonus: string;
      bonusValue: number;
    };
  };
  savedRoom: number;
  lastChildBorn: number;
  rarity: string;
  deathTime: number;
}
