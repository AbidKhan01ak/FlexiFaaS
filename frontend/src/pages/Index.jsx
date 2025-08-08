import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
      <div className="text-center space-y-7">
        {/* Logo or App Icon */}
        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-primary flex items-center justify-center text-white font-bold text-3xl mb-6 shadow-elegant">
          F
        </div>
        <h1 className="text-5xl font-bold text-foreground mb-2">FlexiFaaS</h1>
        <p className="text-2xl text-primary font-semibold mb-2">
          Run Functions Instantly, Scale Infinitely.
        </p>
        <p className="text-muted-foreground max-w-lg mx-auto text-base mb-2">
          Welcome to FlexiFaaS — the simplest way to deploy, run, and manage
          your serverless functions. Eliminate infrastructure worries and ship
          new features faster.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button
            onClick={() => navigate("/login")}
            size="lg"
            className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-elegant"
          >
            Get Started
          </Button>
          <Button
            onClick={() => navigate("/register")}
            variant="outline"
            size="lg"
            className="border-primary/20 hover:bg-primary/5"
          >
            Create Account
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
