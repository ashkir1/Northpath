import Stripe from 'stripe'
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
export const PRICE_CENTS = parseInt(process.env.NEXT_PUBLIC_PRICE_CENTS || '69700')
