import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  profiles: {
    full_name: string;
    class: string;
  };
}

interface FeedbackCardProps {
  id: string;
  title: string;
  content: string;
  category: string;
  author: {
    full_name: string;
    class: string;
  };
  created_at: string;
  comments: Comment[];
  onCommentAdded: () => void;
}

const categoryColors = {
  professores: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  materias: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
  atividades: "bg-green-500/10 text-green-700 dark:text-green-300",
  geral: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
};

const categoryLabels = {
  professores: "Professores",
  materias: "Matérias",
  atividades: "Atividades",
  geral: "Geral",
};

export const FeedbackCard = ({
  id,
  title,
  content,
  category,
  author,
  created_at,
  comments,
  onCommentAdded,
}: FeedbackCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("Você precisa estar logado para comentar");
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase
      .from("comments")
      .insert({
        feedback_id: id,
        user_id: user.id,
        content: newComment,
      });

    if (error) {
      toast.error("Erro ao enviar comentário");
    } else {
      toast.success("Comentário enviado!");
      setNewComment("");
      onCommentAdded();
    }

    setIsSubmitting(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="overflow-hidden border-primary/10 hover:shadow-soft transition-all duration-300">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <Avatar className="h-10 w-10 bg-gradient-to-br from-primary to-accent">
              <AvatarFallback className="bg-transparent text-white font-semibold">
                {getInitials(author.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">{author.full_name}</p>
              <p className="text-sm text-muted-foreground">{author.class}</p>
            </div>
          </div>
          <Badge className={categoryColors[category as keyof typeof categoryColors]}>
            {categoryLabels[category as keyof typeof categoryLabels]}
          </Badge>
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-base text-foreground/80">{content}</CardDescription>
      </CardHeader>
      <CardFooter className="flex-col items-stretch gap-4 bg-muted/30 pt-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{formatDistanceToNow(new Date(created_at), { addSuffix: true, locale: ptBR })}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            {comments.length} {comments.length === 1 ? "comentário" : "comentários"}
          </Button>
        </div>

        {showComments && (
          <div className="space-y-4 pt-4 border-t">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="h-8 w-8 bg-gradient-to-br from-secondary to-accent flex-shrink-0">
                  <AvatarFallback className="bg-transparent text-white text-xs font-semibold">
                    {getInitials(comment.profiles.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 bg-card rounded-lg p-3 shadow-sm">
                  <div className="flex items-baseline gap-2 mb-1">
                    <p className="font-semibold text-sm">{comment.profiles.full_name}</p>
                    <span className="text-xs text-muted-foreground">
                      {comment.profiles.class}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/90">{comment.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(comment.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>
            ))}

            <div className="flex gap-2">
              <Textarea
                placeholder="Escreva um comentário..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="resize-none"
                rows={2}
              />
              <Button
                onClick={handleSubmitComment}
                disabled={isSubmitting || !newComment.trim()}
                size="icon"
                className="bg-gradient-to-br from-primary to-accent hover:opacity-90 transition-opacity"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};
