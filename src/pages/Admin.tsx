import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Check, X, ArrowLeft } from "lucide-react";

const Admin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      // Check if user is admin
      const { data: adminCheck } = await supabase.rpc("is_admin", { user_id: session.user.id });
      
      if (!adminCheck) {
        toast.error("Access denied. Admin privileges required.");
        navigate("/");
        return;
      }

      setIsAdmin(true);
      setLoading(false);
    };

    checkAdmin();
  }, [navigate]);

  const { data: pendingPacks = [], isLoading: packsLoading } = useQuery({
    queryKey: ["pending-packs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("training_packs")
        .select(`
          *,
          submitted_by_profile:profiles!training_packs_submitted_by_fkey(display_name, email)
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const approveMutation = useMutation({
    mutationFn: async (packId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { error } = await supabase
        .from("training_packs")
        .update({
          status: "approved",
          reviewed_by: session?.user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", packId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-packs"] });
      toast.success("Pack approved!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to approve pack");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ packId, reason }: { packId: string; reason: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { error } = await supabase
        .from("training_packs")
        .update({
          status: "rejected",
          reviewed_by: session?.user.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: reason,
        })
        .eq("id", packId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-packs"] });
      toast.success("Pack rejected");
      setRejectionReason({});
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to reject pack");
    },
  });

  if (loading || packsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Admin Panel</h1>
            <p className="text-muted-foreground">Review and moderate training pack submissions</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>

        {pendingPacks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-xl text-muted-foreground">No pending submissions</p>
              <p className="text-sm text-muted-foreground mt-2">All caught up!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {pendingPacks.map((pack) => (
              <Card key={pack.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle>{pack.name}</CardTitle>
                      <CardDescription>
                        Submitted by {pack.submitted_by_profile?.display_name || "Unknown"} ({pack.submitted_by_profile?.email})
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">Pending Review</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Creator</p>
                      <p className="text-sm">{pack.creator}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Code</p>
                      <p className="text-sm font-mono">{pack.code}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Difficulty</p>
                      <Badge variant="outline">{pack.difficulty}</Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Type</p>
                      <Badge variant="outline">{pack.type}</Badge>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                    <p className="text-sm">{pack.description}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Rejection Reason (optional)</p>
                    <Textarea
                      placeholder="Provide a reason if rejecting..."
                      value={rejectionReason[pack.id] || ""}
                      onChange={(e) => setRejectionReason({ ...rejectionReason, [pack.id]: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={() => approveMutation.mutate(pack.id)}
                      disabled={approveMutation.isPending}
                      className="flex-1"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => rejectMutation.mutate({ 
                        packId: pack.id, 
                        reason: rejectionReason[pack.id] || "No reason provided" 
                      })}
                      disabled={rejectMutation.isPending}
                      className="flex-1"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;