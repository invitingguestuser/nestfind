import Common "../types/common";
import UserTypes "../types/users";
import UserLib "../lib/users";
import List "mo:core/List";
import Runtime "mo:core/Runtime";

mixin (
  users : List.List<UserTypes.User>,
) {
  public shared ({ caller }) func registerUser(input : UserTypes.RegisterUserInput) : async UserTypes.User {
    UserLib.registerUser(users, caller, input);
  };

  public shared ({ caller }) func updateUser(input : UserTypes.UpdateUserInput) : async ?UserTypes.User {
    UserLib.updateUser(users, caller, input);
  };

  public query func getUser(principalId : Common.UserId) : async ?UserTypes.User {
    UserLib.getUser(users, principalId);
  };

  public query ({ caller }) func getUserByPrincipal() : async ?UserTypes.User {
    UserLib.getUserByPrincipal(users, caller);
  };

  public shared ({ caller }) func listAllUsers() : async [UserTypes.User] {
    if (not UserLib.isAdmin(users, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    UserLib.listAllUsers(users);
  };

  public shared ({ caller }) func deactivateUser(principalId : Common.UserId) : async Bool {
    if (not UserLib.isAdmin(users, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    UserLib.deactivateUser(users, principalId);
  };

  public shared ({ caller }) func activateUser(principalId : Common.UserId) : async Bool {
    if (not UserLib.isAdmin(users, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    UserLib.activateUser(users, principalId);
  };

  public shared ({ caller }) func setUserRole(principalId : Common.UserId, role : UserTypes.UserRole) : async ?UserTypes.User {
    if (not UserLib.isAdmin(users, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    UserLib.setUserRole(users, principalId, role);
  };
};
