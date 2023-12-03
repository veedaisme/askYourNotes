import { ILocalDbInput } from "./localDb.interface";

const localStore: any = {};

const set = (messages = [], userInput: ILocalDbInput) => {
  const { username } = userInput;
  
  let currentUserStore = localStore[username];

  if (!currentUserStore) {
    localStore[username] = [];
    currentUserStore = localStore[username];
  }

  currentUserStore.push(...messages);

  localStore[username] = currentUserStore;
}

const get = (username: string) => {
  const currentUserStore = localStore[username];

  if (!currentUserStore) {
    localStore[username] = [];
  }

  return localStore[username]; 
}

const localStorage = {
  set,
  get
}

export default localStorage;