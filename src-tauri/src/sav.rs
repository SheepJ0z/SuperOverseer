use base64::prelude::*;
use chrono::offset::Local;
use chrono::DateTime;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use soft_aes::aes::{aes_dec_cbc, aes_enc_cbc};
use std::fs::File;
use std::io::prelude::*;
use std::str;
use std::sync::{Mutex, OnceLock};

static KEY: [u8; 32] = [
    0xA7, 0xCA, 0x9F, 0x33, 0x66, 0xD8, 0x92, 0xC2, 0xF0, 0xBE, 0xF4, 0x17, 0x34, 0x1C, 0xA9, 0x71,
    0xB6, 0x9A, 0xE9, 0xF7, 0xBA, 0xCC, 0xCF, 0xFC, 0xF4, 0x3C, 0x62, 0xD1, 0xD7, 0xD0, 0x21, 0xF9,
];
static IV: [u8; 16] = [
    0x74, 0x75, 0x38, 0x39, 0x67, 0x65, 0x6A, 0x69, 0x33, 0x34, 0x30, 0x74, 0x38, 0x39, 0x75, 0x32,
];

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct SavInfo {
    filename: String,
    path: String,
    len: u64,
    modify_time: String,
    create_time: String,
    is_changed: bool,
}

pub struct Sav {
    sav_info: SavInfo,
    sav_json: Value,
}

pub struct SavManager {
    pub cur_sav: usize,
    sav_vec: Vec<Sav>,
}

impl Sav {
    fn new(sav_file_path: &str) -> Result<Self, String> {
        println!("new sav: {}", sav_file_path);

        let mut file = File::open(sav_file_path).map_err(|err| err.to_string())?;
        let mut contents = String::new();
        file.read_to_string(&mut contents)
            .map_err(|err| err.to_string())?;
        let md = file.metadata().map_err(|err| err.to_string())?;

        let filename = sav_file_path
            .split('\\')
            .last()
            .unwrap_or("Not Support")
            .to_string();

        let modify_time = md.modified().map_err(|_| "Not Support".to_string())?;
        let modify_time: DateTime<Local> = modify_time.into();
        let modify_time = modify_time.format("%F %T").to_string();

        let create_time = md.created().map_err(|_| "Not Support".to_string())?;
        let create_time: DateTime<Local> = create_time.into();
        let create_time = create_time.format("%F %T").to_string();

        let sav_json = convert_base64_to_str(contents);
        let sav_json: Value =
            serde_json::from_str(sav_json.as_str()).map_err(|_| "parse json failed".to_string())?;

        Ok(Self {
            sav_info: SavInfo {
                filename: filename,
                path: sav_file_path.to_string(),
                modify_time: modify_time,
                create_time: create_time,
                len: md.len(),
                is_changed: false,
            },
            sav_json: sav_json,
        })
    }
}

impl SavManager {
    pub fn global() -> &'static Mutex<SavManager> {
        static SAV_MANAGER: OnceLock<Mutex<SavManager>> = OnceLock::new();

        SAV_MANAGER.get_or_init(|| {
            Mutex::new(SavManager {
                sav_vec: Vec::new(),
                cur_sav: 0,
            })
        })
    }

    pub fn get_all_sav(&self) -> Vec<SavInfo> {
        let mut sav_info_vec = Vec::new();

        for sav in self.sav_vec.iter() {
            sav_info_vec.push(sav.sav_info.clone());
        }

        sav_info_vec
    }

    pub fn add_sav(&mut self, sav_file_path: &str) -> Result<(), String> {
        // 检查是否已经添加
        let index = self
            .sav_vec
            .iter()
            .position(|s| s.sav_info.path == sav_file_path);

        match index {
            Some(i) => {
                println!("add already: {}", sav_file_path);
                self.cur_sav = i;
                return Ok(());
            }
            None => println!("prepare to add: {}", sav_file_path),
        }

        // 添加一个新的
        let sav = Sav::new(sav_file_path);
        match sav {
            Ok(sav) => {
                self.sav_vec.push(sav);
                self.cur_sav = self.sav_vec.len() - 1;
                Ok(())
            }
            Err(err) => Err(err),
        }
    }

    pub fn save_as_file(&self, file_path: &str) -> Result<(), String> {
        println!("save as file: {}", file_path);

        let mut data = self.sav_vec[self.cur_sav].sav_json.to_string();

        if file_path.ends_with(".sav") {
            println!("save as .sav");
            data = convert_str_to_base64(data.as_str());
        } else if file_path.ends_with(".json") {
            println!("save as .json");
        } else {
            return Err("save as invalid type".to_string());
        }

        let mut file = File::create(file_path).map_err(|err| err.to_string())?;
        file.write_all(data.as_bytes())
            .map_err(|err| err.to_string())?;
        Ok(())
    }

    pub fn get_cur_sav_json(&self) -> Result<&Value, String> {
        if self.sav_vec.is_empty() {
            return Err("Empty Sav File".to_string());
        }

        Ok(&self.sav_vec[self.cur_sav].sav_json)
    }

    pub fn get_mut_cur_sav_json(&mut self) -> Result<&mut Value, String> {
        if self.sav_vec.is_empty() {
            return Err("Empty Sav File".to_string());
        }

        Ok(&mut self.sav_vec[self.cur_sav].sav_json)
    }
}

fn convert_base64_to_str(base64str: String) -> String {
    let cipher_bits = BASE64_STANDARD.decode(base64str.as_bytes()).unwrap();

    let decrypted = aes_dec_cbc(&cipher_bits, &KEY, &IV, Some("PKCS7")).expect("Decryption failed");

    let str = str::from_utf8(&decrypted).unwrap();

    String::from(str)
}

fn convert_str_to_base64(str: &str) -> String {
    let encrypted =
        aes_enc_cbc(str.as_bytes(), &KEY, &IV, Some("PKCS7")).expect("Encryption failed");

    let base64str = BASE64_STANDARD.encode(encrypted);

    base64str
}
