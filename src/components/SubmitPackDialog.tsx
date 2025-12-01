import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface SubmitPackDialogProps {
  children: React.ReactNode;
}

export function SubmitPackDialog({ children }: SubmitPackDialogProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    creator: "",
    code: "",
    difficulty: "",
    type: "",
    description: "",
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user.id || null);
    };
    checkAuth();
  }, []);

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && !userId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to submit a training pack",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    setOpen(newOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to submit a pack",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    // Validation
    if (!formData.name || !formData.creator || !formData.code || !formData.difficulty || !formData.type || !formData.description) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("training_packs").insert([
        {
          name: formData.name.trim(),
          creator: formData.creator.trim(),
          code: formData.code.trim(),
          difficulty: formData.difficulty,
          type: formData.type,
          description: formData.description.trim(),
          submitted_by: userId,
          status: 'pending',
        },
      ]);

      if (error) throw error;

      toast({
        title: "Submitted for review!",
        description: "Your training pack will be reviewed by admins before appearing on the site.",
      });

      // Reset form and close dialog
      setFormData({
        name: "",
        creator: "",
        code: "",
        difficulty: "",
        type: "",
        description: "",
      });
      setOpen(false);

      // Refresh the training packs list
      queryClient.invalidateQueries({ queryKey: ["training-packs"] });
    } catch (error) {
      console.error("Error submitting pack:", error);
      toast({
        title: "Error",
        description: "Failed to submit training pack. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Submit Training Pack</DialogTitle>
          <DialogDescription>
            Share your favorite training pack with the community. Fill in all the details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Pack Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Wall Shots Advanced"
                maxLength={100}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="creator">Creator</Label>
              <Input
                id="creator"
                value={formData.creator}
                onChange={(e) =>
                  setFormData({ ...formData, creator: e.target.value })
                }
                placeholder="e.g., Poquito"
                maxLength={100}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="code">Training Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="e.g., XXXX-XXXX-XXXX-XXXX"
                maxLength={50}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) =>
                  setFormData({ ...formData, difficulty: value })
                }
                required
              >
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                  <SelectItem value="Pro">Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
                required
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aerials">Aerials</SelectItem>
                  <SelectItem value="Dribbling">Dribbling</SelectItem>
                  <SelectItem value="Flicks">Flicks</SelectItem>
                  <SelectItem value="Wall Shots">Wall Shots</SelectItem>
                  <SelectItem value="Ground Shots">Ground Shots</SelectItem>
                  <SelectItem value="Redirects">Redirects</SelectItem>
                  <SelectItem value="Defense">Defense</SelectItem>
                  <SelectItem value="Mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe what this pack helps you practice..."
                rows={3}
                maxLength={500}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Pack
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}