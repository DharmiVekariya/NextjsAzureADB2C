import NextAuth from "next-auth";
import AzureADB2C from 'next-auth/providers/azure-ad-b2c';

const tenantName = process.env.AZURE_AD_B2C_TENANT_NAME!;
const userFlow = process.env.AZURE_AD_B2C_PRIMARY_USER_FLOW!;
const issuer = `https://${tenantName}.b2clogin.com/${tenantName}/${userFlow}/v2.0`;

export const authConfig: any = {
  providers: [
    AzureADB2C({
      issuer,
      clientId: process.env.AZURE_AD_B2C_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_B2C_CLIENT_SECRET!,
      primaryUserFlow: userFlow,
      authorization: {
        params: {
          scope: `openid profile email offline_access https://${tenantName}.onmicrosoft.com/arms-api/api_read`,
        },
      },
      wellKnown: `https://${tenantName}.b2clogin.com/${tenantName}.onmicrosoft.com/${userFlow}/v2.0/.well-known/openid-configuration`,
    } as any) as any,
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account }: any) {
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
      }
      return token;
    },
    async session({ session, token }: any) {
      session.accessToken = token.accessToken;
      session.idToken = token.idToken;
      return session;
    },
    // Required for App Router
    authorized({ auth }: any) {
      return !!auth?.user;
    },
  },
};

export const { handlers } = NextAuth(authConfig);
export const { GET, POST } = handlers;
