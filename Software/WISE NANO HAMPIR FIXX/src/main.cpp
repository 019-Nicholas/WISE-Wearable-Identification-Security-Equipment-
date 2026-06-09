#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#include <avr/io.h>
#include <stdio.h>
#include <string.h>

/* =========================
   OLED
   ========================= */

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64

Adafruit_SSD1306 display(
    SCREEN_WIDTH,
    SCREEN_HEIGHT,
    &Wire,
    -1);

/* =========================
   UART BAREMETAL
   ========================= */

#define BAUD 9600
#define UBRR_VALUE ((F_CPU/(16UL*BAUD))-1)

int uart_putchar(char c, FILE *stream)
{
    while (!(UCSR0A & (1 << UDRE0)));

    UDR0 = c;

    return 0;
}

static FILE mystdout;

void UART_Init()
{
    UBRR0H = (UBRR_VALUE >> 8);

    UBRR0L = UBRR_VALUE;

    UCSR0B =
        (1 << RXEN0) |
        (1 << TXEN0);

    UCSR0C =
        (1 << UCSZ01) |
        (1 << UCSZ00);

    fdev_setup_stream(
        &mystdout,
        uart_putchar,
        NULL,
        _FDEV_SETUP_WRITE);

    stdout = &mystdout;
}

char UART_Read()
{
    return UDR0;
}

uint8_t UART_Available()
{
    return (UCSR0A & (1 << RXC0));
}

/* =========================
   BUTTON
   ========================= */

#define BTN_PIN PD2

uint8_t clickCount = 0;
uint8_t buttonState = 0;
uint8_t longPressTriggered = 0;

uint16_t holdCounter = 0;
uint16_t clickTimeout = 0;
/* =========================
   OLED STATUS
   ========================= */

char vehicleStatus[20] = "LOCKED";

char popupMessage[20] = "";

unsigned long popupTimer = 0;

bool needRefresh = true;

/* =========================
   OLED SHOW
   ========================= */

void OLED_Show()
{
    display.clearDisplay();

    display.setTextColor(
        SSD1306_WHITE);

    display.setTextSize(2);

    display.setCursor(30, 0);

    display.print("WISE");

    display.setTextSize(1);

    if(strlen(popupMessage) > 0)
    {
        display.setCursor(
            10,
            35);

        display.print(
            popupMessage);
    }
    else
    {
        display.setCursor(
            18,
            30);

        display.print(
            "STATUS");

        display.setCursor(
            25,
            48);

        display.print(
            vehicleStatus);
    }

    display.display();
}

/* =========================
   UART RX PROCESS
   ========================= */

void processIncomingStatus()
{
    static char buffer[32];
    static uint8_t index = 0;

    while (UART_Available())
    {
        char c = UART_Read();

        if (c == '\r') continue; // abaikan carriage return

        if (c == '\n')
        {
            if (index > 0) // hanya proses kalau ada isi
            {
                buffer[index] = '\0';
                strcpy(vehicleStatus, buffer);
                needRefresh = true;
                index = 0;
            }
        }
        else
        {
            if (index < sizeof(buffer) - 1)
            {
                buffer[index++] = c;
            }
        }
    }
}
/* =========================
   BUTTON PROCESS
   ========================= */

void processButton()
{
    uint8_t pressed =
        !(PIND & (1 << BTN_PIN));

    /* =====================
       BUTTON PRESSED
       ===================== */

    if(pressed)
    {
        if(!buttonState)
        {
            buttonState = 1;

            holdCounter = 0;
        }

        holdCounter++;

        /* Long Press 2 detik */

        if(holdCounter >= 200 &&
           !longPressTriggered)
        {
            printf("CMD3\n");

            strcpy(
                popupMessage,
                "ALARM SENT");

            popupTimer =
                millis();

            needRefresh = true;

            longPressTriggered = 1;

            clickCount = 0;

            clickTimeout = 0;
        }
    }

    /* =====================
       BUTTON RELEASED
       ===================== */

    else
    {
        if(buttonState)
        {
            if(!longPressTriggered)
            {
                clickCount++;

                clickTimeout = 0;
            }
            else
            {
                longPressTriggered = 0;

                clickCount = 0;

                clickTimeout = 0;
            }
        }

        buttonState = 0;

        holdCounter = 0;
    }

    /* =====================
       SINGLE / DOUBLE CLICK
       ===================== */

    if(clickCount > 0)
    {
        clickTimeout++;

        /* 40 x 10ms = 400ms */

        if(clickTimeout >= 40)
        {
            if(clickCount == 1)
            {
                printf("CMD1\n");

                strcpy(
                    popupMessage,
                    "LOCK SENT");
            }
            else
            {
                printf("CMD2\n");

                strcpy(
                    popupMessage,
                    "UNLOCK SENT");
            }

            popupTimer =
                millis();

            needRefresh = true;

            clickCount = 0;

            clickTimeout = 0;
        }
    }

    /* =====================
       POPUP TIMEOUT
       ===================== */

    if(strlen(popupMessage) > 0)
    {
        if(millis() - popupTimer > 1500)
        {
            popupMessage[0] = '\0';

            needRefresh = true;
        }
    }
}
/* =========================
   SETUP
   ========================= */

void setup()
{
    /* UART Baremetal */

    UART_Init();

    /* BUTTON D2 INPUT_PULLUP */

    DDRD &= ~(1 << BTN_PIN);

    PORTD |= (1 << BTN_PIN);

    /* OLED */

    if(!display.begin(
        SSD1306_SWITCHCAPVCC,
        0x3C))
    {
        while(true);
    }

    display.clearDisplay();

    strcpy(
        vehicleStatus,
        "LOCKED");

    needRefresh = true;

    OLED_Show();
}

/* =========================
   LOOP
   ========================= */

void loop()
{
    processIncomingStatus();

    static unsigned long lastTick = 0;
    if (millis() - lastTick >= 10)
    {
        lastTick = millis();
        processButton(); // tetap dipanggil tiap ~10ms
    }

    if (needRefresh)
    {
        OLED_Show();
        needRefresh = false;
    }
    // TIDAK ADA delay() di sini
}