import Stripe from 'stripe';

const stripe = new Stripe(
  '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'
);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    console.log(req.body.cartItems);

    try {
      const params = {
        submit_type: 'pay',
        mode: 'payment',
        payment_method_types: ['card'],
        billing_address_collection: 'auto',
        shipping_options: [{ shipping_rate: 'shr_1McXhrHs3winMsXJKMQfzcMR' }],
        line_items: req.body.map(item => {
          const img = item.image[0].asset._ref;
          const newImage = img
            .replace('image-', 'https://cdn.sanity.io/images/26uxqjd7/production/')
            .replace('-webp', '.webp');

          return {
            price_data: {
              currency: 'usd',
              product_data: {
                name: item.name,
                images: [newImage]
              },
              unit_amount: item.price * 100
            },
            adjustable_quantity: {
              enabled: true,
              minimum: 1
            },
            quantity: item.quantity
          };
        }),
        success_url: `${req.headers.origin}/success`,
        cancel_url: `${req.headers.origin}/canceled`
      };

      // Create Checkout Sessions from body params.
      const session = await stripe.checkout.sessions.create(params);

      res.status(200).json(session);
    } catch (err) {
      res.status(err.statusCode || 500).json(err.message);
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
