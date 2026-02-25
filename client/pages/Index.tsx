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
  Users,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function Index() {
  const { isAuthenticated } = useAuth();

  /* ---------------- Hero Slider ---------------- */
  const images = [
    "https://images.unsplash.com/photo-1581093588401-22fcb0f0a4a9?q=80&w=2070",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070",
    "https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=2070",
  ];

  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Layout>
      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden min-h-[85vh] flex items-center">

        {/* Animated Background */}
        {images.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentImage ? "opacity-100" : "opacity-0"
            }`}
            style={{
              backgroundImage: `url(${img})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        ))}

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#020617]/90 via-[#0f172a]/85 to-[#020617]/90 backdrop-blur-sm" />

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-white leading-tight mb-6">
            AI-Powered
            <span className="block bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
              Brain Tumor Intelligence
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10">
            Advanced deep learning system for MRI analysis, tumor detection,
            segmentation, and automated medical reports.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <>
                <Link to="/chat">
                  <Button size="lg" className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 shadow-lg shadow-blue-600/30">
                    <MessageSquare size={20} />
                    Start Analysis
                    <ArrowRight size={20} />
                  </Button>
                </Link>
                <Link to="/records">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-slate-600 bg-slate-900/40 hover:bg-slate-800"
                  >
                    Upload Records
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/register">
                  <Button size="lg" className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-600/30">
                    Get Started
                    <ArrowRight size={20} />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-slate-600 bg-slate-900/40 hover:bg-slate-800"
                  >
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ================= FEATURES CARDS ================= */}
      <section className="py-24 bg-[#0b1120]">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-white mb-16">
            Core Features
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "AI Detection",
                desc: "Advanced neural networks trained on thousands of MRI cases.",
              },
              {
                icon: Shield,
                title: "Medical Security",
                desc: "Encrypted, secure and compliant medical data handling.",
              },
              {
                icon: FileText,
                title: "Smart Reports",
                desc: "Instant PDF generation with clinical insights.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white/5 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-6 shadow-md shadow-blue-600/30">
                  <item.icon size={26} className="text-white" />
                </div>

                <h3 className="text-xl font-semibold text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="py-24 bg-gradient-to-b from-[#0f172a] to-[#020617]">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-white mb-20">
            How It Works
          </h2>

          <div className="grid md:grid-cols-4 gap-10">
            {["Register", "Upload MRI", "AI Analysis", "Download Report"].map(
              (step, i) => (
                <div key={i} className="text-center">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold mb-6 shadow-lg shadow-blue-600/30">
                    {i + 1}
                  </div>
                  <h3 className="text-white font-semibold mb-2">{step}</h3>
                  <p className="text-slate-400 text-sm">
                    Simple and streamlined medical AI workflow.
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      {!isAuthenticated && (
        <section className="py-24 bg-gradient-to-r from-blue-600 to-indigo-700">
          <div className="max-w-4xl mx-auto text-center px-6">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Brain Diagnosis?
            </h2>
            <p className="text-blue-100 mb-8 text-lg">
              Join medical professionals using AI-powered tumor analysis.
            </p>
            <Link to="/register">
              <Button size="lg" variant="secondary">
                Create Account
              </Button>
            </Link>
          </div>
        </section>
      )}
    </Layout>
  );
}