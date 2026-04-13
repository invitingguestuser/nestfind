import Common "../types/common";
import Types "../types/users";
import List "mo:core/List";
import Time "mo:core/Time";
import Principal "mo:core/Principal";

module {
  public func registerUser(
    users : List.List<Types.User>,
    caller : Common.UserId,
    input : Types.RegisterUserInput,
  ) : Types.User {
    // Return existing user if already registered
    switch (users.find(func(u) { Principal.equal(u.principalId, caller) })) {
      case (?existing) { existing };
      case null {
        let user : Types.User = {
          principalId = caller;
          email = input.email;
          name = input.name;
          phone = input.phone;
          role = input.role;
          avatarUrl = input.avatarUrl;
          createdAt = Time.now();
          isActive = true;
          isVerified = false;
        };
        users.add(user);
        user;
      };
    };
  };

  public func updateUser(
    users : List.List<Types.User>,
    caller : Common.UserId,
    input : Types.UpdateUserInput,
  ) : ?Types.User {
    var updated : ?Types.User = null;
    users.mapInPlace(func(u) {
      if (Principal.equal(u.principalId, caller)) {
        let upd : Types.User = {
          u with
          email = switch (input.email) { case (?v) v; case null u.email };
          name = switch (input.name) { case (?v) v; case null u.name };
          phone = switch (input.phone) { case (?v) v; case null u.phone };
          avatarUrl = switch (input.avatarUrl) { case (?v) v; case null u.avatarUrl };
        };
        updated := ?upd;
        upd;
      } else { u };
    });
    updated;
  };

  public func getUser(
    users : List.List<Types.User>,
    principalId : Common.UserId,
  ) : ?Types.User {
    users.find(func(u) { Principal.equal(u.principalId, principalId) });
  };

  public func getUserByPrincipal(
    users : List.List<Types.User>,
    principalId : Common.UserId,
  ) : ?Types.User {
    users.find(func(u) { Principal.equal(u.principalId, principalId) });
  };

  public func listAllUsers(
    users : List.List<Types.User>,
  ) : [Types.User] {
    users.toArray();
  };

  public func deactivateUser(
    users : List.List<Types.User>,
    principalId : Common.UserId,
  ) : Bool {
    var found = false;
    users.mapInPlace(func(u) {
      if (Principal.equal(u.principalId, principalId)) {
        found := true;
        { u with isActive = false };
      } else { u };
    });
    found;
  };

  public func activateUser(
    users : List.List<Types.User>,
    principalId : Common.UserId,
  ) : Bool {
    var found = false;
    users.mapInPlace(func(u) {
      if (Principal.equal(u.principalId, principalId)) {
        found := true;
        { u with isActive = true };
      } else { u };
    });
    found;
  };

  public func setUserRole(
    users : List.List<Types.User>,
    principalId : Common.UserId,
    role : Types.UserRole,
  ) : ?Types.User {
    var updated : ?Types.User = null;
    users.mapInPlace(func(u) {
      if (Principal.equal(u.principalId, principalId)) {
        let upd : Types.User = { u with role };
        updated := ?upd;
        upd;
      } else { u };
    });
    updated;
  };

  public func isAdmin(
    users : List.List<Types.User>,
    principalId : Common.UserId,
  ) : Bool {
    switch (users.find(func(u) { Principal.equal(u.principalId, principalId) })) {
      case (?u) { u.role == #admin };
      case null { false };
    };
  };
};
