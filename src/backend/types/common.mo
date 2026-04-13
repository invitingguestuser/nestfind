module {
  public type Timestamp = Int;
  public type PropertyId = Nat;
  public type UserId = Principal;
  public type InquiryId = Nat;
  public type BlogPostId = Nat;
  public type LocationId = Nat;
  public type FlagId = Nat;

  public type Page<T> = {
    items : [T];
    total : Nat;
    page : Nat;
    pageSize : Nat;
  };
};
