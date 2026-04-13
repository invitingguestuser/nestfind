import Common "common";

module {
  public type BlogCategory = {
    #buyingGuide;
    #rentalGuide;
    #marketTrends;
    #news;
  };

  public type BlogPost = {
    id : Common.BlogPostId;
    title : Text;
    slug : Text;
    content : Text;
    excerpt : Text;
    featuredImageUrl : Text;
    category : BlogCategory;
    authorId : Common.UserId;
    publishedAt : ?Common.Timestamp;
    isPublished : Bool;
    metaDescription : Text;
    tags : [Text];
    createdAt : Common.Timestamp;
    updatedAt : Common.Timestamp;
  };

  public type CreateBlogPostInput = {
    title : Text;
    slug : Text;
    content : Text;
    excerpt : Text;
    featuredImageUrl : Text;
    category : BlogCategory;
    metaDescription : Text;
    tags : [Text];
    isPublished : Bool;
  };

  public type UpdateBlogPostInput = {
    title : ?Text;
    slug : ?Text;
    content : ?Text;
    excerpt : ?Text;
    featuredImageUrl : ?Text;
    category : ?BlogCategory;
    metaDescription : ?Text;
    tags : ?[Text];
    isPublished : ?Bool;
  };
};
