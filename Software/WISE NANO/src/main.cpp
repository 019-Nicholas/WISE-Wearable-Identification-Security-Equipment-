#include <avr/io.h>
#include <util/delay.h>
#include <stdio.h>

#define BAUD 9600
#define UBRR_VALUE ((F_CPU / (16UL * BAUD)) - 1)

/* =========================
   UART
   ========================= */

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

    /* TX ONLY */

    UCSR0B = (1 << TXEN0);

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

/* =========================
   BUTTON
   D2 = PD2
   ========================= */

#define BTN_PIN PD2

volatile uint8_t clickCount = 0;
volatile uint8_t buttonState = 0;
volatile uint8_t longPressTriggered = 0;

volatile uint16_t holdCounter = 0;
volatile uint16_t clickTimeout = 0;

/* =========================
   MAIN
   ========================= */

int main()
{
    UART_Init();

    /* D2 INPUT_PULLUP */

    DDRD &= ~(1 << BTN_PIN);

    PORTD |= (1 << BTN_PIN);

    while (1)
    {
        uint8_t pressed =
            !(PIND & (1 << BTN_PIN));

        /* =====================
           BUTTON PRESSED
           ===================== */

        if (pressed)
        {
            if (!buttonState)
            {
                buttonState = 1;

                holdCounter = 0;
            }

            holdCounter++;

            /* 2 DETIK */

            if (holdCounter >= 200 &&
                !longPressTriggered)
            {
                printf("CMD3\n");

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
            if (buttonState)
            {
                if (!longPressTriggered)
                {
                    clickCount++;

                    clickTimeout = 0;
                }
                else
                {
                    /* Reset setelah CMD3 */

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

        if (clickCount > 0)
        {
            clickTimeout++;

            /* 100 x 10ms = 1 detik */

            if (clickTimeout >= 100)
            {
                if (clickCount == 1)
                {
                    printf("CMD1\n");
                }
                else
                {
                    /* 2 klik atau lebih */

                    printf("CMD2\n");
                }

                clickCount = 0;

                clickTimeout = 0;
            }
        }

        _delay_ms(10);
    }

    return 0;
}