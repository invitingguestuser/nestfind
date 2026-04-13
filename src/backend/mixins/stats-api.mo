import PropTypes "../types/properties";
import UserTypes "../types/users";
import InqTypes "../types/inquiries";
import BlogTypes "../types/blog";
import StatsLib "../lib/stats";
import UserLib "../lib/users";
import List "mo:core/List";
import Runtime "mo:core/Runtime";

mixin (
  properties : List.List<PropTypes.Property>,
  users : List.List<UserTypes.User>,
  inquiries : List.List<InqTypes.Inquiry>,
  blogPosts : List.List<BlogTypes.BlogPost>,
) {
  public shared ({ caller }) func getAdminStats() : async StatsLib.AdminStats {
    if (not UserLib.isAdmin(users, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    StatsLib.getAdminStats(properties, users, inquiries, blogPosts);
  };
};
