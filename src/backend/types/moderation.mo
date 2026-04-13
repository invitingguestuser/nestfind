import Common "common";

module {
  public type ContentType = {
    #property;
    #blogPost;
  };

  public type FlagStatus = {
    #pending;
    #reviewed;
    #removed;
  };

  public type FlagAction = {
    #dismiss;
    #remove;
  };

  public type FlaggedContent = {
    id : Common.FlagId;
    contentType : ContentType;
    contentId : Nat;
    reason : Text;
    reportedBy : Common.UserId;
    createdAt : Common.Timestamp;
    status : FlagStatus;
  };

  public type CreateFlagInput = {
    contentType : ContentType;
    contentId : Nat;
    reason : Text;
  };
};
