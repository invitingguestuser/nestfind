import Common "../types/common";
import ModTypes "../types/moderation";
import ModLib "../lib/moderation";
import PropTypes "../types/properties";
import BlogTypes "../types/blog";
import UserLib "../lib/users";
import UserTypes "../types/users";
import List "mo:core/List";
import Runtime "mo:core/Runtime";

mixin (
  flags : List.List<ModTypes.FlaggedContent>,
  users : List.List<UserTypes.User>,
  properties : List.List<PropTypes.Property>,
  blogPosts : List.List<BlogTypes.BlogPost>,
) {
  var nextFlagId : Nat = flags.size() + 1;

  public shared ({ caller }) func flagContent(input : ModTypes.CreateFlagInput) : async ModTypes.FlaggedContent {
    let (flag, newId) = ModLib.flagContent(flags, nextFlagId, caller, input);
    nextFlagId := newId;
    flag;
  };

  public shared ({ caller }) func listFlaggedContent() : async [ModTypes.FlaggedContent] {
    if (not UserLib.isAdmin(users, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    ModLib.listFlaggedContent(flags);
  };

  public shared ({ caller }) func reviewFlaggedContent(flagId : Common.FlagId, action : ModTypes.FlagAction) : async ?ModTypes.FlaggedContent {
    if (not UserLib.isAdmin(users, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    let result = ModLib.reviewFlaggedContent(flags, flagId, action);
    // If action is #remove, find the flag and mark the content as inactive/unpublished
    switch (result) {
      case (?flag) {
        if (action == #remove) {
          switch (flag.contentType) {
            case (#property) {
              properties.mapInPlace(func(p) {
                if (p.id == flag.contentId) { { p with status = #inactive } } else { p };
              });
            };
            case (#blogPost) {
              blogPosts.mapInPlace(func(p) {
                if (p.id == flag.contentId) { { p with isPublished = false } } else { p };
              });
            };
          };
        };
      };
      case null {};
    };
    result;
  };
};
