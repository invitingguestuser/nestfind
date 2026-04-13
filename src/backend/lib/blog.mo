import Common "../types/common";
import Types "../types/blog";
import List "mo:core/List";
import Time "mo:core/Time";

module {
  public func createBlogPost(
    posts : List.List<Types.BlogPost>,
    nextId : Nat,
    caller : Common.UserId,
    input : Types.CreateBlogPostInput,
  ) : (Types.BlogPost, Nat) {
    let now = Time.now();
    let post : Types.BlogPost = {
      id = nextId;
      title = input.title;
      slug = input.slug;
      content = input.content;
      excerpt = input.excerpt;
      featuredImageUrl = input.featuredImageUrl;
      category = input.category;
      authorId = caller;
      publishedAt = if (input.isPublished) ?now else null;
      isPublished = input.isPublished;
      metaDescription = input.metaDescription;
      tags = input.tags;
      createdAt = now;
      updatedAt = now;
    };
    posts.add(post);
    (post, nextId + 1);
  };

  public func updateBlogPost(
    posts : List.List<Types.BlogPost>,
    _caller : Common.UserId,
    postId : Common.BlogPostId,
    input : Types.UpdateBlogPostInput,
  ) : ?Types.BlogPost {
    let now = Time.now();
    var updated : ?Types.BlogPost = null;
    posts.mapInPlace(func(p) {
      if (p.id == postId) {
        let newPublished = switch (input.isPublished) { case (?v) v; case null p.isPublished };
        let newPublishedAt = if (newPublished and p.publishedAt == null) ?now else p.publishedAt;
        let upd : Types.BlogPost = {
          p with
          title = switch (input.title) { case (?v) v; case null p.title };
          slug = switch (input.slug) { case (?v) v; case null p.slug };
          content = switch (input.content) { case (?v) v; case null p.content };
          excerpt = switch (input.excerpt) { case (?v) v; case null p.excerpt };
          featuredImageUrl = switch (input.featuredImageUrl) { case (?v) v; case null p.featuredImageUrl };
          category = switch (input.category) { case (?v) v; case null p.category };
          metaDescription = switch (input.metaDescription) { case (?v) v; case null p.metaDescription };
          tags = switch (input.tags) { case (?v) v; case null p.tags };
          isPublished = newPublished;
          publishedAt = newPublishedAt;
          updatedAt = now;
        };
        updated := ?upd;
        upd;
      } else { p };
    });
    updated;
  };

  public func deleteBlogPost(
    posts : List.List<Types.BlogPost>,
    _caller : Common.UserId,
    postId : Common.BlogPostId,
  ) : Bool {
    var found = false;
    posts.mapInPlace(func(p) {
      if (p.id == postId) {
        found := true;
        { p with isPublished = false };
      } else { p };
    });
    found;
  };

  public func getBlogPost(
    posts : List.List<Types.BlogPost>,
    postId : Common.BlogPostId,
  ) : ?Types.BlogPost {
    posts.find(func(p) { p.id == postId });
  };

  public func getBlogPostBySlug(
    posts : List.List<Types.BlogPost>,
    slug : Text,
  ) : ?Types.BlogPost {
    posts.find(func(p) { p.slug == slug and p.isPublished });
  };

  public func listBlogPosts(
    posts : List.List<Types.BlogPost>,
    category : ?Types.BlogCategory,
    isPublished : ?Bool,
  ) : [Types.BlogPost] {
    posts.filter(func(p) {
      let catMatch = switch (category) {
        case (?c) { p.category == c };
        case null { true };
      };
      let pubMatch = switch (isPublished) {
        case (?pub) { p.isPublished == pub };
        case null { true };
      };
      catMatch and pubMatch;
    }).toArray();
  };
};
