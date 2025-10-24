import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FeedbackCard } from "@/components/FeedbackCard";
import { NewFeedbackDialog } from "@/components/NewFeedbackDialog";
import { GraduationCap, LogOut } from "lucide-react";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";

interface Feedback {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  profiles: {
    full_name: string;
    class: string;
  };
  comments: Array<{
    id: string;
    content: string;
    created_at: string;
    profiles: {
      full_name: string;
      class: string;
    };
  }>;
}

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      await loadFeedbacks();
      setIsLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (!session) {
          navigate("/auth");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadFeedbacks = async () => {
    const { data, error } = await supabase
      .from("feedback")
      .select(`
        *,
        profiles (full_name, class),
        comments (
          id,
          content,
          created_at,
          profiles (full_name, class)
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar feedbacks");
      return;
    }

    setFeedbacks(data || []);
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erro ao sair");
    } else {
      toast.success("Até logo!");
      navigate("/auth");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-primary/5">
        <div className="animate-pulse text-primary text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/5">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-soft">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  GCTalk
                </h1>
                <p className="text-sm text-muted-foreground">Góes Calmon Talk</p>
              </div>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="gap-2 border-primary/20 hover:bg-primary/5"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Feed de Feedbacks</h2>
            <p className="text-muted-foreground mt-1">
              Veja o que seus colegas estão dizendo
            </p>
          </div>
          <NewFeedbackDialog onFeedbackAdded={loadFeedbacks} />
        </div>

        <div className="grid gap-6 max-w-4xl mx-auto">
          {feedbacks.length === 0 ? (
            <Card className="p-12 text-center border-dashed border-2 border-primary/20">
              <GraduationCap className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Nenhum feedback ainda</h3>
              <p className="text-muted-foreground mb-4">
                Seja o primeiro a compartilhar sua opinião sobre o ano letivo!
              </p>
              <NewFeedbackDialog onFeedbackAdded={loadFeedbacks} />
            </Card>
          ) : (
            feedbacks.map((feedback) => (
              <FeedbackCard
                key={feedback.id}
                id={feedback.id}
                title={feedback.title}
                content={feedback.content}
                category={feedback.category}
                author={feedback.profiles}
                created_at={feedback.created_at}
                comments={feedback.comments}
                onCommentAdded={loadFeedbacks}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
