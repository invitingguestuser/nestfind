import Common "../types/common";
import Types "../types/moderation";
import List "mo:core/List";
import Time "mo:core/Time";

module {
  public func flagContent(
    flags : List.List<Types.FlaggedContent>,
    nextId : Nat,
    caller : Common.UserId,
    input : Types.CreateFlagInput,
  ) : (Types.FlaggedContent, Nat) {
    let flag : Types.FlaggedContent = {
      id = nextId;
      contentType = input.contentType;
      contentId = input.contentId;
      reason = input.reason;
      reportedBy = caller;
      createdAt = Time.now();
      status = #pending;
    };
    flags.add(flag);
    (flag, nextId + 1);
  };

  public func listFlaggedContent(
    flags : List.List<Types.FlaggedContent>,
  ) : [Types.FlaggedContent] {
    flags.toArray();
  };

  public func reviewFlaggedContent(
    flags : List.List<Types.FlaggedContent>,
    flagId : Common.FlagId,
    action : Types.FlagAction,
  ) : ?Types.FlaggedContent {
    var updated : ?Types.FlaggedContent = null;
    flags.mapInPlace(func(f) {
      if (f.id == flagId) {
        let newStatus : Types.FlagStatus = switch (action) {
          case (#dismiss) { #reviewed };
          case (#remove) { #removed };
        };
        let upd : Types.FlaggedContent = { f with status = newStatus };
        updated := ?upd;
        upd;
      } else { f };
    });
    updated;
  };
};
