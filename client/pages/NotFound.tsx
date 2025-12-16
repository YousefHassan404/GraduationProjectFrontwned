import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  return (
    <Layout>
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl font-bold text-slate-900 mb-4">404</div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            Page Not Found
          </h1>
          <p className="text-lg text-slate-600 mb-8">
            Sorry, the page you're looking for doesn't exist.
          </p>
          <Link to="/">
            <Button size="lg" className="gap-2">
              <Home size={20} />
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
