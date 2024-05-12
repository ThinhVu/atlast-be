// @ts-ignore
import checkoutNodeJssdk from '@paypal/checkout-server-sdk';

export default async function usePaypal() {
  console.log('[plugin] usePaypal')
  const clientId = process.env.PAYPAL_CLIENT
  const appSecret = process.env.PAYPAL_SECRET
  if (clientId && appSecret) {
    console.log('[Paypal] create client')
    const CTOR = (
      process.env.PAYPAL_ENV === 'sandbox'
        ? checkoutNodeJssdk.core.SandboxEnvironment
        : checkoutNodeJssdk.core.LiveEnvironment
    );
    const ppEnv = new CTOR(clientId, appSecret);
    // @ts-ignore
    global.paypalClient = new checkoutNodeJssdk.core.PayPalHttpClient(ppEnv);
  } else {
    console.warn('[Paypal] missing client id or app secret')
  }
}
