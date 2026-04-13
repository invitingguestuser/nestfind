import Common "common";

module {
  public type UserRole = {
    #buyer;
    #agent;
    #admin;
  };

  public type User = {
    principalId : Common.UserId;
    email : Text;
    name : Text;
    phone : Text;
    role : UserRole;
    avatarUrl : Text;
    createdAt : Common.Timestamp;
    isActive : Bool;
    isVerified : Bool;
  };

  public type RegisterUserInput = {
    email : Text;
    name : Text;
    phone : Text;
    role : UserRole;
    avatarUrl : Text;
  };

  public type UpdateUserInput = {
    email : ?Text;
    name : ?Text;
    phone : ?Text;
    avatarUrl : ?Text;
  };
};
