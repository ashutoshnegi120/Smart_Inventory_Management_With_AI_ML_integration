// src/pages/LandingPage.tsx
import { Database, Brain, Gauge, Zap, Timer, BarChart, Shield, Workflow } from 'lucide-react'

const LandingPage = () => {
  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700">
     <section className="section">
        <div className="mx-auto px-4">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-6xl font-bold text-white mb-6 gradient-text">
              Next-Gen Inventory Management
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mb-8">
              Harness the power of AI and real-time analytics to transform your inventory management. 
              Built with cutting-edge technology for unparalleled performance and reliability.
            </p>
            <div className="flex gap-4">
              <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Get Started
              </button>
              <button className="px-8 py-3 bg-transparent border border-white text-white rounded-lg hover:bg-white/10 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="section bg-black/20">
        <div className="mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-white mb-12 gradient-text">
            Powered by Advanced Technology
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card">
              <Database className="w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Robust Data Storage</h3>
              <p className="text-gray-400">
                Powered by PostgreSQL and MongoDB for reliable, scalable data management with real-time capabilities.
              </p>
            </div>
            <div className="card">
              <Brain className="w-12 h-12 text-emerald-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">AI-Powered Insights</h3>
              <p className="text-gray-400">
                Advanced Python-based AI algorithms for predictive analytics and intelligent inventory optimization.
              </p>
            </div>
            <div className="card">
              <Zap className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Lightning-Fast Backend</h3>
              <p className="text-gray-400">
                Built with Rust for exceptional performance and reliability in handling complex operations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section">
        <div className="mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-8 gradient-text">Key Features</h2>
              <div className="space-y-6">
                <div className="card">
                  <Gauge className="w-6 h-6 text-blue-400 mb-2" />
                  <h4 className="text-lg font-semibold text-white">Real-time Monitoring</h4>
                  <p className="text-gray-400">Track inventory levels and movements as they happen with Redis-powered real-time updates.</p>
                </div>
                <div className="card">
                  <Timer className="w-6 h-6 text-emerald-400 mb-2" />
                  <h4 className="text-lg font-semibold text-white">Predictive Analytics</h4>
                  <p className="text-gray-400">AI-driven insights help you anticipate demand and optimize stock levels automatically.</p>
                </div>
                <div className="card">
                  <BarChart className="w-6 h-6 text-purple-400 mb-2" />
                  <h4 className="text-lg font-semibold text-white">Advanced Reporting</h4>
                  <p className="text-gray-400">Comprehensive analytics and customizable reports for data-driven decision making.</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80" 
                alt="Inventory Management Dashboard"
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section bg-black/20">
        <div className=" mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-white mb-12 gradient-text">
            Why Choose Our Solution
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card">
              <Shield className="w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Enterprise Security</h3>
              <p className="text-gray-400">
                Bank-grade security with end-to-end encryption and advanced access controls.
              </p>
            </div>
            <div className="card">
              <Workflow className="w-12 h-12 text-emerald-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Seamless Integration</h3>
              <p className="text-gray-400">
                Easily integrate with your existing systems and workflows.
              </p>
            </div>
            <div className="card">
              <Brain className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Smart Automation</h3>
              <p className="text-gray-400">
                Automate routine tasks and focus on strategic decisions.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
