import Common "../types/common";
import InqTypes "../types/inquiries";
import InqLib "../lib/inquiries";
import UserLib "../lib/users";
import UserTypes "../types/users";
import List "mo:core/List";
import Runtime "mo:core/Runtime";

mixin (
  inquiries : List.List<InqTypes.Inquiry>,
  users : List.List<UserTypes.User>,
) {
  var nextInquiryId : Nat = inquiries.size() + 1;

  public shared ({ caller }) func createInquiry(input : InqTypes.CreateInquiryInput) : async InqTypes.Inquiry {
    let (inquiry, newId) = InqLib.createInquiry(inquiries, nextInquiryId, caller, input);
    nextInquiryId := newId;
    inquiry;
  };

  public query func getInquiry(inquiryId : Common.InquiryId) : async ?InqTypes.Inquiry {
    InqLib.getInquiry(inquiries, inquiryId);
  };

  public query func listInquiryByProperty(propertyId : Common.PropertyId) : async [InqTypes.Inquiry] {
    InqLib.listInquiryByProperty(inquiries, propertyId);
  };

  public query ({ caller }) func listInquiryByUser() : async [InqTypes.Inquiry] {
    InqLib.listInquiryByUser(inquiries, caller);
  };

  public shared ({ caller }) func listAllInquiries() : async [InqTypes.Inquiry] {
    if (not UserLib.isAdmin(users, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    InqLib.listAllInquiries(inquiries);
  };

  public shared ({ caller }) func updateInquiryStatus(inquiryId : Common.InquiryId, status : InqTypes.InquiryStatus) : async ?InqTypes.Inquiry {
    if (not UserLib.isAdmin(users, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    InqLib.updateInquiryStatus(inquiries, inquiryId, status);
  };
};
