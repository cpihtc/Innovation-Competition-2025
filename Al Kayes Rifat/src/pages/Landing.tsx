import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Users, Calendar, BarChart } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/20">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Amol Nama</h1>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => navigate("/auth?mode=login")}>
              Login
            </Button>
            <Button onClick={() => navigate("/auth?mode=signup")}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-5xl font-bold text-foreground leading-tight">
            Simple Attendance Management
          </h2>
          <p className="text-xl text-muted-foreground">
            Track student attendance effortlessly. Create classes, manage students, and monitor attendance patterns all in one place.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" onClick={() => navigate("/auth?mode=signup")}>
              Start Free Today
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth?mode=login")}>
              Login
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={<Users className="w-8 h-8 text-primary" />}
            title="Manage Subjects"
            description="Create and organize subjects by semester with ease"
          />
          <FeatureCard
            icon={<CheckCircle className="w-8 h-8 text-primary" />}
            title="Track Attendance"
            description="Mark attendance quickly with a simple interface"
          />
          <FeatureCard
            icon={<Calendar className="w-8 h-8 text-primary" />}
            title="Daily Records"
            description="Keep accurate daily attendance records"
          />
          <FeatureCard
            icon={<BarChart className="w-8 h-8 text-primary" />}
            title="View Reports"
            description="Monitor attendance patterns and trends"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="bg-card rounded-2xl p-12 shadow-lg border">
          <h3 className="text-3xl font-bold mb-4">Ready to get started?</h3>
          <p className="text-muted-foreground mb-6">
            Join educators who trust Amol Nama for attendance management
          </p>
          <Button size="lg" onClick={() => navigate("/auth?mode=signup")}>
            Create Free Account
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 backdrop-blur-sm py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 Amol Nama. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => {
  return (
    <div className="bg-card p-6 rounded-xl shadow-sm border hover:shadow-md transition-all">
      <div className="mb-4">{icon}</div>
      <h4 className="text-lg font-semibold mb-2">{title}</h4>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
};

export default Landing;
