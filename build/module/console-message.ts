
type consoleMessage<Type> = (str: Type) => void;

const consoleText: consoleMessage<String> = (str) => {
  console.log(str);
}

const consoleItems: consoleMessage<Array<any>> = (arr) => {
  for(const [index, value] of arr) {
    console.log(`${index}: ${value}`);
  }
}

export {
  consoleText,
  consoleItems
};