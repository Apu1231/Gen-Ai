
const calculator = document.querySelector('.calculator');
const calculatorScreen = document.querySelector('.calculator-screen');
const buttons = document.querySelector('.calculator-buttons');

let prevValue = '';
let currentValue = '0';
let operator = '';
let waitingForSecondOperand = false;

function updateScreen() {
    calculatorScreen.value = currentValue;
}

buttons.addEventListener('click', (event) => {
    const { target } = event;

    if (!target.matches('button')) {
        return;
    }

    if (target.classList.contains('operator')) {
        handleOperator(target.value);
        updateScreen();
        return;
    }

    if (target.classList.contains('decimal')) {
        inputDecimal(target.value);
        updateScreen();
        return;
    }

    if (target.classList.contains('clear')) {
        resetCalculator();
        updateScreen();
        return;
    }

    if (target.classList.contains('equal-sign')) {
        if (operator && prevValue !== '') {
            calculate();
            updateScreen();
            resetOperatorAndPrevValue();
        }
        return;
    }

    inputDigit(target.value);
    updateScreen();
});

function inputDigit(digit) {
    if (waitingForSecondOperand) {
        currentValue = digit;
        waitingForSecondOperand = false;
    } else {
        currentValue = currentValue === '0' ? digit : currentValue + digit;
    }
}

function inputDecimal(dot) {
    if (waitingForSecondOperand) {
        currentValue = '0.';
        waitingForSecondOperand = false;
        return;
    }
    if (!currentValue.includes(dot)) {
        currentValue += dot;
    }
}

function handleOperator(nextOperator) {
    if (operator && waitingForSecondOperand) {
        operator = nextOperator;
        return;
    }

    if (prevValue === '') {
        prevValue = currentValue;
    } else if (operator) {
        const result = operate(parseFloat(prevValue), parseFloat(currentValue), operator);
        currentValue = String(result);
        prevValue = String(result);
    }

    waitingForSecondOperand = true;
    operator = nextOperator;
}

function calculate() {
    let result = operate(parseFloat(prevValue), parseFloat(currentValue), operator);
    currentValue = String(result);
    prevValue = ''; // Clear previous value after calculation
}

function resetOperatorAndPrevValue() {
    operator = '';
    prevValue = '';
}

function operate(num1, num2, op) {
    switch (op) {
        case '+':
            return num1 + num2;
        case '-':
            return num1 - num2;
        case '*':
            return num1 * num2;
        case '/':
            return num1 / num2;
        default:
            return num2;
    }
}

function resetCalculator() {
    currentValue = '0';
    prevValue = '';
    operator = '';
    waitingForSecondOperand = false;
}
