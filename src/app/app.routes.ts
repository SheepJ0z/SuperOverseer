import { Routes } from "@angular/router";

import { SavesComponent } from "./saves/saves.component"
import { VaultComponent } from "./vault/vault.component"
import { DwellersComponent } from "./dwellers/dwellers.component"

export const routes: Routes = [
    {
        path: 'save',
        title: 'Saves',
        component: SavesComponent,
    },
    {
        path: 'vault',
        title: 'Vault',
        component: VaultComponent,
    },
    {
        path: 'dwellers',
        title: 'Dwellers',
        component: DwellersComponent,
    }
];
