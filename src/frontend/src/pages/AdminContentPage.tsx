import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BlogCategory } from "../backend";
import {
  useBlogPosts,
  useCreateBlogPost,
  useDeleteBlogPost,
  useUpdateBlogPost,
} from "../hooks/useBlogPosts";
import type { BlogPost, CreateBlogPostInput } from "../types";

const CATEGORIES: { value: BlogCategory; label: string }[] = [
  { value: BlogCategory.news, label: "News" },
  { value: BlogCategory.marketTrends, label: "Market Trends" },
  { value: BlogCategory.buyingGuide, label: "Buying Guide" },
  { value: BlogCategory.rentalGuide, label: "Rental Guide" },
];

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

interface PostFormState {
  title: string;
  slug: string;
  category: BlogCategory;
  content: string;
  excerpt: string;
  metaDescription: string;
  featuredImageUrl: string;
  tags: string;
  isPublished: boolean;
}

const DEFAULT_FORM: PostFormState = {
  title: "",
  slug: "",
  category: BlogCategory.news,
  content: "",
  excerpt: "",
  metaDescription: "",
  featuredImageUrl: "",
  tags: "",
  isPublished: false,
};

function PostFormDialog({
  post,
  onClose,
}: {
  post: BlogPost | null;
  onClose: () => void;
}) {
  const isEdit = !!post;
  const [form, setForm] = useState<PostFormState>(() =>
    post
      ? {
          title: post.title,
          slug: post.slug,
          category: post.category,
          content: post.content,
          excerpt: post.excerpt,
          metaDescription: post.metaDescription,
          featuredImageUrl: post.featuredImageUrl,
          tags: post.tags.join(", "),
          isPublished: post.isPublished,
        }
      : DEFAULT_FORM,
  );

  const { mutate: create, isPending: creating } = useCreateBlogPost();
  const { mutate: update, isPending: updating } = useUpdateBlogPost();
  const isPending = creating || updating;

  const set = (field: keyof PostFormState, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));

  useEffect(() => {
    if (!isEdit && form.title) {
      setForm((f) => ({ ...f, slug: slugify(f.title) }));
    }
  }, [form.title, isEdit]);

  const handleSubmit = () => {
    if (!form.title.trim() || !form.content.trim()) return;
    const input: CreateBlogPostInput = {
      title: form.title,
      slug: form.slug,
      category: form.category,
      content: form.content,
      excerpt: form.excerpt,
      metaDescription: form.metaDescription,
      featuredImageUrl: form.featuredImageUrl,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      isPublished: form.isPublished,
    };

    if (isEdit && post) {
      update(
        { id: post.id, input },
        {
          onSuccess: () => {
            toast.success("Post updated");
            onClose();
          },
          onError: () => toast.error("Failed to update post"),
        },
      );
    } else {
      create(input, {
        onSuccess: () => {
          toast.success("Post created");
          onClose();
        },
        onError: () => toast.error("Failed to create post"),
      });
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Post" : "New Blog Post"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="post-title">Title *</Label>
              <Input
                id="post-title"
                placeholder="Enter post title"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                data-ocid="post-title-input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="post-slug">Slug</Label>
              <Input
                id="post-slug"
                placeholder="auto-generated-from-title"
                value={form.slug}
                onChange={(e) => set("slug", e.target.value)}
                data-ocid="post-slug-input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="post-category">Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => set("category", v)}
              >
                <SelectTrigger
                  id="post-category"
                  data-ocid="post-category-select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="post-content">Content *</Label>
            <Textarea
              id="post-content"
              placeholder="Write your post content here…"
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
              rows={8}
              className="font-mono text-sm"
              data-ocid="post-content-input"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="post-excerpt">Excerpt</Label>
            <Textarea
              id="post-excerpt"
              placeholder="Short summary shown in listings"
              value={form.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
              rows={2}
              data-ocid="post-excerpt-input"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="post-meta">Meta Description</Label>
            <Input
              id="post-meta"
              placeholder="SEO meta description (150–160 chars)"
              value={form.metaDescription}
              onChange={(e) => set("metaDescription", e.target.value)}
              data-ocid="post-meta-input"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="post-image">Featured Image URL</Label>
            <Input
              id="post-image"
              placeholder="https://…"
              value={form.featuredImageUrl}
              onChange={(e) => set("featuredImageUrl", e.target.value)}
              data-ocid="post-image-input"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="post-tags">Tags</Label>
            <Input
              id="post-tags"
              placeholder="real estate, buying, tips (comma separated)"
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
              data-ocid="post-tags-input"
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="post-publish"
              checked={form.isPublished}
              onCheckedChange={(v) => set("isPublished", !!v)}
              data-ocid="post-publish-toggle"
            />
            <Label htmlFor="post-publish" className="cursor-pointer">
              Publish immediately
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || !form.title.trim() || !form.content.trim()}
            data-ocid="post-submit-btn"
          >
            {isPending ? "Saving…" : isEdit ? "Update Post" : "Create Post"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PostSkeleton() {
  return (
    <div className="space-y-2">
      {["p1", "p2", "p3", "p4", "p5"].map((k) => (
        <div
          key={k}
          className="flex items-center gap-4 p-4 border border-border rounded-lg"
        >
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-3 w-28" />
          </div>
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
      ))}
    </div>
  );
}

function PostRow({
  post,
  onEdit,
}: { post: BlogPost; onEdit: (p: BlogPost) => void }) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { mutate: deletePost } = useDeleteBlogPost();

  const catLabel =
    CATEGORIES.find((c) => c.value === post.category)?.label ?? post.category;

  return (
    <>
      <div
        className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border hover:border-primary/30 transition-colors"
        data-ocid={`post-row-${post.id}`}
      >
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-foreground truncate">
            {post.title}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {catLabel} ·{" "}
            {new Date(Number(post.createdAt) / 1_000_000).toLocaleDateString()}
          </p>
        </div>

        <Badge variant={post.isPublished ? "default" : "outline"}>
          {post.isPublished ? "Published" : "Draft"}
        </Badge>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs"
            onClick={() => onEdit(post)}
            data-ocid="edit-post-btn"
          >
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-xs text-destructive hover:bg-destructive/5"
            onClick={() => setDeleteOpen(true)}
            data-ocid="delete-post-btn"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {deleteOpen && (
        <AlertDialog open onOpenChange={setDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete post?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete "{post.title}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  deletePost(post.id, {
                    onSuccess: () => toast.success("Post deleted"),
                    onError: () => toast.error("Failed to delete post"),
                  });
                  setDeleteOpen(false);
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}

export default function AdminContentPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editPost, setEditPost] = useState<BlogPost | null>(null);
  const { data: posts, isLoading } = useBlogPosts(null, false);

  const openCreate = () => {
    setEditPost(null);
    setFormOpen(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditPost(post);
    setFormOpen(true);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Content / Blog
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage blog posts and articles
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="gap-2 flex-shrink-0"
          data-ocid="create-post-btn"
        >
          <Plus className="h-4 w-4" /> New Post
        </Button>
      </div>

      <div className="space-y-3" data-ocid="posts-table">
        {isLoading ? (
          <PostSkeleton />
        ) : !posts || posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <FileText className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground">No posts yet</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Create your first blog post to get started.
            </p>
            <Button
              onClick={openCreate}
              size="sm"
              data-ocid="empty-create-post-btn"
            >
              <Plus className="h-4 w-4 mr-1.5" /> Create Post
            </Button>
          </div>
        ) : (
          posts.map((post) => (
            <PostRow key={String(post.id)} post={post} onEdit={openEdit} />
          ))
        )}
      </div>

      {formOpen && (
        <PostFormDialog post={editPost} onClose={() => setFormOpen(false)} />
      )}
    </div>
  );
}
