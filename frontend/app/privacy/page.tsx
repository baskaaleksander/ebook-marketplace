import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Bookify',
  description: 'Privacy Policy for Bookify eBook Marketplace',
};

function PrivacyPolicyPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Bookify - Privacy Policy</h1>
            <p className="text-gray-500 italic mb-6">(This is a sample Privacy Policy created solely for a portfolio project and is not legally binding.)</p>
            
            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
                <p className="mb-2">Welcome to Bookify!</p>
                <p className="mb-2">Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you use Bookify, a fictional eBook marketplace created as part of a portfolio project.</p>
            </section>
            
            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
                <p className="mb-2">When you use Bookify, we may collect the following types of information:</p>
                
                <ul className="list-disc pl-6 space-y-2 mb-2">
                    <li><strong>Account Information:</strong> such as your name, email address, and password.</li>
                    <li><strong>Transaction Information:</strong> details about purchases or sales of eBooks.</li>
                    <li><strong>Usage Data:</strong> including pages visited, time spent on the site, and interaction data.</li>
                    <li><strong>Communications:</strong> any messages or communications you send to us.</li>
                </ul>
                
                <p className="text-gray-500 italic">Note: In this sample project, no actual data collection occurs.</p>
            </section>
            
            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
                <p className="mb-2">We use the information to:</p>
                
                <ul className="list-disc pl-6 space-y-2">
                    <li>Provide and improve the Bookify platform.</li>
                    <li>Facilitate transactions between buyers and sellers.</li>
                    <li>Communicate with you regarding your account or activity.</li>
                    <li>Monitor platform usage to detect fraud or misuse.</li>
                </ul>
            </section>
            
            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">4. Sharing Your Information</h2>
                <p className="mb-2">We do not sell or rent your personal information to third parties.</p>
                <p className="mb-2">We may share information only:</p>
                
                <ul className="list-disc pl-6 space-y-2">
                    <li>To comply with legal obligations.</li>
                    <li>To protect the rights and safety of Bookify and its users.</li>
                </ul>
            </section>
            
            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">5. Cookies and Tracking Technologies</h2>
                <p className="mb-2">Bookify may use cookies to enhance your experience by remembering your preferences and analyzing site traffic.</p>
            </section>
            
            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">6. Data Security</h2>
                <p className="mb-2">We implement basic technical measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.</p>
            </section>
            
            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">7. Your Rights</h2>
                <p className="mb-2">Depending on your jurisdiction, you may have rights to access, update, or delete your personal information. Please contact us if you wish to exercise any of these rights.</p>
            </section>
            
            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">8. Changes to This Privacy Policy</h2>
                <p className="mb-2">We may update this Privacy Policy from time to time. Any changes will be posted on this page.</p>
            </section>
            
            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">9. Contact Us</h2>
                <p className="mb-2">If you have any questions about this Privacy Policy, please contact the Bookify team at <a href="mailto:contact@bookify-sample.com" className="text-blue-600 hover:underline">contact@bookify-sample.com</a>.</p>
            </section>
            
            <div className="border-t border-gray-200 pt-4 mt-8 text-gray-500 text-sm">
                <p>Last Updated: April 28, 2025</p>
            </div>
        </div>
    );
}

export default PrivacyPolicyPage;