'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

const account1 = {
  owner: 'Jaubert Machado',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2021-06-27T17:01:17.194Z',
    '2021-06-28T23:36:17.929Z',
    '2021-06-30T10:51:36.790Z',
  ],
  currency: 'BRL',
  locale: 'pt-BR', // de-DE
};

const account2 = {
  owner: 'Joana Valdameri',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2021-06-27T14:43:26.374Z',
    '2021-06-29T18:49:59.371Z',
    '2021-06-30T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogo = document.querySelector('.logo');
const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

///////////////////////////////////////////////////////////////////////////////
///// FUNÇÕES

///// LOGOUT TIMER /////
const startLogoutTimer = function () {
  const tick = function () {
    let min = String(Math.trunc(time / 60)).padStart(2, 0);
    let sec = String(time % 60).padStart(2, 0);
    labelTimer.textContent = `${min}:${sec}`;

    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Faça login para acessar sua conta!';
      containerApp.style.opacity = 0;
    }

    time--;
  };

  let time = 120;
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

///// FUNÇÃO DE CALCULO DAS DATAS
const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'Hoje';
  if (daysPassed === 1) return 'Ontem';
  if (daysPassed <= 7) return `${daysPassed} dias atrás`;
  else {
    return new Intl.DateTimeFormat(locale).format(date);
  }
};

///// NUMBERS FUNCTION /////

const formatLocalNumbers = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

///// PAD FUNCTION /////
const pad = function (num) {
  return num.padStart(2, 0);
};

///// FUNÇÃO QUE MOSTRA AS MOVIMENTAÇÕES NO FEED DO APP /////
const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = ''; // REMOVEMOS TODO O HTML DE DENTRO DA DIV .MOVEMENTS

  const movs = sort
    ? acc.movements.slice().sort((a, b) => b - a)
    : acc.movements;

  movs.forEach(function (mov, i) {
    // CONSTRUIMOS A FUNCTION QUE INJETA NOSSO HTML COM OS DADOS DA ARRAY QUE FORNECEMOS AO FOREACH
    const type = mov > 0 ? 'deposito' : 'saque'; // TERNARY PARA DECIDIR SE É UM DEPOSITO OU SAQUE

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    const html = `<div class="movements__row">
    <div class="movements__type movements__type--${type}">${
      i + 1
    } - ${type}</div>
    <div class="movements__date">${displayDate}</div>
    <div class="movements__value">${formatLocalNumbers(
      mov,
      currentAcc.locale,
      currentAcc.currency
    )}</div>
  </div>`; // CRIAMOS UMA VARIAVEL COM O HTML EDITADO COM OS VALORES DA ARRAY E COM O INDEX DO FOREACH PARA FAZER A CONTAGEM

    containerMovements.insertAdjacentHTML('afterbegin', html); // AFTERBEGIN FAZ COM QUE COMECE DE BAIXO PARA CIMA, TODO NOVO ELEMENTO É COLOCADO ACIMA DO ANTERIOR
  });
};

///// FUNÇÃO QUE CALCULA O TOTAL DA CONTA E MOSTRA NO LOCAL DEFINIDO /////
const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);

  labelBalance.textContent = `${formatLocalNumbers(
    acc.balance,
    acc.locale,
    acc.currency
  )}`;
};

///// CALCULA TOTAL DE RENDA, SAQUE E JUROS /////

///// RENDA
const calcDisplaySumary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatLocalNumbers(
    incomes,
    currentAcc.locale,
    currentAcc.currency
  );

  ///// SAQUE
  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatLocalNumbers(
    Math.abs(out),
    currentAcc.locale,
    currentAcc.currency
  );

  ///// JUROS
  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((acc, int) => int + acc, 0);
  labelSumInterest.textContent = formatLocalNumbers(
    interest,
    currentAcc.locale,
    currentAcc.currency
  );
};

///// FUNÇÃO QUE CRIA USERNAMES BASEADOS NAS PRIMEIRAS LETRAS DE NOMES /////
const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};

createUsernames(accounts);

const updateUi = function (acc) {
  // MOSTRA OS MOVIMENTOS DA CONTA
  displayMovements(acc);
  // MOSTRA O SALDO DA CONTA
  calcDisplayBalance(acc);
  // MOSTRA O RESUMO DA CONTA
  calcDisplaySumary(acc);
};

///// EVENTOS /////
let currentAcc, timer;

/////// FAKE LOGGED IN /////
// currentAcc = account1;
// updateUi(currentAcc);
// containerApp.style.opacity = 100;

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();

  currentAcc = accounts.find(acc => acc.username === inputLoginUsername.value);

  if (currentAcc?.pin === +inputLoginPin.value) {
    labelWelcome.textContent = `Bem-vindo de volta, ${
      currentAcc.owner.split(' ')[0]
    }!`;
    containerApp.style.opacity = 100;

    ///// DATAS /////
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      // weekday: 'short',
    };

    // const locale = navigator.language;

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAcc.locale,
      options
    ).format(now);

    // LIMPA OS CAMPOS DE LOGIN
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Login timer check
    if (timer) clearInterval(timer);
    timer = startLogoutTimer();

    // CHAMA TODAS AS FUNCTIONS QUE ATUALIZAM A INTERFACE
    updateUi(currentAcc);
  }
});

btnTransfer.addEventListener('click', function (e) {
  // TIRA O COMPORTAMENTO PADRÃO DO FORM QUE É DE ATUALIZAR A PAGINA QUANDO O BOTÃO É CLICKADO
  e.preventDefault();

  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );

  if (
    // CHECA SE A QUANTIDADE É MAIOR QUE 0, SE A CONTA QUE IRÁ RECEBER EXISTE, SE A QUANTIDADE A SER TRANSFERIDA É MAIOR QUE O SALDO TOTAL DA CONTA ATUAL E SE A CONTA A RECEBER A TRANSFERENCIA É DIFERENTE DA A TRANSFERIR
    amount > 0 &&
    receiverAcc &&
    amount <= currentAcc.balance &&
    receiverAcc.username !== currentAcc.username
  ) {
    // FAZ A TRANSFERENCIA, TIRA DINHEIRO DA ARRAY DE UM E COLOCA NA ARRAY DO OUTRO
    currentAcc.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // ADICIONA DATA DA TRANSFERENCIA
    currentAcc.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // ATUALIZA A INTERFACE
    updateUi(currentAcc);

    // RESETA O TIMER
    clearInterval(timer);
    timer = startLogoutTimer();
  }

  // LIMPA OS CAMPOS DE TRANSFERENCIA
  inputTransferAmount.value = inputTransferTo.value = '';
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAcc.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // ADICIONA A QUANTIA AOS MOVIMENTOS
      currentAcc.movements.push(amount);

      // ADICIONA DATA AO EMPRESTIMO
      currentAcc.movementsDates.push(new Date().toISOString());

      // ATUALIZA INTERFACE
      updateUi(currentAcc);
    }, 3000);

    // RESETA O TIMER
    clearInterval(timer);
    timer = startLogoutTimer();
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    // CHECA SE OS DADOS NOS INPUTS SÃO COMPATIVES COM OS DADOS NO OBJETO
    currentAcc.username === inputCloseUsername.value &&
    currentAcc.pin === +inputClosePin.value
  ) {
    // PROCURA O INDEX DO OBJETO NO OBJETO ACCOUNTS
    const index = accounts.findIndex(
      acc => acc.username === currentAcc.username
    );
    // DELETA O OBJETO
    accounts.splice(index, 1);
    // ESCONDE A UI
    containerApp.style.opacity = 0;
  }
  // LIMPA OS CAMPOS
  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAcc, !sorted);
  sorted = !sorted;
});
