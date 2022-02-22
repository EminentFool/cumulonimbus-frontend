import { defineStore } from 'pinia';
import { Cumulonimbus, Client } from '../../../cumulonimbus-wrapper';

const clientOptions: Cumulonimbus.ClientOptions = {
  baseURL: '/api',
  baseThumbnailURL: `${window.location.protocol}//previews.${window.location.host}`
};

export type UserStore = {
  user: Cumulonimbus.Data.User | null;
  session: Cumulonimbus.Data.Session | null;
  client: Client | null;
  loaded: boolean;
};

export const useUserStore = defineStore({
  id: 'user',

  state: () =>
    ({
      user: null,
      session: null,
      client: null,
      loaded: false
    } as UserStore),

  actions: {
    async checkClientAuth() {
      try {
        await this.client?.getSelfSessionByID();
        return true;
      } catch (error) {
        if (error instanceof Cumulonimbus.ResponseError) {
          if (error.code === 'INVALID_SESSION_ERROR') {
            this.user = null;
            this.session = null;
            this.client = null;
            localStorage.removeItem('token');
            return false;
          } else {
            throw error;
          }
        }
      }
    },
    async login(payload: { user: string; pass: string; rememberMe: boolean }) {
      try {
        let client = await Client.login(
          payload.user,
          payload.pass,
          payload.rememberMe,
          clientOptions
        );
        this.client = client;
        this.user = await client.getSelfUser();
        this.session = await client.getSelfSessionByID();
      } catch (error) {
        throw error;
      }
    },

    async createAccount(payload: {
      username: string;
      email: string;
      password: string;
      repeatPassword: string;
      rememberMe: boolean;
    }) {
      try {
        let client = await Client.createAccount(
          payload.username,
          payload.email,
          payload.password,
          payload.repeatPassword,
          payload.rememberMe,
          clientOptions
        );
        this.client = client;
        this.user = await client.getSelfUser();
        this.session = await client.getSelfSessionByID();
      } catch (error) {
        throw error;
      }
    },

    async logout() {
      try {
        await this.client?.deleteSelfSessionByID(
          this.session?.iat?.toString() as string
        );
        this.user = null;
        this.session = null;
        this.client = null;
        localStorage.removeItem('token');
        return true;
      } catch (error) {
        throw error;
      }
    },

    async restoreSession() {
      try {
        let token = localStorage.getItem('token');
        if (token) {
          let client = new Client(token, clientOptions);
          this.client = client;
          this.user = await client.getSelfUser();
          this.session = await client.getSelfSessionByID();
          this.loaded = true;
          return true;
        } else return false;
      } catch (error) {
        throw error;
      }
    }
  }
});
