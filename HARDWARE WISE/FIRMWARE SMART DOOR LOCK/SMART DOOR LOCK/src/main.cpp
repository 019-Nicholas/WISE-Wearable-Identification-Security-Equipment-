#include <Arduino.h>
#include <SPI.h>
#include <Servo.h>
#include <MFRC522.h>

// ==========================
// PIN ARDUINO MEGA
// ==========================
#define PIN_SERVO       9

#define PIN_LED_MERAH   7
#define PIN_LED_HIJAU   6
#define PIN_BUZZER      8

#define PIN_BTN_BUKA    3
#define PIN_BTN_TUTUP   2

#define PIN_RFID_SS     53
#define PIN_RFID_RST    49

// ==========================
// POSISI SERVO
// ==========================
#define POSISI_TUTUP    0
#define POSISI_BUKA     90

// ==========================
// RFID
// ==========================
MFRC522 rfid(PIN_RFID_SS, PIN_RFID_RST);
Servo servoKunci;

// Untuk simulasi Wokwi, true berarti semua kartu RFID diterima.
// Kalau nanti alat asli, ubah ke false dan masukkan UID kartu yang valid.
const bool ALLOW_ANY_RFID_CARD = true;

// UID contoh. Ganti dengan UID kartu kamu kalau ALLOW_ANY_RFID_CARD = false.
byte authorizedUID[][4] = {
  {0x01, 0x02, 0x03, 0x04},
  {0xDE, 0xAD, 0xBE, 0xEF}
};

const byte TOTAL_AUTH_UID = sizeof(authorizedUID) / sizeof(authorizedUID[0]);

// ==========================
// AUTO CLOSE RFID
// ==========================
bool kondisiTerbuka = false;
bool autoCloseAktif = false;

unsigned long waktuMulaiTerbuka = 0;
const unsigned long waktuAutoClose = 5000; // 5 detik

// ==========================
// DEBOUNCE TOMBOL
// ==========================
bool lastBukaReading = HIGH;
bool lastTutupReading = HIGH;

bool stableBukaState = HIGH;
bool stableTutupState = HIGH;

unsigned long lastBukaDebounce = 0;
unsigned long lastTutupDebounce = 0;

const unsigned long debounceDelay = 40;

// ==========================
// BUZZER
// ==========================
void beepBuka() {
  tone(PIN_BUZZER, 1500, 120);
  delay(150);
  tone(PIN_BUZZER, 2000, 120);
  delay(150);
  noTone(PIN_BUZZER);
}

void beepTutup() {
  tone(PIN_BUZZER, 1000, 180);
  delay(200);
  noTone(PIN_BUZZER);
}

void beepDitolak() {
  tone(PIN_BUZZER, 400, 200);
  delay(250);
  tone(PIN_BUZZER, 350, 200);
  delay(250);
  noTone(PIN_BUZZER);
}

// ==========================
// FUNGSI BUKA DAN TUTUP
// ==========================
void bukaKunciManual() {
  kondisiTerbuka = true;
  autoCloseAktif = false;

  servoKunci.write(POSISI_BUKA);

  digitalWrite(PIN_LED_HIJAU, HIGH);
  digitalWrite(PIN_LED_MERAH, LOW);

  Serial.println("PINTU TERBUKA - MANUAL");

  beepBuka();
}

void bukaKunciRFID() {
  kondisiTerbuka = true;
  autoCloseAktif = true;
  waktuMulaiTerbuka = millis();

  servoKunci.write(POSISI_BUKA);

  digitalWrite(PIN_LED_HIJAU, HIGH);
  digitalWrite(PIN_LED_MERAH, LOW);

  Serial.println("PINTU TERBUKA - RFID");
  Serial.println("AUTO CLOSE AKTIF: pintu akan menutup dalam 5 detik");

  beepBuka();
}

void tutupKunci() {
  kondisiTerbuka = false;
  autoCloseAktif = false;

  servoKunci.write(POSISI_TUTUP);

  digitalWrite(PIN_LED_HIJAU, LOW);
  digitalWrite(PIN_LED_MERAH, HIGH);

  Serial.println("PINTU TERKUNCI / TERTUTUP");

  beepTutup();
}

// ==========================
// CEK TOMBOL
// ==========================
bool tombolDitekan(
  uint8_t pin,
  bool &lastReading,
  bool &stableState,
  unsigned long &lastDebounce
) {
  bool reading = digitalRead(pin);

  if (reading != lastReading) {
    lastDebounce = millis();
    lastReading = reading;
  }

  if ((millis() - lastDebounce) > debounceDelay) {
    if (reading != stableState) {
      stableState = reading;

      if (stableState == LOW) {
        return true;
      }
    }
  }

  return false;
}

void handleTombol() {
  if (tombolDitekan(PIN_BTN_BUKA, lastBukaReading, stableBukaState, lastBukaDebounce)) {
    bukaKunciManual();
  }

  if (tombolDitekan(PIN_BTN_TUTUP, lastTutupReading, stableTutupState, lastTutupDebounce)) {
    tutupKunci();
  }
}

// ==========================
// RFID
// ==========================
void printRFIDUID() {
  Serial.print("RFID UID: ");

  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) {
      Serial.print("0");
    }

    Serial.print(rfid.uid.uidByte[i], HEX);

    if (i < rfid.uid.size - 1) {
      Serial.print(" ");
    }
  }

  Serial.println();
}

bool kartuValid() {
  if (ALLOW_ANY_RFID_CARD) {
    return true;
  }

  if (rfid.uid.size != 4) {
    return false;
  }

  for (byte card = 0; card < TOTAL_AUTH_UID; card++) {
    bool cocok = true;

    for (byte i = 0; i < 4; i++) {
      if (rfid.uid.uidByte[i] != authorizedUID[card][i]) {
        cocok = false;
        break;
      }
    }

    if (cocok) {
      return true;
    }
  }

  return false;
}

void handleRFID() {
  if (!rfid.PICC_IsNewCardPresent()) {
    return;
  }

  if (!rfid.PICC_ReadCardSerial()) {
    return;
  }

  printRFIDUID();

  if (kartuValid()) {
    bukaKunciRFID();
  } else {
    Serial.println("KARTU RFID DITOLAK");
    beepDitolak();
  }

  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
}

// ==========================
// AUTO CLOSE SETELAH RFID
// ==========================
void handleAutoClose() {
  if (autoCloseAktif && kondisiTerbuka) {
    if (millis() - waktuMulaiTerbuka >= waktuAutoClose) {
      Serial.println("AUTO CLOSE: 5 detik selesai");
      tutupKunci();
    }
  }
}

// ==========================
// SETUP
// ==========================
void setup() {
  Serial.begin(9600);

  pinMode(PIN_LED_MERAH, OUTPUT);
  pinMode(PIN_LED_HIJAU, OUTPUT);
  pinMode(PIN_BUZZER, OUTPUT);

  pinMode(PIN_BTN_BUKA, INPUT_PULLUP);
  pinMode(PIN_BTN_TUTUP, INPUT_PULLUP);

  servoKunci.attach(PIN_SERVO);

  SPI.begin();
  rfid.PCD_Init();

  tutupKunci();

  Serial.println("================================");
  Serial.println("SMART DOOR LOCK READY");
  Serial.println("================================");
  Serial.println("Button buka  : pin 3");
  Serial.println("Button tutup : pin 2");
  Serial.println("Servo        : pin 9");
  Serial.println("LED merah    : pin 7");
  Serial.println("LED hijau    : pin 6");
  Serial.println("Buzzer       : pin 8");
  Serial.println("RFID SS/SDA  : pin 53");
  Serial.println("RFID RST     : pin 49");
  Serial.println("RFID SCK     : pin 52");
  Serial.println("RFID MOSI    : pin 51");
  Serial.println("RFID MISO    : pin 50");
  Serial.println("================================");
  Serial.println("Mode RFID: tap kartu -> buka -> tutup otomatis 5 detik");
  Serial.println("================================");
}

// ==========================
// LOOP
// ==========================
void loop() {
  handleTombol();
  handleRFID();
  handleAutoClose();
}