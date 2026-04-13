import PropTypes "../types/properties";
import UserTypes "../types/users";
import InqTypes "../types/inquiries";
import BlogTypes "../types/blog";
import List "mo:core/List";

module {
  public type AdminStats = {
    totalListings : Nat;
    pendingApprovals : Nat;
    activeUsers : Nat;
    totalInquiries : Nat;
    totalBlogPosts : Nat;
  };

  public func getAdminStats(
    properties : List.List<PropTypes.Property>,
    users : List.List<UserTypes.User>,
    inquiries : List.List<InqTypes.Inquiry>,
    posts : List.List<BlogTypes.BlogPost>,
  ) : AdminStats {
    let totalListings = properties.filter(func(p) { p.status != #inactive }).size();
    let pendingApprovals = properties.filter(func(p) { p.status == #pending }).size();
    let activeUsers = users.filter(func(u) { u.isActive }).size();
    let totalInquiries = inquiries.size();
    let totalBlogPosts = posts.filter(func(p) { p.isPublished }).size();
    { totalListings; pendingApprovals; activeUsers; totalInquiries; totalBlogPosts };
  };
};
