import { createContext } from 'react';
import firebase from 'firebase/app';

interface Context{
    user: any;
    username: string | null;
}

export const UserContext = createContext(<Context>{ user: {}, username: null});