export default function TermsPage() {
  return (
    <div className="min-h-screen px-4 py-10 pb-24" style={{ background: '#0D1117' }}>
      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white mb-2">Terms & Conditions</h1>
          <p className="text-sm" style={{ color: '#5A7090' }}>Last updated: March 2026 · TopWager Casino</p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed" style={{ color: '#9CA3AF' }}>

          <section>
            <h2 className="mb-3 text-base font-bold text-white">1. Introduction</h2>
            <p>These Terms and Conditions ("Terms") govern your use of TopWager Casino ("we", "us", "the Platform"), operated under licence issued by the Tobique First Nation. By registering an account or using the Platform in any way, you confirm that you have read, understood, and agree to be bound by these Terms.</p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold text-white">2. Eligibility</h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>You must be at least 18 years of age (or the legal gambling age in your jurisdiction, whichever is higher) to use this Platform.</li>
              <li>You must be located in a jurisdiction where online gambling is lawful.</li>
              <li>You may only hold one account. Duplicate accounts will be closed and balances forfeited.</li>
              <li>You must not be registered on any self-exclusion programme or gambling block service.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold text-white">3. Account Registration</h2>
            <p className="mb-2">When registering, you agree to provide accurate, current, and complete information. You are responsible for maintaining the confidentiality of your account credentials. TopWager reserves the right to request identity verification documents at any time and to suspend accounts pending verification.</p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold text-white">4. Deposits & Withdrawals</h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>All deposits must be made from payment methods registered in your name.</li>
              <li>Minimum and maximum deposit/withdrawal limits apply as displayed at the time of transaction.</li>
              <li>Withdrawals are subject to identity verification and may be delayed pending KYC review.</li>
              <li>We reserve the right to withhold withdrawals where fraudulent activity is suspected.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold text-white">5. Bonuses & Promotions</h2>
            <p className="mb-2">All bonuses are subject to wagering requirements as stated at the time of offer. TopWager reserves the right to amend, suspend, or withdraw any promotion at any time. Abuse of bonus offers, including but not limited to arbitrage, will result in account suspension and forfeiture of winnings.</p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold text-white">6. Responsible Gambling</h2>
            <p className="mb-2">We are committed to responsible gambling. Players may set deposit limits, cooling-off periods, or request self-exclusion at any time through their Account settings. Self-exclusion requests are processed within 24 hours and cannot be reversed during the exclusion period.</p>
            <p>For support, contact <a href="https://www.begambleaware.org" target="_blank" rel="noreferrer" className="underline" style={{ color: '#F5A623' }}>BeGambleAware.org</a> or <a href="https://www.gamcare.org.uk" target="_blank" rel="noreferrer" className="underline" style={{ color: '#F5A623' }}>GamCare.org.uk</a>.</p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold text-white">7. Prohibited Activities</h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>Fraudulent activity, including the use of stolen payment methods.</li>
              <li>Collusion, cheating, or use of automated software (bots).</li>
              <li>Money laundering or any activity that violates applicable law.</li>
              <li>Creating accounts on behalf of third parties.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold text-white">8. Intellectual Property</h2>
            <p>All content on the Platform, including games, graphics, and trademarks, is owned by or licensed to TopWager. You may not reproduce, distribute, or create derivative works without prior written consent.</p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold text-white">9. Limitation of Liability</h2>
            <p>TopWager shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Platform. Our total liability to you shall not exceed the amount deposited in your account in the 30 days prior to the event giving rise to the claim.</p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold text-white">10. Governing Law</h2>
            <p>These Terms are governed by the laws of the Tobique First Nation jurisdiction. Any disputes shall be subject to the exclusive jurisdiction of the applicable regulatory authority.</p>
          </section>

          {/* Privacy Policy anchor */}
          <div id="privacy" className="pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <h1 className="text-2xl font-black text-white mb-2">Privacy Policy</h1>
            <p className="text-sm mb-6" style={{ color: '#5A7090' }}>Last updated: March 2026</p>
          </div>

          <section>
            <h2 className="mb-3 text-base font-bold text-white">1. Data We Collect</h2>
            <ul className="space-y-2 list-disc pl-5">
              <li><strong className="text-white">Registration data:</strong> name, email address, phone number, date of birth, currency preference.</li>
              <li><strong className="text-white">Identity documents:</strong> passport, driving licence, utility bills (for KYC purposes).</li>
              <li><strong className="text-white">Transaction data:</strong> deposits, withdrawals, betting history.</li>
              <li><strong className="text-white">Technical data:</strong> IP address, device type, browser, session data.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold text-white">2. How We Use Your Data</h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>To operate your account and process transactions.</li>
              <li>To verify your identity and comply with anti-money laundering requirements.</li>
              <li>To comply with responsible gambling obligations.</li>
              <li>To send service communications and (where opted-in) promotional offers.</li>
              <li>To detect and prevent fraud.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold text-white">3. Data Sharing</h2>
            <p>We do not sell your personal data. We may share data with payment processors, KYC providers, regulatory authorities, and fraud prevention services as necessary to operate the Platform lawfully.</p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold text-white">4. Data Retention</h2>
            <p>We retain your data for a minimum of 5 years following account closure, as required by applicable anti-money laundering legislation.</p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold text-white">5. Your Rights</h2>
            <p>You have the right to access, correct, or request deletion of your personal data, subject to legal retention requirements. To exercise these rights, contact our support team.</p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold text-white">6. Contact</h2>
            <p>For any queries regarding these Terms or our Privacy Policy, please contact our support team via the Platform's live chat or email.</p>
          </section>

        </div>
      </div>
    </div>
  );
}
