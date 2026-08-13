import React from 'react'

export default function Terms() {
  return (
    <div className="min-h-screen bg-white px-4 py-24 text-zinc-900 dark:bg-black dark:text-white">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-2 text-5xl font-black">Terms of Service</h1>
        <p className="mb-12 text-sm text-zinc-500 dark:text-zinc-400">Last updated: June 4, 2026</p>

        <div className="space-y-8 text-zinc-700 dark:text-zinc-300">
          <section>
            <h2 className="mb-3 text-2xl font-bold text-zinc-900 dark:text-white">1. Agreement to Terms</h2>
            <p>
              By accessing or purchasing from NEVER BEFORE COSMETIC, you agree to be bound by these Terms of Service. 
              If you do not agree, please do not use our website or services.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold text-zinc-900 dark:text-white">2. Products & Pricing</h2>
            <p className="mb-2">
              All prices are listed in Ghana Cedis (₵) and include applicable taxes unless stated otherwise. 
              We reserve the right to change prices at any time without notice.
            </p>
            <p>
              Product shades may vary slightly due to screen differences. Refer to our ritual guide before purchasing 
              to ensure the perfect match for your skin.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold text-zinc-900 dark:text-white">3. Orders & Payment</h2>
            <p className="mb-2">
              Payment is processed securely via Paystack. By placing an order, you authorize us to charge your 
              selected payment method for the total amount displayed at checkout.
            </p>
            <p>
              We reserve the right to refuse or cancel orders for reasons including product availability, 
              errors in pricing, or suspected fraud.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold text-zinc-900 dark:text-white">4. Shipping & Delivery</h2>
            <p className="mb-2">
              Orders are processed within 1-3 business days. Delivery times vary by location within Ghana. 
              Free shipping applies to orders over ₵500.
            </p>
            <p>
              Risk of loss passes to you upon delivery. You are responsible for providing accurate shipping information.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold text-zinc-900 dark:text-white">5. Returns & Exchanges</h2>
            <p className="mb-2">
              Returns accepted within 7 days of delivery if products are unopened and in original packaging. 
              Sale items are final and non-returnable.
            </p>
            <p>
              Refunds are issued to the original payment method within 5-10 business days after we receive and inspect the return. 
              Customer is responsible for return shipping costs unless the item was defective or we sent the wrong item.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold text-zinc-900 dark:text-white">6. Intellectual Property</h2>
            <p>
              All content on this site, including designs, logos, text, images, and the NEVER BEFORE COSMETIC brand, 
              is our property and protected by copyright. You may not reproduce or distribute without permission.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold text-zinc-900 dark:text-white">7. Limitation of Liability</h2>
            <p>
              NEVER BEFORE COSMETIC is not liable for indirect, incidental, or consequential damages arising from use of our products or website. 
              Our total liability shall not exceed the amount you paid for the product.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold text-zinc-900 dark:text-white">8. Contact</h2>
            <p>
              Questions about these Terms? Email us at <span className="font-semibold text-[#C5A059]">support@neverbeforecosmetic.com</span> or 
              call <span className="font-semibold">+233 XX XXX XXXX</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
