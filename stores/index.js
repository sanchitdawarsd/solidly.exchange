import AccountStore from './accountStore';
import StableSwapStore from './stableSwapStore';

const Dispatcher = require('flux').Dispatcher;
const Emitter = require('events').EventEmitter;

const dispatcher = new Dispatcher();
const emitter = new Emitter();

const accountStore = new AccountStore(dispatcher, emitter);
const stableSwapStore = new StableSwapStore(dispatcher, emitter);

export default {
  accountStore: accountStore,
  stableSwapStore: stableSwapStore,
  dispatcher: dispatcher,
  emitter: emitter,
};
