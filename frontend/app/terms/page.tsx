import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Bookify',
  description: 'Terms of Service for Bookify eBook Marketplace',
};

function TosPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Bookify - Terms of Service</h1>
            <p className="text-gray-500 italic mb-6">(This document is a fictional sample created for a portfolio project.)</p>
            
            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
                <p className="mb-2">Welcome to Bookify!</p>
                <p className="mb-2">Bookify is a fictional online marketplace where users can buy, sell, and discover eBooks across various genres.</p>
                <p className="mb-2">By accessing or using Bookify, you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, please do not use our services.</p>
                <p className="text-gray-500 italic">Note: This Terms of Service is a sample created for a portfolio project and does not represent an active or real legal agreement.</p>
            </section>
            
            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">2. Eligibility</h2>
                <p className="mb-2">You must be at least 18 years old, or the age of majority in your jurisdiction, to use Bookify. By using Bookify, you represent and warrant that you meet these requirements.</p>
            </section>
            
            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
                <ul className="list-disc pl-6 space-y-2">
                    <li>To access certain features, you must create an account.</li>
                    <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                    <li>You agree to provide accurate, current, and complete information.</li>
                </ul>
            </section>
            
            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">4. Buying and Selling eBooks</h2>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Sellers are responsible for ensuring that they have the rights to sell the eBooks they upload.</li>
                    <li>Buyers understand that purchases are final unless otherwise stated.</li>
                    <li>Bookify acts as a platform only and is not a party to the transactions between buyers and sellers.</li>
                </ul>
            </section>
            
            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">5. Content Ownership</h2>
                <p className="mb-2">Sellers retain ownership of the eBooks they upload but grant Bookify a license to display and distribute the content for the purposes of the marketplace.</p>
                <p className="mb-2">Users may not copy, distribute, or resell any content purchased on Bookify outside of the platform without authorization.</p>
            </section>
            
            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">6. Prohibited Activities</h2>
                <p className="mb-2">You agree not to:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Upload unlawful, infringing, or otherwise inappropriate content.</li>
                    <li>Engage in fraud, abuse, or any activity that could harm Bookify or its users.</li>
                    <li>Attempt to gain unauthorized access to other accounts or Bookify&apos;s systems.</li>
                </ul>
            </section>
            
            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">7. Termination</h2>
                <p className="mb-2">We reserve the right to suspend or terminate your access to Bookify at our sole discretion, without notice, for conduct that violates these Terms or is otherwise harmful to other users or the platform.</p>
            </section>
            
            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">8. Disclaimers</h2>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Bookify is provided &quot;as is&quot; without warranties of any kind, either express or implied.</li>
                    <li>We do not guarantee the accuracy, completeness, or usefulness of any content on the platform.</li>
                </ul>
            </section>
            
            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">9. Limitation of Liability</h2>
                <p className="mb-2">To the fullest extent permitted by law, Bookify and its creators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform.</p>
            </section>
            
            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">10. Changes to These Terms</h2>
                <p className="mb-2">We may modify these Terms at any time. Changes will be effective immediately upon posting. Your continued use of Bookify after changes are posted constitutes your acceptance of the updated Terms.</p>
            </section>
            
            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">11. Contact Information</h2>
                <p className="mb-2">For any questions about these Terms, please contact the Bookify team at <a href="mailto:contact@bookify-sample.com" className="text-blue-600 hover:underline">contact@bookify-sample.com</a>.</p>
            </section>
            
            <div className="border-t border-gray-200 pt-4 mt-8 text-gray-500 text-sm">
                <p>Last Updated: April 28, 2025</p>
            </div>
        </div>
    );
}

export default TosPage;