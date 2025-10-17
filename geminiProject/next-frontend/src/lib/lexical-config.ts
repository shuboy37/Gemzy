import { InitialConfigType } from '@lexical/react/LexicalComposer';

export const lexicalConfig: InitialConfigType = {
  namespace: 'chat-input',
  theme: {},
  onError: (error: Error) => {
    console.error('Lexical Error:', error);
  },
  nodes: [],
};