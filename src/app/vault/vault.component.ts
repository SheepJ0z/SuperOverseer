import { Component } from '@angular/core';
import { invoke } from "@tauri-apps/api/tauri";
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-vault',
  standalone: true,
  imports: [MatTooltipModule, FormsModule, MatButtonModule, MatSlideToggleModule, MatCardModule, MatGridListModule, MatBadgeModule, MatSelectModule, MatInputModule, MatFormFieldModule],
  templateUrl: './vault.component.html',
  styleUrl: './vault.component.css'
})
export class VaultComponent {
  vault: any | null = null;

  ngOnInit() {
    invoke("get_vault", {}).then((result) => {
      if (typeof (result) == 'string') {
        this.vault = JSON.parse(result);
      }
    }).catch((error: string) => { console.log('error: ' + error); })
  }

  ngOnDestroy() {
    let vault = JSON.stringify(this.vault);
    invoke("set_vault", { vault }).catch((error: string) => { console.log('error: ' + error); })
  }

  debug_print(param: any) {
  }

}
