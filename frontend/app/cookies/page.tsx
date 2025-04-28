import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy | Bookify',
  description: 'Cookie Policy for Bookify eBook Marketplace',
};

function CookiePolicyPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Bookify - Cookie Policy</h1>
            <p className="text-gray-500 italic mb-6">(This is a sample Cookie Policy created solely for a portfolio project and is not legally binding.)</p>
            
            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
                <p className="mb-2">This Cookie Policy explains how Bookify uses cookies and similar technologies to recognize you when you visit our fictional eBook marketplace.</p>
                <p className="text-gray-500 italic">Note: This policy is part of a portfolio project and no actual cookies are deployed or collected.</p>
            </section>
            
            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">2. What Are Cookies?</h2>
                <p className="mb-2">Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work efficiently, improve user experience, and provide information to site owners.</p>
            </section>
            
            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">3. How We Use Cookies</h2>
                <p className="mb-2">Bookify may use cookies to:</p>
                
                <ul className="list-disc pl-6 space-y-2">
                    <li>Remember your login details.</li>
                    <li>Save your preferences (such as language settings).</li>
                    <li>Understand how you use the site to improve user experience.</li>
                    <li>Analyze site traffic and user behavior for performance improvements.</li>
                </ul>
            </section>
            
            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">4. Types of Cookies We May Use</h2>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Essential Cookies:</strong> Necessary for the website to function properly.</li>
                    <li><strong>Performance Cookies:</strong> Help us understand how visitors interact with the website by collecting anonymous information.</li>
                    <li><strong>Functionality Cookies:</strong> Allow the website to remember choices you make (e.g., language, region).</li>
                    <li><strong>Analytics Cookies:</strong> Used to collect information about site traffic and usage patterns (e.g., via Google Analytics).</li>
                </ul>
            </section>
            
            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">5. Managing Cookies</h2>
                <p className="mb-2">You can control and manage cookies through your browser settings.</p>
                <p className="mb-2">Options typically include:</p>
                
                <ul className="list-disc pl-6 space-y-2 mb-2">
                    <li>Blocking all cookies.</li>
                    <li>Allowing only certain types of cookies.</li>
                    <li>Deleting cookies after your browsing session.</li>
                </ul>
                
                <p className="mb-2">Please note that disabling cookies may impact the functionality of Bookify.</p>
            </section>
            
            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">6. Changes to This Cookie Policy</h2>
                <p className="mb-2">We may update this Cookie Policy from time to time. Updates will be posted on this page.</p>
            </section>
            
            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">7. Contact Us</h2>
                <p className="mb-2">If you have any questions about our use of cookies, please contact the Bookify team at <a href="mailto:contact@bookify-sample.com" className="text-blue-600 hover:underline">contact@bookify-sample.com</a>.</p>
            </section>
            
            <div className="border-t border-gray-200 pt-4 mt-8 text-gray-500 text-sm">
                <p>Last Updated: April 28, 2025</p>
            </div>
        </div>
    );
}

export default CookiePolicyPage;