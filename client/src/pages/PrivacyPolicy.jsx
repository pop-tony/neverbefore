import React from 'react'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white px-4 py-24 text-zinc-900 dark:bg-black dark:text-white">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-2 text-5xl font-black">Privacy Policy</h1>
        <p className="mb-12 text-sm text-zinc-500 dark:text-zinc-400">Last updated: June 4, 2026</p>

        <div className="space-y-8 text-zinc-700 dark:text-zinc-300">
          <section>
            <h2 className="mb-3 text-2xl font-bold text-zinc-900 dark:text-white">1. Information We Collect</h2>
            <p className="mb-2">When you shop with NEVER BEFORE COSMETIC, we collect:</p>
            <ul className="ml-6 list-disc space-y-1">
              <li><span className="font-semibold">Personal Info:</span> Name, email, phone, shipping address</li>
              <li><span className="font-semibold">Payment Info:</span> Processed securely by Paystack. We do not store card details</li>
              <li><span className="font-semibold">Order History:</span> Products purchased, dates, amounts, shades</li>
              <li><span className="font-semibold">Usage Data:</span> Pages visited, items viewed, cart activity</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold text-zinc-900 dark:text-white">2. How We Use Your Information</h2>
            <ul className="ml-6 list-disc space-y-1">
              <li>Process and fulfill your orders</li>
              <li>Send order confirmations and shipping updates</li>
              <li>Respond to customer service requests & beauty questions</li>
              <li>Improve our website, formulas, and product curation</li>
              <li>Send new arrival & restock emails only if you opt in — unsubscribe anytime</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold text-zinc-900 dark:text-white">3. Data Sharing</h2>
            <p className="mb-2">
              We never sell your personal data. We share information only with:
            </p>
            <ul className="ml-6 list-disc space-y-1">
              <li><span className="font-semibold">Paystack:</span> To process payments securely</li>
              <li><span className="font-semibold">Shipping Partners:</span> To deliver your rituals</li>
              <li><span className="font-semibold">Legal Requirements:</span> If required by Ghanaian law</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold text-zinc-900 dark:text-white">4. Cookies & Tracking</h2>
            <p>
              We use cookies to keep you logged in, remember your bag, and analyze site traffic. 
              You can disable cookies in your browser, but some features may not work properly.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold text-zinc-900 dark:text-white">5. Data Security</h2>
            <p>
              We use industry-standard encryption and secure servers to protect your data. However, 
              no method of transmission over the internet is 100% secure. Use strong passwords and 
              keep your account details confidential.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold text-zinc-900 dark:text-white">6. Your Rights</h2>
            <p className="mb-2">You have the right to:</p>
            <ul className="ml-6 list-disc space-y-1">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and data</li>
              <li>Opt out of marketing communications</li>
            </ul>
            <p className="mt-2">
              To exercise these rights, email <span className="font-semibold text-[#C5A059]">privacy@neverbeforecosmetic.com</span>.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold text-zinc-900 dark:text-white">7. Children's Privacy</h2>
            <p>
              Our services are not directed to individuals under 18. We do not knowingly collect 
              data from children. If you believe we have, contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold text-zinc-900 dark:text-white">8. Changes to This Policy</h2>
            <p>
              We may update this policy periodically. Changes will be posted on this page with 
              an updated "Last updated" date. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold text-zinc-900 dark:text-white">9. Contact Us</h2>
            <p>
              For privacy questions or requests, contact: <br />
              <span className="font-semibold">Email:</span> <span className="text-[#C5A059]">privacy@neverbeforecosmetic.com</span> <br />
              <span className="font-semibold">Address:</span> Accra, Ghana
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
