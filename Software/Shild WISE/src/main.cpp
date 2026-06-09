#include <avr/io.h>
#include <util/delay.h>
#include <stdint.h>

/* =========================
   PIN CONFIG
   =========================

   D22 = PA0 = LED_LOCK
   D23 = PA1 = LED_OPEN
   D24 = PA2 = LED_SERVO

   D11 = PB5 = BUZZER

   D10 = PB4 = BTN_OPEN
   D9  = PH6 = BTN_LOCK
   D8  = PH5 = BTN_RFID
   D7  = PH4 = BTN_NANO

   ========================= */

#define LED_LOCK_PIN   PA0
#define LED_OPEN_PIN   PA1
#define LED_SERVO_PIN  PA2

#define BUZZER_PIN     PB5

#define BTN_OPEN_PIN   PB4
#define BTN_LOCK_PIN   PH6
#define BTN_RFID_PIN   PH5
#define BTN_NANO_PIN   PH4

volatile uint8_t lockState = 1;

/* =========================
   NANO BUTTON STATE
   ========================= */

uint8_t clickCount = 0;
uint8_t buttonState = 0;
uint8_t longPressTriggered = 0;

uint16_t holdCounter = 0;
uint16_t clickTimeout = 0;

/* =========================
   BUZZER
   ========================= */

void beep(uint8_t times)
{
    for(uint8_t t=0; t<times; t++)
    {
        for(uint16_t i=0; i<250; i++)
        {
            PORTB |= (1<<BUZZER_PIN);

            _delay_us(250);

            PORTB &= ~(1<<BUZZER_PIN);

            _delay_us(250);
        }

        _delay_ms(100);
    }
}

/* =========================
   LOCK
   ========================= */

void lockDoor(void)
{
    if(lockState)
        return;

    lockState = 1;

    PORTA |= (1<<LED_LOCK_PIN);

    PORTA &= ~(1<<LED_OPEN_PIN);

    PORTA &= ~(1<<LED_SERVO_PIN);

    beep(1);
}

/* =========================
   UNLOCK
   ========================= */

void unlockDoor(void)
{
    if(!lockState)
        return;

    lockState = 0;

    PORTA &= ~(1<<LED_LOCK_PIN);

    PORTA |= (1<<LED_OPEN_PIN);

    PORTA |= (1<<LED_SERVO_PIN);

    beep(2);
}

/* =========================
   INIT
   ========================= */

void IO_Init(void)
{
    /* LED OUTPUT */

    DDRA |= (1<<LED_LOCK_PIN);
    DDRA |= (1<<LED_OPEN_PIN);
    DDRA |= (1<<LED_SERVO_PIN);

    /* BUZZER OUTPUT */

    DDRB |= (1<<BUZZER_PIN);

    /* BTN_OPEN D10 */

    DDRB &= ~(1<<BTN_OPEN_PIN);
    PORTB |= (1<<BTN_OPEN_PIN);

    /* BTN_LOCK D9 */

    DDRH &= ~(1<<BTN_LOCK_PIN);
    PORTH |= (1<<BTN_LOCK_PIN);

    /* BTN_RFID D8 */

    DDRH &= ~(1<<BTN_RFID_PIN);
    PORTH |= (1<<BTN_RFID_PIN);

    /* BTN_NANO D7 */

    DDRH &= ~(1<<BTN_NANO_PIN);
    PORTH |= (1<<BTN_NANO_PIN);
}

/* =========================
   BTN OPEN
   ========================= */

void processOpenButton(void)
{
    if(!(PINB & (1<<BTN_OPEN_PIN)))
    {
        _delay_ms(20);

        if(!(PINB & (1<<BTN_OPEN_PIN)))
        {
            unlockDoor();

            while(!(PINB & (1<<BTN_OPEN_PIN)));
        }
    }
}

/* =========================
   BTN LOCK
   ========================= */

void processLockButton(void)
{
    if(!(PINH & (1<<BTN_LOCK_PIN)))
    {
        _delay_ms(20);

        if(!(PINH & (1<<BTN_LOCK_PIN)))
        {
            lockDoor();

            while(!(PINH & (1<<BTN_LOCK_PIN)));
        }
    }
}

/* =========================
   BTN RFID
   ========================= */

void processRFIDButton(void)
{
    if(!(PINH & (1<<BTN_RFID_PIN)))
    {
        _delay_ms(20);

        if(!(PINH & (1<<BTN_RFID_PIN)))
        {
            unlockDoor();

            while(!(PINH & (1<<BTN_RFID_PIN)));
        }
    }
}

/* =========================
   BTN NANO
   1 CLICK = LOCK
   2 CLICK = UNLOCK
   HOLD = ALARM
   ========================= */

void processNanoButton(void)
{
    uint8_t pressed =
        !(PINH & (1<<BTN_NANO_PIN));

    /* BUTTON PRESSED */

    if(pressed)
    {
        if(!buttonState)
        {
            buttonState = 1;

            holdCounter = 0;
        }

        holdCounter++;

        /* 2 DETIK */

        if(holdCounter >= 200 &&
           !longPressTriggered)
        {
            beep(3);

            longPressTriggered = 1;

            clickCount = 0;

            clickTimeout = 0;
        }
    }

    /* BUTTON RELEASED */

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
            }
        }

        buttonState = 0;

        holdCounter = 0;
    }

    /* CLICK TIMER */

    if(clickCount > 0)
    {
        clickTimeout++;

        /* 400ms */

        if(clickTimeout >= 40)
        {
            if(clickCount == 1)
            {
                lockDoor();
            }
            else if(clickCount == 2)
            {
                unlockDoor();
            }

            clickCount = 0;

            clickTimeout = 0;
        }
    }
}

/* =========================
   MAIN
   ========================= */

int main(void)
{
    IO_Init();

    /* STATUS AWAL LOCK */

    lockState = 1;

    PORTA |= (1<<LED_LOCK_PIN);

    PORTA &= ~(1<<LED_OPEN_PIN);

    PORTA &= ~(1<<LED_SERVO_PIN);

    while(1)
    {
        processOpenButton();

        processLockButton();

        processRFIDButton();

        processNanoButton();

        _delay_ms(10);
    }

    return 0;
}