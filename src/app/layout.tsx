// Root layout for the Police Headquarters Duty Roster Management System
import './globals.css';

export const metadata: Metadata = {
  title: 'Police Headquarters Duty Roster Management System',
  description: 'Comprehensive duty roster management system for police headquarters with 600+ personnel and 200+ duty types',
  keywords: ['police', 'duty roster', 'management', 'scheduling', 'personnel'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="https://placehold.co/32x32?text=🏛️" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#1e40af" />
      </head>
      <body className="font-sans antialiased bg-gray-50">
        <div className="min-h-screen">
          {children}
        </div>
        
        {/* Footer */}
        <footer className="bg-gray-900 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Police Headquarters</h3>
              <p className="text-gray-400 mb-4">Duty Roster Management System</p>
              <div className="flex justify-center space-x-6 text-sm text-gray-400">
                <span>📊 Personnel Management</span>
                <span>🛡️ Duty Assignment</span>
                <span>📋 Excel Reporting</span>
                <span>🔄 Real-time Updates</span>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-800 text-xs text-gray-500">
                <p>© 2024 Police Headquarters. All rights reserved. | Professional duty roster management solution</p>
                <p className="mt-2">
                  <span className="inline-block mr-4">✅ Secure Personnel Data</span>
                  <span className="inline-block mr-4">✅ Duplicate Prevention</span>
                  <span className="inline-block">✅ Professional Reporting</span>
                </p>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}