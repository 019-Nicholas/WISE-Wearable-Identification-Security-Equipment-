#include <Arduino.h>
#include <SPI.h>
#include <MFRC522.h>
#include <Servo.h>

/* =========================
   PIN CONFIG
   ========================= */

#define RFID_SS     53
#define RFID_RST    49

#define SERVO_PIN   9

/* =========================
   RFID
   ========================= */

MFRC522 rfid(RFID_SS, RFID_RST);

const byte MASTER_UID[4] =
{
    0x01,
    0x02,
    0x03,
    0x04
};

/* =========================
   SERVO
   ========================= */

Servo lockServo;

/* =========================
   SYSTEM STATE
   ========================= */

bool lockState = true;

/* =========================
   UART BAREMETAL
   ========================= */

#define BAUD 9600
#define UBRR_VALUE ((F_CPU/(16UL*BAUD))-1)

void UART_Init()
{
    UBRR0H = (UBRR_VALUE >> 8);
    UBRR0L = UBRR_VALUE;

    UCSR0B =
        (1 << RXEN0);

    UCSR0C =
        (1 << UCSZ01) |
        (1 << UCSZ00);
}

char UART_Read()
{
    while (!(UCSR0A & (1 << RXC0)));

    return UDR0;
}

bool UART_Available()
{
    return (UCSR0A & (1 << RXC0));
}
/* =========================
   BUZZER
   D8 = PH5
   Passive Buzzer
   ========================= */

void beep(uint8_t times)
{
    for(uint8_t t = 0; t < times; t++)
    {
        for(uint16_t i = 0; i < 200; i++)
        {
            PORTH |= (1 << PH5);

            delayMicroseconds(250);

            PORTH &= ~(1 << PH5);

            delayMicroseconds(250);
        }

        delay(100);
    }
}

/* =========================
   LOCK
   ========================= */

void lockDoor()
{
    if(lockState)
        return;

    lockState = true;

    PORTH &= ~(1 << PH3);

    PORTH |= (1 << PH4);

    lockServo.write(0);

    beep(1);
}

/* =========================
   UNLOCK
   ========================= */

void unlockDoor()
{
    if(!lockState)
        return;

    lockState = false;

    PORTH |= (1 << PH3);

    PORTH &= ~(1 << PH4);

    lockServo.write(90);

    beep(2);
}

/* =========================
   RFID AUTH
   ========================= */

bool authorizedCard(MFRC522::Uid *uid)
{
    if(uid->size != 4)
        return false;

    for(uint8_t i = 0; i < 4; i++)
    {
        if(uid->uidByte[i] != MASTER_UID[i])
            return false;
    }

    return true;
}
/* =========================
   RFID PROCESS
   ========================= */

void processRFID()
{
    if(!rfid.PICC_IsNewCardPresent())
        return;

    if(!rfid.PICC_ReadCardSerial())
        return;

    if(authorizedCard(&rfid.uid))
    {
        unlockDoor();
    }

    rfid.PICC_HaltA();

    rfid.PCD_StopCrypto1();
}

/* =========================
   BUTTON PROCESS
   D2 = PE4
   D3 = PE5
   ========================= */

void processButtons()
{
    if(!(PINE & (1 << PE5)))
    {
        delay(20);

        if(!(PINE & (1 << PE5)))
        {
            unlockDoor();

            while(!(PINE & (1 << PE5)));
        }
    }

    if(!(PINE & (1 << PE4)))
    {
        delay(20);

        if(!(PINE & (1 << PE4)))
        {
            lockDoor();

            while(!(PINE & (1 << PE4)));
        }
    }
}

/* =========================
   UART PROCESS
   ========================= */

void processUART()
{
    static char buffer[20];

    static uint8_t index = 0;

    while(UART_Available())
    {
        char c = UART_Read();

        if(c == '\n')
        {
            buffer[index] = '\0';

            if(strstr(buffer, "CMD1"))
            {
                lockDoor();
            }

            else if(strstr(buffer, "CMD2"))
            {
                unlockDoor();
            }

            else if(strstr(buffer, "CMD3"))
            {
                beep(3);
            }

            index = 0;
        }
        else
        {
            if(index < sizeof(buffer)-1)
            {
                buffer[index++] = c;
            }
        }
    }
}
/* =========================
   SETUP
   ========================= */

void setup()
{
    /* D6 LED HIJAU */

    DDRH |= (1 << PH3);

    /* D7 LED MERAH */

    DDRH |= (1 << PH4);

    /* D8 BUZZER */

    DDRH |= (1 << PH5);

    /* D2 BUTTON RED */

    DDRE &= ~(1 << PE4);

    PORTE |= (1 << PE4);

    /* D3 BUTTON GREEN */

    DDRE &= ~(1 << PE5);

    PORTE |= (1 << PE5);

    UART_Init();

    lockServo.attach(SERVO_PIN);

    SPI.begin();

    rfid.PCD_Init();

    /* STATUS AWAL LOCK */

    lockState = true;

    PORTH &= ~(1 << PH3);

    PORTH |= (1 << PH4);

    lockServo.write(0);
}

/* =========================
   LOOP
   ========================= */

void loop()
{
    processButtons();

    processUART();

    processRFID();
}