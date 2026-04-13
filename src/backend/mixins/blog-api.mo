import Common "../types/common";
import BlogTypes "../types/blog";
import BlogLib "../lib/blog";
import UserLib "../lib/users";
import UserTypes "../types/users";
import List "mo:core/List";
import Runtime "mo:core/Runtime";

mixin (
  blogPosts : List.List<BlogTypes.BlogPost>,
  users : List.List<UserTypes.User>,
) {
  var nextBlogPostId : Nat = blogPosts.size() + 1;

  public shared ({ caller }) func createBlogPost(input : BlogTypes.CreateBlogPostInput) : async BlogTypes.BlogPost {
    if (not UserLib.isAdmin(users, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    let (post, newId) = BlogLib.createBlogPost(blogPosts, nextBlogPostId, caller, input);
    nextBlogPostId := newId;
    post;
  };

  public shared ({ caller }) func updateBlogPost(postId : Common.BlogPostId, input : BlogTypes.UpdateBlogPostInput) : async ?BlogTypes.BlogPost {
    if (not UserLib.isAdmin(users, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    BlogLib.updateBlogPost(blogPosts, caller, postId, input);
  };

  public shared ({ caller }) func deleteBlogPost(postId : Common.BlogPostId) : async Bool {
    if (not UserLib.isAdmin(users, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    BlogLib.deleteBlogPost(blogPosts, caller, postId);
  };

  public query func getBlogPost(postId : Common.BlogPostId) : async ?BlogTypes.BlogPost {
    BlogLib.getBlogPost(blogPosts, postId);
  };

  public query func getBlogPostBySlug(slug : Text) : async ?BlogTypes.BlogPost {
    BlogLib.getBlogPostBySlug(blogPosts, slug);
  };

  public query func listBlogPosts(category : ?BlogTypes.BlogCategory, isPublished : ?Bool) : async [BlogTypes.BlogPost] {
    BlogLib.listBlogPosts(blogPosts, category, isPublished);
  };
};
