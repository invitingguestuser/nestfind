import Common "../types/common";
import Types "../types/inquiries";
import List "mo:core/List";
import Time "mo:core/Time";
import Principal "mo:core/Principal";

module {
  public func createInquiry(
    inquiries : List.List<Types.Inquiry>,
    nextId : Nat,
    caller : Common.UserId,
    input : Types.CreateInquiryInput,
  ) : (Types.Inquiry, Nat) {
    let inquiry : Types.Inquiry = {
      id = nextId;
      propertyId = input.propertyId;
      userId = caller;
      inquiryType = input.inquiryType;
      message = input.message;
      contactDetails = input.contactDetails;
      preferredTime = input.preferredTime;
      status = #pending;
      createdAt = Time.now();
    };
    inquiries.add(inquiry);
    (inquiry, nextId + 1);
  };

  public func getInquiry(
    inquiries : List.List<Types.Inquiry>,
    inquiryId : Common.InquiryId,
  ) : ?Types.Inquiry {
    inquiries.find(func(i) { i.id == inquiryId });
  };

  public func listInquiryByProperty(
    inquiries : List.List<Types.Inquiry>,
    propertyId : Common.PropertyId,
  ) : [Types.Inquiry] {
    inquiries.filter(func(i) { i.propertyId == propertyId }).toArray();
  };

  public func listInquiryByUser(
    inquiries : List.List<Types.Inquiry>,
    userId : Common.UserId,
  ) : [Types.Inquiry] {
    inquiries.filter(func(i) { Principal.equal(i.userId, userId) }).toArray();
  };

  public func listAllInquiries(
    inquiries : List.List<Types.Inquiry>,
  ) : [Types.Inquiry] {
    inquiries.toArray();
  };

  public func updateInquiryStatus(
    inquiries : List.List<Types.Inquiry>,
    inquiryId : Common.InquiryId,
    status : Types.InquiryStatus,
  ) : ?Types.Inquiry {
    var updated : ?Types.Inquiry = null;
    inquiries.mapInPlace(func(i) {
      if (i.id == inquiryId) {
        let upd : Types.Inquiry = { i with status };
        updated := ?upd;
        upd;
      } else { i };
    });
    updated;
  };
};
