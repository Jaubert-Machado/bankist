'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jaubert Machado',
  movements: [1252, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Joana Valdameri',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Cheesecake Pitanga',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Cupcake Pitanga',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

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

///// FUNÇÃO QUE MOSTRA AS MOVIMENTAÇÕES NO FEED DO APP /////
const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = ''; // REMOVEMOS TODO O HTML DE DENTRO DA DIV .MOVEMENTS

  const movs = sort ? movements.slice().sort((a, b) => b - a) : movements;

  movs.forEach(function (mov, i) {
    // CONSTRUIMOS A FUNCTION QUE INJETA NOSSO HTML COM OS DADOS DA ARRAY QUE FORNECEMOS AO FOREACH
    const type = mov > 0 ? 'deposito' : 'saque'; // TERNARY PARA DECIDIR SE É UM DEPOSITO OU SAQUE

    const html = `<div class="movements__row">
    <div class="movements__type movements__type--${type}">${
      i + 1
    } - ${type}</div>
    <div class="movements__value">${mov} R$</div>
  </div>`; // CRIAMOS UMA VARIAVEL COM O HTML EDITADO COM OS VALORES DA ARRAY E COM O INDEX DO FOREACH PARA FAZER A CONTAGEM

    containerMovements.insertAdjacentHTML('afterbegin', html); // AFTERBEGIN FAZ COM QUE COMECE DE BAIXO PARA CIMA, TODO NOVO ELEMENTO É COLOCADO ACIMA DO ANTERIOR
  });
};

///// FUNÇÃO QUE CALCULA O TOTAL DA CONTA E MOSTRA NO LOCAL DEFINIDO /////
const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${acc.balance} R$`;
};

///// CALCULA TOTAL DE RENDA, SAQUE E JUROS /////
///// RENDA
const calcDisplaySumary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes}R$`;
  ///// SAQUE
  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(out)}R$`;
  ///// JUROS
  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((acc, int) => int + acc, 0);
  labelSumInterest.textContent = `${interest}R$`;
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
  displayMovements(acc.movements);
  // MOSTRA O SALDO DA CONTA
  calcDisplayBalance(acc);
  // MOSTRA O RESUMO DA CONTA
  calcDisplaySumary(acc);
};

///// EVENTOS /////
let currentAcc;

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();

  currentAcc = accounts.find(acc => acc.username === inputLoginUsername.value);

  if (currentAcc?.pin === Number(inputLoginPin.value)) {
    labelWelcome.textContent = `Bem-vindo de volta, ${
      currentAcc.owner.split(' ')[0]
    }!`;
    containerApp.style.opacity = 100;

    // LIMPA OS CAMPOS DE LOGIN
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    // CHAMA TODAS AS FUNCTIONS QUE ATUALIZAM A INTERFACE
    updateUi(currentAcc);
  }
});

btnTransfer.addEventListener('click', function (e) {
  // TIRA O COMPORTAMENTO PADRÃO DO FORM QUE É DE ATUALIZAR A PAGINA QUANDO O BOTÃO É CLICKADO
  e.preventDefault();

  const amount = Number(inputTransferAmount.value);
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
    // ATUALIZA A INTERFACE
    updateUi(currentAcc);
  }

  // LIMPA OS CAMPOS DE TRANSFERENCIA
  inputTransferAmount.value = inputTransferTo.value = '';
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Number(inputLoanAmount.value);

  if (amount > 0 && currentAcc.movements.some(mov => mov >= amount * 0.1)) {
    currentAcc.movements.push(amount);

    updateUi(currentAcc);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    // CHECA SE OS DADOS NOS INPUTS SÃO COMPATIVES COM OS DADOS NO OBJETO
    currentAcc.username === inputCloseUsername.value &&
    currentAcc.pin === Number(inputClosePin.value)
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
  displayMovements(currentAcc.movements, !sorted);
  sorted = !sorted;
});

