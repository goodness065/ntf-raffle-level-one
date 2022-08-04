import {loadStdlib} from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';
const stdlib = loadStdlib(process.env);

const startingBalance = stdlib.parseCurrency(100);

const [ accAlice, accBob ] =
  await stdlib.newTestAccounts(2, startingBalance);
console.log('Hello, Alice and Bob!');

console.log('Launching...');
const ctcAlice = accAlice.contract(backend);
const ctcBob = accBob.contract(backend, ctcAlice.getInfo());

console.log("Alice is creating the NFT");

const theNFT = await stdlib.launchToken(accAlice, "Chijioke", "NFT", { supply: 1 });
const nftObject = {
  nftId: theNFT.id,
  numTickets: 10, 
};

const OUTCOME = ["Bob's raffle number is not a match", "Bob's raffle number matches!"];

await accBob.tokenAccept(nftObject.nftId);

const Shared = {
  getNum: (numTickets) => {
    const num = (Math.floor(Math.random() * numTickets) + 1);
    return num;
  },
  seeOutcome: (num) => {
    console.log(`${OUTCOME[num]}`)
  }
}

console.log('Starting backends...');
await Promise.all([
  backend.Alice(ctcAlice, {
    ...stdlib.hasRandom,
    ...Shared,
    startRaffle: () => {
      console.log('The Raffle information is being sent to the contract');
      return nftObject;
    },
    seeHash: (value) => {
      console.log(`Winning HASH number: ${value}`)
    }
    // implement Alice's interact object here
  }),
  backend.Bob(ctcBob, {
    ...stdlib.hasRandom,
    ...Shared,
    showNum: (num) => {
      console.log(`Bob's raffle number is ${num}`);
    },
    seeWinner: (num) => {
      console.log(`The winning raffle number is ${num}`);
    }
    // implement Bob's interact object here
  }),
]);

console.log('Goodbye, Alice and Bob!');
