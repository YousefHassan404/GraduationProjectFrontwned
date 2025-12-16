import { useAuth } from "@/lib/auth-context";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import {
  Brain,
  MessageSquare,
  Upload,
  FileText,
  Shield,
  Zap,
  Users,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

export default function Index() {
  const { isAuthenticated } = useAuth();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100/50 rounded-full border border-blue-200 mb-6">
              <Zap size={16} className="text-blue-600" />
              <span className="text-sm font-medium text-blue-600">
                Powered by Advanced AI
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-slate-900 mb-6">
              Brain Tumor Analysis
              <span className="block bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                Made Intelligent
              </span>
            </h1>

            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
              Advanced AI-powered system for analyzing brain tumors. Get instant insights, detailed reports,
              and professional consultations in minutes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <>
                  <Link to="/chat">
                    <Button size="lg" className="gap-2 w-full sm:w-auto">
                      <MessageSquare size={20} />
                      Start Analysis
                      <ArrowRight size={20} />
                    </Button>
                  </Link>
                  <Link to="/records">
                    <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
                      <Upload size={20} />
                      Upload Records
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="lg" className="gap-2 w-full sm:w-auto">
                      Get Started
                      <ArrowRight size={20} />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Feature Cards - First Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="group bg-white/80 backdrop-blur rounded-xl p-8 border border-slate-200 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 transition">
                <Brain size={24} className="text-blue-600 group-hover:text-white transition" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                AI Analysis
              </h3>
              <p className="text-slate-600">
                Leverage cutting-edge AI models for accurate brain tumor detection and analysis
              </p>
            </div>

            <div className="group bg-white/80 backdrop-blur rounded-xl p-8 border border-slate-200 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 transition">
                <MessageSquare size={24} className="text-blue-600 group-hover:text-white transition" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Expert Chat
              </h3>
              <p className="text-slate-600">
                Consult with specialized AI models trained in neurology and oncology
              </p>
            </div>

            <div className="group bg-white/80 backdrop-blur rounded-xl p-8 border border-slate-200 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 transition">
                <Upload size={24} className="text-blue-600 group-hover:text-white transition" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Secure Storage
              </h3>
              <p className="text-slate-600">
                HIPAA-compliant storage for your medical records and patient data
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-slate-900 mb-16">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: 1,
                title: "Register Account",
                description: "Create a secure account with your credentials",
              },
              {
                step: 2,
                title: "Upload Records",
                description: "Upload medical images and reports for analysis",
              },
              {
                step: 3,
                title: "AI Analysis",
                description: "Our AI analyzes your data and provides insights",
              },
              {
                step: 4,
                title: "Get Report",
                description: "Download comprehensive PDF reports",
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2 text-center">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 text-center text-sm">
                    {item.description}
                  </p>
                </div>
                {item.step < 4 && (
                  <div className="hidden md:block absolute top-8 -right-4 w-8 text-blue-300">
                    <ArrowRight size={32} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-slate-900 mb-16">
            Powerful Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[
              {
                icon: Brain,
                title: "Deep Learning Analysis",
                description:
                  "Utilizes advanced neural networks trained on thousands of brain tumor cases",
                features: ["Multi-stage detection", "Pattern recognition", "Risk assessment"],
              },
              {
                icon: Shield,
                title: "HIPAA Compliant",
                description:
                  "Enterprise-grade security and full HIPAA compliance for medical data",
                features: ["End-to-end encryption", "Audit logging", "Access control"],
              },
              {
                icon: FileText,
                title: "Automated Reports",
                description:
                  "Generate professional medical reports in PDF format automatically",
                features: ["Clinical findings", "Recommendations", "Follow-up suggestions"],
              },
              {
                icon: Users,
                title: "Multi-Role Support",
                description:
                  "Support for doctors, patients, and administrators with role-based access",
                features: ["Patient portal", "Doctor dashboard", "Admin controls"],
              },
            ].map((feature, index) => (
              <div key={index} className="bg-white/80 backdrop-blur rounded-xl p-8 border border-slate-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 mb-4">
                      {feature.description}
                    </p>
                    <ul className="space-y-2">
                      {feature.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                          <CheckCircle size={16} className="text-green-600" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of medical professionals using NeuroAnalyze for accurate brain tumor analysis.
            </p>
            <Link to="/register">
              <Button size="lg" variant="secondary" className="gap-2">
                Create Your Account Today
                <ArrowRight size={20} />
              </Button>
            </Link>
          </div>
        </section>
      )}
    </Layout>
  );
}
