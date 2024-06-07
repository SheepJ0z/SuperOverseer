import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { invoke } from "@tauri-apps/api/tauri";
import { MatCommonModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { NgOptimizedImage } from '@angular/common';
import { open, save } from '@tauri-apps/api/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-saves',
  standalone: true,
  imports: [CommonModule, MatCommonModule, MatTableModule, NgOptimizedImage, MatButtonModule, MatCardModule],
  templateUrl: './saves.component.html',
  styleUrl: './saves.component.css'
})
export class SavesComponent {
  savFiles: any;
  curSavFileIndex: any;

  displayedColumns: string[] = [
    'index',
    'filename',
    'len',
    'modify_time',
    'create_time',
    'path',
    'save',
  ];

  ngOnInit() {
    // console.log("SavesComponent: init");
    invoke("get_all_sav", {}).then((result) => { this.savFiles = result; }).catch((error) => { console.log('error: ' + error); })
    invoke("get_cur_sav", {}).then((result) => { this.curSavFileIndex = result; })
  }

  async save_dialog(i: number) {
    const savFilePath = await save({
      filters: [{
        name: 'sav or json',
        extensions: ['sav', 'json']
      }]
    });

    console.log("save_sav_file: " + savFilePath);
    invoke("save_sav_file", { savFilePath }).catch((error) => { console.log('save_sav_file error: ' + error); return; });
  }

  async open_dialog() {
    // Open a selection dialog for sav files
    const savFilePath = await open({
      multiple: false,
      filters: [{
        name: 'sav',
        extensions: ['sav']
      }]
    });

    if (Array.isArray(savFilePath)) {  // user selected multiple files
      console.log('select multiple file');
    } else if (savFilePath === null) { // user cancelled the selection
      console.log('select null file');
    } else {                           // user selected a single file
      invoke("select_sav_file", { savFilePath }).catch((error) => { console.log('error: ' + error); return; });
    }

    invoke("get_all_sav", {}).then((result) => { this.savFiles = result; }).catch((error) => { console.log('error: ' + error); return; })
    invoke("get_cur_sav", {}).then((result) => { this.curSavFileIndex = result; })
  }

  set_cur_sav(curSavIndex: number) {
    invoke("set_cur_sav", { curSavIndex }).then((result) => { this.curSavFileIndex = result; })
  }


}