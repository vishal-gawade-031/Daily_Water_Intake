import React from 'react';

const Footer = () => {
  // Dynamically fetches the current year for the copyright notice
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#FAF9F6] text-gray-700 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center md:text-left">
          
          {/* Section 1: Brand & Copyright */}
          <div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">Daily Water Intake Project</h3>
            <p className="text-sm text-gray-500">
              &copy; {currentYear} WaterFlow Inc. All rights reserved.
            </p>
          </div>

          {/* Section 2: Legal & Compliance */}
          <div>
     
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#privacy" className="hover:text-blue-600 transition-colors duration-200">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" className="hover:text-blue-600 transition-colors duration-200">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Section 3: Support Notice & Contact */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wider">
              Support Contact
            </h4>
            <p className="text-sm text-gray-600 mb-2">
              Need help tracking your hydration or running into system errors?
            </p>
            <a 
              href="mailto:vishalgawade2004@gmail.com" 
              className="text-sm font-medium text-blue-600 hover:underline break-all"
            >
              vishalgawade2004@gmail.com
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;