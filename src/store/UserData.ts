import { defineStore } from 'pinia';
import { Client, Cumulonimbus } from 'cumulonimbus-wrapper';

const clientOptions: Cumulonimbus.ClientOptions = {
  baseURL: '/api',
  baseThumbnailURL: `${window.location.protocol}//previews.${window.location.host}`
};

export type UserDataState = {
  client: Client | null;
  user: Cumulonimbus.Data.User | null;
  session: Cumulonimbus.Data.Session | null;
  loaded: boolean;
};

export const useUserData = defineStore('UserData', {
  state: () =>
    ({
      user: null,
      session: null,
      client: null,
      loaded: false
    } as UserDataState),
  actions: {
    async checkClientAuth() {
      try {
        await (this.client as unknown as Client).getSelfSessionByID();
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
        } else {
          throw error;
        }
      }
    },
    async login(payload: { user: string; pass: string; rememberMe: boolean }) {
      try {
        this.client = await Client.login(
          payload.user,
          payload.pass,
          payload.rememberMe,
          clientOptions
        );
        this.user = await this.client.getSelfUser();
        this.session = await this.client.getSelfSessionByID();
        localStorage.setItem('token', (this.client as any).token);
        return true;
      } catch (error) {
        if (error instanceof Cumulonimbus.ResponseError) {
          throw error;
        } else {
          console.error(error);
          return null;
        }
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
        this.client = await Client.createAccount(
          payload.username,
          payload.email,
          payload.password,
          payload.repeatPassword,
          payload.rememberMe,
          clientOptions
        );
        this.user = await this.client.getSelfUser();
        this.session = await this.client.getSelfSessionByID();
        localStorage.setItem('token', (this.client as any).token);
        return true;
      } catch (error) {
        if (error instanceof Cumulonimbus.ResponseError) {
          throw error;
        } else {
          console.error(error);
          return null;
        }
      }
    },
    async logout() {
      try {
        await this.client?.deleteSelfSessionByID(
          this.session?.iat.toString() as string
        );
        this.user = null;
        this.session = null;
        this.client = null;
        localStorage.removeItem('token');
        return true;
      } catch (error) {
        if (error instanceof Cumulonimbus.ResponseError) {
          throw error;
        } else {
          console.error(error);
          return null;
        }
      }
    },
    async restoreSession() {
      try {
        this.client = new Client(
          localStorage.getItem('token') as string,
          clientOptions
        );
        this.user = await this.client.getSelfUser();
        this.session = await this.client.getSelfSessionByID();
        return true;
      } catch (error) {
        if (error instanceof Cumulonimbus.ResponseError) {
          throw error;
        } else {
          console.error(error);
          return null;
        }
      } finally {
        this.loaded = true;
      }
    }
  }
});
